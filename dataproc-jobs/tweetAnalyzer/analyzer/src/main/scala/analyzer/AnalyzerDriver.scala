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
                          .agg(count("language").alias("langCount"))
                          .groupBy("country_code")
                          .agg(collect_set(struct(col("language"), col("langCount")))
                          .alias("geoJSON"))
      countriesDf.show()
    }

    println("Countries and language counts")
    getCountriesStats()

    def getHashLangsMergedWithPrecision( precision: Int ): DataFrame = {
      precision match {
        case i if i >= 3 && i < 6 => {
          df.select(col("*"), substring(col("geohash"), 0, precision).as("subGeohash"))
                    .groupBy("subGeohash", "language")
                    .agg(
                      count("language").alias("langCount")
                    )
                    .groupBy("subGeohash")
                    .agg(collect_set(struct(col("language"), col("langCount")))
                    .alias("geoJSON"))
        }
        case 6 | _ =>  {
          df.groupBy("geohash", "language")
            .agg(
              count("language").alias("langCount")
            )
            .groupBy("geohash")
            .agg(collect_set(struct(col("language"), col("langCount")))
            .alias("geoJSON"))
        }
      }
    }
    
    // each row is a geohash, and a list of languages and their counts
    // ex: eyd68x: [["pt", 1], ["en", 5]]
    val hexash = getHashLangsMergedWithPrecision(6)
    hexash.show()

    // val pentash = getHashLangsMergedWithPrecision(5)
    // pentash.show()

    // val quartash = getHashLangsMergedWithPrecision(4)
    // quartash.show()

    // val triash = getHashLangsMergedWithPrecision(1)
    // triash.show()

    // 
    hexash.write
              .format("org.apache.spark.sql.redis")
              .option("table", "hexash")
              .mode(SaveMode.Append)
              .save()

    // writing hashes and languages to file
    // coalesce(1) is merging all partitions of dataframe into one, so only 1 file is written
    // hashLangsMerged.coalesce(1)
    //   .write.format("com.databricks.spark.csv")
    //   .option("header", "true").save("gs://dataproctst/batchLogs/batch" + batchNum)

    spark.stop()
    println("Job complete")
  }
}