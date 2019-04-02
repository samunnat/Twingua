const request = require("request");
const express = require("express");
const app = express();
const dataproc = require("@google-cloud/dataproc");
const credentials = require("/Users/Ryan_Loi/Downloads/big-data-project-233100-e78608d5e4c9.json");

// const client = new dataproc.v1.JobControllerClient({
//   credentials: credentials
// });

const client = new dataproc.v1.ClusterControllerClient({
  credentials: credentials
  // optional auth parameters.
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
  // res.send(client.toString());
  const dataprocRequest = {
    projectId: "big-data-project-233100",
    region: "global"
    // https://cloud.google.com/nodejs/docs/reference/dataproc/0.4.x/google.cloud.dataproc.v1#.Job
    // job: {
    //   placement: {
    //     clusterName: "testcl"
    //   },
    //   reference: {
    //     jobId: "job-07a4f20c"
    //   },
    //   hadoopJob: {
    //     args: ["wordcount-hbase", "gs://bigdata_tweet_dump"],
    //     mainClass:
    //       "gs://testbucketcelticvent/google-cloud-dataproc-metainfo/84edc588-da8a-4bdf-881b-c395c5e76ba7/jobs/99e233bd0fd0439391b3573d605abdb6/staging/wordcount-mapreduce-0-SNAPSHOT-jar-with-dependencies.jar"
    //   }
    // }
  };
  console.log(client);
  client
    .listClusters(dataprocRequest)
    .then(responses => {
      const resources = responses[0];
      console.log("Total resources:", resources.length);
      for (let i = 0; i < resources.length; i += 1) {
        console.log(resources[i]);
      }
    })
    .catch(err => console.log(err));

  // client
  //   .submitJob(request)
  //   .then(responses => {
  //     const response = responses[0];
  //     console.log(`Response: ${JSON.stringify(response)}`);
  //   })
  //   .catch(err => {
  //     console.error(err);
  //   });

  // const test = {
  //   hi: 2,
  //   hello: "string"
  // };
  // res.json(test);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
