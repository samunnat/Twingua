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
  
    // The schema is encoded in a string
  val schemaString = ""

  // Generate the schema based on the string of schema
  // val fields = schemaString.split(" ")
  //   .map(fieldName => StructField(fieldName, StringType, nullable = true))
  // val analyticsSchema = StructType(fields)

  def main(args: Array[String]) {

    val batchNum = args(0)

    val spark = SparkSession
    .builder()
    .appName("Tweet Analyzer")
    .config("spark.redis.host", "10.0.0.3")
    .config("spark.redis.port", "6379")
    .getOrCreate()

    val sc = spark.sparkContext
    val sqlContext = spark.sqlContext

    import sqlContext.implicits._

    def getHbaseDataframe(cat: String): DataFrame = {
      val filteredDf = sqlContext
                        .read
                        .options(Map(HBaseTableCatalog.tableCatalog->cat))
                        .format("org.apache.spark.sql.execution.datasources.hbase")
                        .load()
                        .filter($"id" > (batchNum+"_") && $"id" <= (batchNum+"`"))  // ` is after _ in lexicographical order
      
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

    def getCountriesStats() = {
      val countriesDf = df.groupBy("country_code", "language")
                          .agg(
                            count("language").alias("langCount")
                          )
                          .groupBy("country_code")
                          .agg(collect_set(struct(col("language"), col("langCount"))).alias("geoJSON"))
      countriesDf.show()
    }

    // println("Countries and language counts")
    // getCountriesStats()

    def getHashLangsMergedWithPrecision( precision: Int ): DataFrame = {
      precision match {
        case i if i >= 3 && i < 6 => {
          df.withColumn("subHash", substring($"geohash", 0, precision))
            .stat.crosstab("subHash", "language").withColumnRenamed("subhash_language", "geo")
        }
        case 6 | _ =>  {
          df.stat.crosstab("geohash", "language").withColumnRenamed("geohash_language", "geo")
        }
      }
    }

    def getJsonRDD( dataFr: DataFrame ) = {
      dataFr.select(col("geo"), to_json(struct(dataFr.drop("geo").col("*"))))
            .map( 
              row => (
                      "{" + "\"" + row.getString(0) + "\"" + ":" + row.getString(1) + "}", 
                      "0"   // sorted-set-score -> will be converted to double by spark-redis library later
                    ) 
            ).rdd
    }
    
    // each row is a geohash, and a list of languages and their counts
    // ex: eyd68x: [["pt", 1], ["en", 5]]
    val hexash = getHashLangsMergedWithPrecision(6)
    hexash.show()

    val hexashrdd = getJsonRDD(hexash)
    sc.toRedisZSET(hexashrdd, "geohash.6")

    val pentash = getHashLangsMergedWithPrecision(5)
    pentash.show()

    val quartash = getHashLangsMergedWithPrecision(4)
    quartash.show()

    val triash = getHashLangsMergedWithPrecision(3)
    triash.show()

    val triashrdd = getJsonRDD(triash)
    sc.toRedisZSET(triashrdd, "geohash.3")

    // writing hashes and languages to file
    // coalesce(1) is merging all partitions of dataframe into one, so only 1 file is written
    // hashLangsMerged.coalesce(1)
    //   .write.format("com.databricks.spark.csv")
    //   .option("header", "true").save("gs://dataproctst/batchLogs/batch" + batchNum)

    spark.stop()
    println("Job complete")
  }
}