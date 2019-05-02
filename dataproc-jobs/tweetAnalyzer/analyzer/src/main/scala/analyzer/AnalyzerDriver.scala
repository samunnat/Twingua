package com.twingua.analyzer

import com.github.davidmoten.geo.GeoHash
import org.apache.spark.sql.{DataFrame, SparkSession}
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
      // so casting them into integers for the dataframes
      // those these counts are currently all zeros for some reason
      filteredDf
        .withColumn("favCountInt", filteredDf("favCount").cast(IntegerType)).drop("favCount").withColumnRenamed("favCountInt", "favCount")
        .withColumn("quoteCountInt", filteredDf("quoteCount").cast(IntegerType)).drop("quoteCount").withColumnRenamed("quoteCountInt", "quoteCount")
        .withColumn("repCountInt", filteredDf("repCount").cast(IntegerType)).drop("repCount").withColumnRenamed("repCountInt", "repCount")
        .withColumn("retCountInt", filteredDf("retCount").cast(IntegerType)).drop("retCount").withColumnRenamed("retCountInt", "retCount")
    }

    val df = getHbaseDataframe(catalog)
    df.show()

    def getCountriesStats() {
      val countriesDf = df.groupBy("country_code", "language")
                          .agg(count("language").alias("langCount"))
                          .groupBy("country_code")
                          .agg(collect_list(struct(col("language"), col("langCount")))
                          .alias("geoJSON"))
      countriesDf.show()
    }
    println("Countries and language counts")
    getCountriesStats()

    // each row is a geohash, and a language count
    // ex: eyc7vc: ["en", 2]
    val hashLangs = df.groupBy("geohash", "language")
                      .agg(count("language").alias("langCount"))
    println("Geohashes and language counts")
    hashLangs.show()
    
    // each row is a geohash, and a list of languages and their counts
    // ex: eyd68x: [["pt", 1], ["en", 5]]
    val hashLangsMerged = hashLangs.groupBy("geohash")
                            .agg(collect_list(struct(col("language"), col("langCount")))
                            .alias("geoJSON"))
    hashLangsMerged.show()

    // writing hashes and languages to file
    // coalesce(1) is merging all partitions of dataframe into one, so only 1 file is written
    // hashLangsMerged.coalesce(1)
    //   .write.format("com.databricks.spark.csv")
    //   .option("header", "true").save("gs://dataproctst/batchLogs/batch" + batchNum)

    spark.stop()
    println("Job complete")
  }
}