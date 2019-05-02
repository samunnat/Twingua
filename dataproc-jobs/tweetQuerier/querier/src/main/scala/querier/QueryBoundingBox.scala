package com.twingua.querier

import com.github.davidmoten.geo.GeoHash
import org.apache.spark.sql.execution.datasources.hbase._
import org.apache.spark.sql.{DataFrame, SparkSession}
import scala.collection.JavaConverters._

object QueryBoundingBox extends App {
  /*
  * args: bounding box coords and hash length
  */
  override def main(args: Array[String]): Unit = {
    if (args.length != 5) {
      System.exit(1)
    }

    val spark = SparkSession
      .builder()
      .appName("Tweet Analyzer")
      .getOrCreate()

    val sc = spark.sparkContext
    val sqlContext = spark.sqlContext

    var geoHashes= GeoHash.coverBoundingBox(args(0).toDouble, args(1).toDouble, args(2).toDouble, args(3).toDouble, args(4).toInt ).getHashes().asScala

    val catalog =
    s"""{
        |"table":{"namespace":"default", "name":"analytics"},
        |"rowkey":"id",
        |"columns":{
          |"id":{"cf":"rowkey", "col":"id", "type":"string"},
          |"en":{"cf":"tweetFamily", "col":"retweet_count", "type":"string"}
        |}
      |}""".stripMargin

    import sqlContext.implicits._

    val df = spark
      .read
      .option(HBaseTableCatalog.tableCatalog, catalog)
      .format("org.apache.spark.sql.execution.datasources.hbase")
      .load()

    df.show

    println("FILTERED TABLE")

    val seqGeoHashes = geoHashes.toSeq
    println(seqGeoHashes.head)
    println(seqGeoHashes.last)
    println(seqGeoHashes)

    val df2 = df.filter($"id" >= seqGeoHashes.head && $"id" <= seqGeoHashes.last + "z")
    df2.show

    println("df2 count")
    println(df2.count)
    spark.stop()
    System.exit(0)
  }
}