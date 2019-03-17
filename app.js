const request = require("request");
const express = require("express");
const app = express();
const dataproc = require("@google-cloud/dataproc");
const credentials = require("/Users/Ryan_Loi/Downloads/celtic-vent-231205-27929c26f65b.json");

const client = new dataproc.v1.JobControllerClient({
  credentials: credentials
});

// Homepage Route
app.get("/", (req, res) => {
  res
    .status(200)
    .send("hello world")
    .end();
});

app.get("/languages", (req, res) => {
  console.log("Called languages route");

  const dataprocRequest = {
    projectId: "celtic-vent-231205",
    region: "global",
    // https://cloud.google.com/nodejs/docs/reference/dataproc/0.4.x/google.cloud.dataproc.v1#.Job
    job: {
      placement: {
        clusterName: "celticventcluster"
      },
      reference: {
        jobId: "job-07a4f20c"
      },
      hadoopJob: {
        args: [
          "wordcount-hbase",
          "gs://lesv-big-public-data/books/book",
          "gs://lesv-big-public-data/books/b10",
          "gs://lesv-big-public-data/books/b100",
          "gs://lesv-big-public-data/books/b1232",
          "gs://lesv-big-public-data/books/b6130",
          "WordCount-1552544215"
        ],
        mainClass:
          "gs://testbucketcelticvent/google-cloud-dataproc-metainfo/84edc588-da8a-4bdf-881b-c395c5e76ba7/jobs/99e233bd0fd0439391b3573d605abdb6/staging/wordcount-mapreduce-0-SNAPSHOT-jar-with-dependencies.jar"
      }
    }
  };

  client
    .submitJob(request)
    .then(responses => {
      const response = responses[0];
      console.log(`Response: ${JSON.stringify(response)}`);
    })
    .catch(err => {
      console.error(err);
    });

  const test = {
    hi: 2,
    hello: "string"
  };
  res.json(test);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
