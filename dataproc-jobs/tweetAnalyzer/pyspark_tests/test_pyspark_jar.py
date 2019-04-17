import sys
import imp
from pyspark import SparkContext
from py4j.java_gateway import java_import

sc=SparkContext()
jvm=sc._gateway.jvm
java_import(jvm, "com.github.davidmoten.geo.*")

print("Hello world")
print(jvm.GeoHash.encodeHash(float(55), float(55), 5))

hashes = jvm.GeoHash.coverBoundingBox(60.0, -24.0, 32.0, 33.0, 5 ).getHashes();
print(len(hashes))

jvm.System.getProperty("java.runtime.name")
print(sys.executable, sys.version_info)