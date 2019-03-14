const request = require('request');
const express = require("express");
const app = express();
const port = 3000;
const googleapi = "https://dataproc.googleapis.com";

// Homepage Route
app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/languages", (req, res) => {
  const resource = "/v1/projects/celtic-vent-231205/regions/global/jobs:submit/"
  const opts = {
    "url": `${googleapi}${resource}`,
    "json": true,
    "body": {
      "projectId": "celtic-vent-231205",
      "job": {
        "placement": {
          "clusterName": "celticventcluster"
        },
        "reference": {
          "jobId": "job-07a4f20c"
        },
        "hadoopJob": {
            "args": [
            "wordcount-hbase",
            "gs://lesv-big-public-data/books/book",
            "gs://lesv-big-public-data/books/b10",
            "gs://lesv-big-public-data/books/b100",
            "gs://lesv-big-public-data/books/b1232",
            "gs://lesv-big-public-data/books/b6130",
            "WordCount-1552544215"
          ],
          "mainClass": "gs://testbucketcelticvent/google-cloud-dataproc-metainfo/84edc588-da8a-4bdf-881b-c395c5e76ba7/jobs/99e233bd0fd0439391b3573d605abdb6/staging/wordcount-mapreduce-0-SNAPSHOT-jar-with-dependencies.jar"
        }
      }
    }
  };

  // TODO: Need to create a service worker and authenicate it for the request to be accepted
  request.post(opts, function(err, response, body){ 
    console.log(`Error: ${err}`);
    console.log(`Response: ${JSON.stringify(response)}`);
    console.log(`Body: ${body}`);
  });

  console.log("Called languages route");
  const test = {
    hi: 2,
    hello: "string"
  };
  res.json(test);
});

app.listen(port, () => console.log(`Example app is listening on port ${port}`));
