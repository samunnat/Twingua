package com.twingua.analyzer

import com.github.davidmoten.geo.GeoHash
import org.apache.spark.sql.{DataFrame, SaveMode, SparkSession}
import org.apache.spark.sql.execution.datasources.hbase.{HBaseRelation, HBaseTableCatalog}
import org.apache.spark.sql.expressions.Aggregator;
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._
import org.apache.spark.streaming._
import com.redislabs.provider.redis._

object AnalyzerDriver{

  def uploadBatch(batchNum: Int, updateCountries: Boolean, updateGeoHashes: boolean) {

    val catalog =
    s"""{
      |"table":{"namespace":"default", "name":"tweets"},
      |"rowkey":"id",
      |"columns":{
        |"id":{"cf":"rowkey", "col":"id", "type":"string"},
        |"geohash":{"cf":"tweetFamily", "col":"boundinggeo", "type":"string"},
        |"geoCoord":{"cf":"tweetFamily", "col":"geo", "type":"string"},
        |"language":{"cf":"tweetFamily", "col":"lang", "type":"string"},
        |"country_code":{"cf":"tweetFamily", "col":"placecc", "type":"string"},
        |"favCount":{"cf":"tweetFamily", "col":"favorite_count", "type":"string"},
        |"quoteCount":{"cf":"tweetFamily", "col":"quote_count", "type":"string"},
        |"repCount":{"cf":"tweetFamily", "col":"reply_count", "type":"string"},
        |"retCount":{"cf":"tweetFamily", "col":"retweet_count", "type":"string"}
      |}
    |}""".stripMargin

    val spark = SparkSession
    .builder()
    .appName("Tweet Analyzer")
    .config("spark.redis.host", "10.0.0.3")
    .config("spark.redis.port", "6379")
    .getOrCreate()

    val sc = spark.sparkContext
    val sqlContext = spark.sqlContext

    import sqlContext.implicits._

    val allowedLangs = List("en", "ar", "bn", "cs", "da", "de", "el", "es", "fa", "fi", "fil", "fr", "he", "hi", "hu", "id", "it", "ja", "ko", "msa", "nl", "no", "pl", "pt", "ro", "ru", "sv", "th", "tr", "uk", "ur", "vi", "zh-cn", "zh-tw").map(x => "\"" + x + "\"")
    println(allowedLangs)

    def getHbaseDataframe(cat: String): DataFrame = {
      val filteredDf = sqlContext
                        .read
                        .options(Map(HBaseTableCatalog.tableCatalog->cat))
                        .format("org.apache.spark.sql.execution.datasources.hbase")
                        .load()
                        .filter( ($"language".isin(allowedLangs:_*))===true )
                        //.filter( $"id" > (batchNum+"_") && $"id" <= (batchNum+"`") && ($"language".isin(allowedLangs:_*))===true )  // ` is after _ in lexicographical order
      
      // Hbase has some numberical columns that it stores as strings
      // so casting them into integers in the dataframe
      // though these counts are currently all zeros in the hbase "tweets" table for some reason
      filteredDf
        .withColumn("favCountInt", filteredDf("favCount").cast(IntegerType)).drop("favCount").withColumnRenamed("favCountInt", "favCount")
        .withColumn("quoteCountInt", filteredDf("quoteCount").cast(IntegerType)).drop("quoteCount").withColumnRenamed("quoteCountInt", "quoteCount")
        .withColumn("repCountInt", filteredDf("repCount").cast(IntegerType)).drop("repCount").withColumnRenamed("repCountInt", "repCount")
        .withColumn("retCountInt", filteredDf("retCount").cast(IntegerType)).drop("retCount").withColumnRenamed("retCountInt", "retCount")
    }

    val df = getHbaseDataframe(catalog)
    df.show()

    def getHashLangCrossTab( geoPrecision: Int ): DataFrame = {
      geoPrecision match {
        case i if i > 0 && i < 6 => {
          val crossTabDf = df.withColumn("subHash", substring($"geohash", 0, geoPrecision))
            .stat.crosstab("subHash", "language").withColumnRenamed("subhash_language", "geo")
          
          crossTabDf.withColumn( "total", crossTabDf.columns.collect{ case x if x != "geo" => col(x) }.reduce(_ + _) )
        }
        case 6 | _ =>  {
          val crossTabDf = df.stat.crosstab("geohash", "language")
            .withColumnRenamed("geohash_language", "geo")
          
          crossTabDf.withColumn( "total", crossTabDf.drop("geo").columns.map(c => col(c)).reduce(_ + _) )
        }
      }
    }

    // def getMergedRDD( redisRDD, sparkRDD ) = {
    //   val geoRDD = sc.fromRedisKV("")
    // }

    def getJsonScoreRDD( dataFr: DataFrame, headerName: String, wrapHeader: Boolean ) = {
      val scoreDf = dataFr.select(col(headerName), to_json(struct(dataFr.drop(headerName).col("*"))))
      if( wrapHeader ) {
        scoreDf.map(
          row => (
                  "{" + "\"" + row.getString(0) + "\"" + ":" + row.getString(1) + "}"
                  ,"0"   // sorted-set-score -> will be converted to double by spark-redis library later
                ) 
        ).rdd
      }
      else {
        scoreDf.map(
          row => (
                  "{" + row.getString(0) + ":" + row.getString(1) + "}"
                  ,"0"   // sorted-set-score -> will be converted to double by spark-redis library later
                ) 
        ).rdd
      }
    }

    def writeCountryLangStats() = {
      val countriesDf = df.stat.crosstab("country_code", "language").withColumnRenamed("country_code_language", "country_code")
      val countriesDfWithTotals = countriesDf.withColumn( "total", countriesDf.drop("country_code").columns.map(c => col(c)).reduce(_ + _) )
      countriesDfWithTotals.select("country_code", "total").show()

      val countriesrdd = getJsonScoreRDD( countriesDfWithTotals, "country_code", false)
      countriesrdd.collect.foreach(println)
      sc.toRedisZSET(countriesrdd, "countries")
    }

    def writeGeohashLangStats( precisions: Array[Int] ) = {
      for( precision <- precisions ) {
        println("Writing geohash-precision-" + precision + " stats to Redis...")

        val geoDf = getHashLangCrossTab(precision)
        geoDf.limit(10).show()

        val geoJsonRDD = getJsonScoreRDD(geoDf, "geo", true)
        //geoJsonRDD.collect.foreach(println)
        sc.toRedisZSET(geoJsonRDD, "geohash."+precision)

        println("Precision " + precision + " write complete")
        println()
      }
    }
    
    var precisionsToWrite = Array(6, 5, 4, 3)

    writeGeohashLangStats(precisionsToWrite)
    //writeCountryLangStats()

    // writing hashes and languages to file
    // coalesce(1) is merging all partitions of dataframe into one, so only 1 file is written
    // hashLangsMerged.coalesce(1)
    //   .write.format("com.databricks.spark.csv")
    //   .option("header", "true").save("gs://dataproctst/batchLogs/batch" + batchNum)

    spark.stop()
    println("Job complete")

    incrementBatchNumber()
  }

  def incrementBatchNumber() = {

  }

  def main(args: Array[String]) = {
    println(args(0))

    val batchNum = args(0).toInt
    val updateCountries = args(1)==="true"
    val updateGeoHashes = args(2)==="true"

    uploadBatch(batchNum, updateCountries, updateGeoHashes)
  }
}