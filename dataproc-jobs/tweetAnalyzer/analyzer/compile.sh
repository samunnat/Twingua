#! /bin/sh

if [ "$#" -ne 1 ]; then
    echo "Please enter the batch number you want the analytics for"
    exit 1
fi

batchFolderName="batch$1"

gsutil rm -rf gs://dataproctst/batchLogs/$batchFolderName

# exit when any command fails
set -e

sbt compile

sbt package

gcloud dataproc jobs submit spark --cluster testcl --region us-west1 --jar target/scala-2.11/analyzer.jar --jars gs://dataproctst/shc-core-1.1.1-2.1-s_2.11.jar,gs://dataproctst/jedis-2.9.0.jar,gs://dataproctst/commons-pool2-2.0.jar -- $1