import sys
import imp
from pyspark import SparkConf, SparkContext
from pyspark.sql import SQLContext
from pyspark.sql import SparkSession
from py4j.java_gateway import java_import

if __name__ == "__main__":
    sc=SparkContext()

    sqlc = SQLContext(sc)

    data_source_format = 'org.apache.spark.sql.execution.datasources.hbase'

    catalog = ''.join("""{
    "table":{"namespace":"default", "name":"testtable"},
    "rowkey":"key",
    "columns":{
        "col0":{"cf":"rowkey", "col":"key", "type":"string"},
        "col1":{"cf":"cf", "col":"col1", "type":"string"}
    }
    }""".split())

    # Reading
    df = sqlc.read\
    .options(catalog=catalog)\
    .format(data_source_format)\
    .load()

    # jvm=sc._gateway.jvm
    # java_import(jvm, "com.github.davidmoten.geo.*")

    # print("Hello world")
    # print(jvm.GeoHash.encodeHash(float(55), float(55), 5))

    # hashes = jvm.GeoHash.coverBoundingBox(60.0, -24.0, 32.0, 33.0, 4 ).getHashes();
    # print(len(hashes))

    jvm.System.getProperty("java.runtime.name")
    print(sys.executable, sys.version_info)