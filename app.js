const request = require("request");
const express = require("express");
const app = express();
const dataproc = require("@google-cloud/dataproc");
const credentials = require("/Users/Ryan_Loi/Downloads/big-data-project-233100-e78608d5e4c9.json");

const client = new dataproc.v1.JobControllerClient({
  credentials: credentials,
  // optional auth parameters.
  servicePath: "us-west1-dataproc.googleapis.com"
});

// Homepage Route
app.get("/", (req, res) => {
  console.log("Called root route");
  console.log(Object.keys(req.query).length);
  res
    .status(200)
    .send("hello world")
    .end();
});

// BulkLoad Route
//  - Uploads twitter json files from bucket into HBase
app.get("/BulkLoad", (req, res) => {
  console.log("Called BulkLoad route");

  if (Object.keys(req.query).length != 1 || req.query.filename === undefined) {
    console.log("Invalid argument");
    res.status(400).end();
  }

  const filename = req.query.filename;

  // Creating job request configuration to start BulkLoad
  const dataprocRequest = {
    // Request header
    // https://cloud.google.com/nodejs/docs/reference/dataproc/0.4.x/google.cloud.dataproc.v1#.Job
    projectId: "big-data-project-233100",
    region: "us-west1",
    job: {
      placement: {
        clusterName: "testcl"
      },
      hadoopJob: {
        args: [
          "com.twingua.hbase.bulkload.HBaseDriver",
          `gs://bigdata_tweet_dump/${filename}.json`,
          `gs://dataproctst/hfiles/${filename}`,
          "tweet"
        ],
        mainJarFileUri: "gs://dataproctst/hbase-bulkload-1.0.jar"
      }
    }
  };

  // TODO: Add in things to keep track of the job

  // Submitting job request to dataproc
  client
    .submitJob(dataprocRequest)
    .then(responses => {
      console.log("Job Submitted");
      res
        .status(200)
        .send("Job Submitted")
        .end();
    })
    .catch(err => console.log("Error:", err));
});

// Languages Route
//  - Gets counts of each language within each bounding box
app.get("/languages", (req, res) => {
  console.log("Called languages route");

  // Creating job request configuration to run Spark Job
  const dataprocRequest = {
    // Request header
    // https://cloud.google.com/nodejs/docs/reference/dataproc/0.4.x/google.cloud.dataproc.v1#.Job
    projectId: "big-data-project-233100",
    region: "us-west1",
    job: {
      placement: {
        clusterName: "testcl"
      },
      SparkJob: {
        args: [],
        mainJarFileUri: ""
      }
    }
  };
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
