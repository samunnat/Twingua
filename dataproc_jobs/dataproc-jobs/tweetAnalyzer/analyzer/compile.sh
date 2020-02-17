#! /bin/sh

if [ "$#" -ne 4 ];
then
    echo "Please enter arguments: compilepackage[yes/no], hbaseBatchNumber, updateCountries[yes/no], updateGeoHashes[yes/no]"
    exit 1
fi

# exit when any command fails
set -e

if [ $1 == "yes" ];
then
    echo "compiling and packaging"
    sbt compile
    sbt package
fi

batch=$2
updateCountries=$3
updateGeoHashes=$4

if [ $3 == "yes" ];
then
    updateCountries="true"
fi

batchFolderName="batch$batch"

gsutil rm -rf gs://dataproctst/batchLogs/$batchFolderName

# spark-redis 2.3.0 with dependencies
gcloud dataproc jobs submit spark --cluster testcl --region us-west1 --jar target/scala-2.11/analyzer.jar --jars gs://dataproctst/shc-core-1.1.1-2.1-s_2.11.jar,gs://dataproctst/jars/spark-redis-2.3.1-RC1-jar-with-dependencies.jar -- batch updateCountries

# spark-redis 2.3.0 separate dependencies
# gcloud dataproc jobs submit spark --cluster testcl --region us-west1 --jar target/scala-2.11/analyzer.jar --jars gs://dataproctst/shc-core-1.1.1-2.1-s_2.11.jar,gs://dataproctst/jars/spark-redis-2.3.0.jar,gs://dataproctst/jars/jedis-2.9.0.jar,gs://dataproctst/jars/commons-pool2-2.0.jar -- $1

# spark-redis 0.3.2 (rdds only)
# gcloud dataproc jobs submit spark --cluster testcl --region us-west1 --jar target/scala-2.11/analyzer.jar --jars gs://dataproctst/shc-core-1.1.1-2.1-s_2.11.jar,gs://dataproctst/jars/spark-redis-0.3.2.jar,gs://dataproctst/jars/jedis-2.7.2.jar -- $1