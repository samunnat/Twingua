const request = require("request");
const express = require("express");
const app = express();

// Geo hash initializaiton
var geohash = require("ngeohash");

// Redis initialization
var redis = require("redis");
var redisClient = redis.createClient();
// 48.99, 2.11 48.73 2.68
// var hashes = geohash.bboxes(48.73, 2.11, 48.99, 2.68, (precision = 6));

// // // Testing bounds 'ewt','eww','ewx','ey8',
// redisClient.zrangebylex("geohash.6", '[{"u09w5a', '[{"u09w5z', (err, reply) => {
//   if (err) throw err;
//   console.log('[{\\"uf');
//   const obj = JSON.parse(reply[0]);
//   console.log(obj);

//   console.log(
//     reply.map(jsonStr => {
//       return JSON.parse(jsonStr);
//     })
//   );
// });

// redisClient.zrange("stats", 0, -1, (err, reply) => {
//   if (err) throw err;
//   console.log('[{\\"uf');
//   console.log(reply);
// });
// hashes = ["ewt", "eww", "ewx", "ey8"];

// console.log(redisClient.hgetall("ewt"));
// console.log(analytics);
// console.log(hashes);
// hashes.map((key, i) => {
//   const obj = {};
//   obj[key] = {
//     en: Math.floor(Math.random() * 100),
//     fr: Math.floor(Math.random() * 100),
//     ch: Math.floor(Math.random() * 100)
//   };
//   const args = ["geohash.6", 0, JSON.stringify(obj)];
//   redisClient.zadd(args, function(err, response) {
//     if (err) throw err;
//     console.log("added " + response + " items.");
//   });
// });

// Dataproc initialization
const dataproc = require("@google-cloud/dataproc");

// Bucket initialization
const { Storage } = require("@google-cloud/storage");
const storage = new Storage();
const bucket = storage.bucket("bigdata_tweet_dump");
const file = bucket.file("tweets_52_copy_ryan.json");

// Creating GCP Client with service worker credentials
const credentials = require("/Users/Ryan_Loi/Downloads/big-data-project-233100-e78608d5e4c9.json");
const gcpClient = new dataproc.v1.JobControllerClient({
  credentials: credentials, // Need to put actual credentials object in when pushing
  // optional auth parameters.
  servicePath: "us-west1-dataproc.googleapis.com"
});

// var analytics = {};

// Every 20 minutes submit a job to query the analytics table and then read the resulting results from a bucket
setInterval(function() {
  // Creating job request configuration to run Spark Job
  const sparkRequest = {
    projectId: "big-data-project-233100",
    region: "us-west1",
    job: {
      placement: {
        clusterName: "testcl"
      },
      hadoopJob: {
        args: [
          "com.twingua.hbase.bulkload.HBaseDriver",
          `gs://bigdata_tweet_dump/tweets_eu_30.json`,
          `gs://dataproctst/hfiles/tweets_eu_30`,
          "tweet"
        ],
        mainJarFileUri: "gs://dataproctst/hbase-bulkload-1.0.jar"
      }
    }
  };

  gcpClient.submitJob(sparkRequest).then(responses => {
    console.log("Job Submitted");
    const jobId = responses[0].reference.jobId;

    // Dataproc every 1.5 to see if the job is done
    const getJobInterval = setInterval(() => {
      const getJobRequest = {
        projectId: "big-data-project-233100",
        region: "us-west1",
        jobId: jobId
      };
      gcpClient.getJob(getJobRequest).then(element => {
        // doThingsWith(element)
        console.log("GOT JOB");
        console.log("JOB STATUS:", element[0].status.state);
        const jobRunning = element[0].status.state === "RUNNING";
        console.log("jobRunning:", jobRunning);
        if (!jobRunning) {
          clearInterval(getJobInterval);
          console.log("JOB DONE");
          // Job is done now, so download results from bucket
          file.download(function(err, contents) {
            console.log("downloaded!");
            if (err !== null) {
              console.log("ERROR:", err);
              res.send("failed D:");
            } else {
              // Load results from file into memory
              analytics = JSON.parse(contents.toString());
              res.send("worked!");

              // Delete file on the bucket since we no longer need it
              file.delete(function(err, apiResponse) {
                console.log(err !== null ? apiResponse : err);
              });
            }
          });
        }
      });
    }, 1500);
  });
}, 1200000);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
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
    requestId: new Date().toJSON(),
    job: {
      placement: {
        clusterName: "testcl"
      },
      hadoopJob: {
        args: [
          "com.twingua.hbase.bulkload.HBaseDriver",
          `gs://bigdata_tweet_dump/${filename}.json`,
          `gs://dataproctst/hfiles/${filename}`,
          "tweets"
        ],
        mainJarFileUri: "gs://dataproctst/hbase-bulkload-1.0.jar"
      }
    }
  };

  // TODO: Add in things to keep track of the job

  // Submitting job request to dataproc
  gcpClient
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

  if (
    Object.keys(req.query).length != 5 ||
    req.query.lat1 === undefined ||
    req.query.lat2 === undefined ||
    req.query.long1 === undefined ||
    req.query.long2 === undefined ||
    req.query.precision === undefined
  ) {
    console.log("Invalid argument");
    res.status(400).end();
  }

  const startHash = geohash.encode(
    req.query.lat1,
    req.query.long1,
    req.query.precision
  );

  const endHash = geohash.encode(
    req.query.lat2,
    req.query.long2,
    req.query.precision
  );

  redisClient.zrangebylex(
    "geohash.6",
    `[{"${startHash}`,
    `[{"${endHash}z`,
    (err, reply) => {
      if (err) throw err;
      res.json(
        reply.map(jsonStr => {
          const geohashObj = JSON.parse(jsonStr);
          const hashKey = Object.keys(geohashObj)[0];
          const boxStr = geohash.decode_bbox(hashKey);
          const obj = {};
          obj[boxStr] = geohashObj[hashKey];
          return obj;
        })
      );
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
