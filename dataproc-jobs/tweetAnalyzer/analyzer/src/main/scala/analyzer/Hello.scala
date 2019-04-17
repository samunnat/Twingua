package com.twingua.analyzer

import com.github.davidmoten.geo.GeoHash
import org.apache.spark.sql.execution.datasources.hbase._
import org.apache.spark.sql.{DataFrame, SparkSession}
// import org.apache.hadoop.hbase._
//import com.hortonworks.shc.HBaseTableCatalog

case class HBaseRecord(
  col0: String,
  col1: Boolean,
  col2: Double,
  col3: Float,
  col4: Int,
  col5: Long,
  col6: Short,
  col7: String,
  col8: Byte
)

object HBaseRecord {
  def apply(i: Int): HBaseRecord = {
    val s = s"""row${"%03d".format(i)}"""
    HBaseRecord(s,
      i % 2 == 0,
      i.toDouble,
      i.toFloat,
      i,
      i.toLong,
      i.toShort,
      s"String$i extra",
      i.toByte)
  }
}

object Hello extends Greeting with App {
  println(GeoHash.encodeHash(55.0, 55.0, 5))
  val catalog =
  s"""{
      |"table":{"namespace":"default", "name":"tweettst"},
      |"rowkey":"key",
      |"columns":{
        |"retweets":{"cf":"tweetFamily", "col":"retweet_count", "type":"int"}
      |}
    |}""".stripMargin

  val spark = SparkSession
  .builder()
  .appName("Tweet Analyzer")
  .getOrCreate()

  val sc = spark.sparkContext
  val sqlContext = spark.sqlContext

  import sqlContext.implicits._

  // def withCatalog(cat: String): DataFrame = {
  //   sqlContext
  //     .read
  //     .options(Map(HBaseTableCatalog.tableCatalog->cat))
  //     .format("org.apache.spark.sql.execution.datasources.hbase")
  //     .load()
  // }

  val df = spark
    .read
    .option(HBaseTableCatalog.tableCatalog, catalog)
    .format("org.apache.spark.sql.execution.datasources.hbase")
    .load()

  println(df.count())

  spark.stop()
  println("hello world")
}

trait Greeting {
  lazy val greeting: String = "hello"
}