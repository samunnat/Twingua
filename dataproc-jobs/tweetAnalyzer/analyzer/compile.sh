#! /bin/sh

sbt compile
sbt package
gcloud dataproc jobs submit spark --cluster testcl --region us-west1 --jar target/scala-2.11/analyzer.jar --jars gs://dataproctst/shc-core-1.1.1-2.1-s_2.11.jar