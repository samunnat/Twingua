const express = require("express");
const app = express();
const cors = require("cors"); // middleware to deal with cors

const http = require("http");
var server = http.createServer(app);
const socketIO = require("socket.io");
var io = socketIO(server);

// only use this for dev purposes
const whitelist = ["http://localhost:3000"];
app.use(
  cors({
    origin: whitelist
  })
);

// Geo hash initializaiton
var geohash = require("ngeohash");

// Redis initialization
const REDISHOST = process.env.REDISHOST || "localhost";
const REDISPORT = process.env.REDISPORT || 6379;

var redis = require("redis");
var redisClient = redis.createClient(REDISPORT, REDISHOST);
// redisClient.on("error", err => console.error("ERR:REDIS:", err));

// Dataproc initialization
const dataproc = require("@google-cloud/dataproc");

// Bucket initialization
const { Storage } = require("@google-cloud/storage");
const storage = new Storage();
const bucket = storage.bucket("bigdata_tweet_dump");
const file = bucket.file("tweets_52_copy_ryan.json");

// TEMPORARY CODE TO FILL REDIS
// var hashes6 = geohash.bboxes(
//   52.148658716048985,
//   -0.8747863769531251,
//   52.88321993103792,
//   0.6097412109375001,
//   (precision = 6)
// );
// console.log(hashes6);

// hashes6.map((key, i) => {
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

// Creating GCP Client with service worker credentials
const credentials = require("/Users/Ryan_Loi/Downloads/big-data-project-233100-e78608d5e4c9.json");
const gcpClient = new dataproc.v1.JobControllerClient({
  credentials: credentials, // Need to put actual credentials object in when pushing
  // optional auth parameters.
  servicePath: "us-west1-dataproc.googleapis.com"
});

// Every 20 minutes submit a job to query the analytics table and then read the resulting results from a bucket
// setInterval(function() {
//   // Creating job request configuration to run Spark Job
//   const sparkRequest = {
//     projectId: "big-data-project-233100",
//     region: "us-west1",
//     job: {
//       placement: {
//         clusterName: "testcl"
//       },
//       hadoopJob: {
//         args: [
//           "com.twingua.hbase.bulkload.HBaseDriver",
//           `gs://bigdata_tweet_dump/tweets_eu_30.json`,
//           `gs://dataproctst/hfiles/tweets_eu_30`,
//           "tweet"
//         ],
//         mainJarFileUri: "gs://dataproctst/hbase-bulkload-1.0.jar"
//       }
//     }
//   };

//   gcpClient.submitJob(sparkRequest).then(responses => {
//     console.log("Job Submitted");
//     const jobId = responses[0].reference.jobId;

//     // Dataproc every 1.5 to see if the job is done
//     const getJobInterval = setInterval(() => {
//       const getJobRequest = {
//         projectId: "big-data-project-233100",
//         region: "us-west1",
//         jobId: jobId
//       };
//       gcpClient.getJob(getJobRequest).then(element => {
//         // doThingsWith(element)
//         console.log("GOT JOB");
//         console.log("JOB STATUS:", element[0].status.state);
//         const jobRunning = element[0].status.state === "RUNNING";
//         console.log("jobRunning:", jobRunning);
//         if (!jobRunning) {
//           clearInterval(getJobInterval);
//           console.log("JOB DONE");
//           // Job is done now, so download results from bucket
//           file.download(function(err, contents) {
//             console.log("downloaded!");
//             if (err !== null) {
//               console.log("ERROR:", err);
//               res.send("failed D:");
//             } else {
//               // Load results from file into memory
//               analytics = JSON.parse(contents.toString());
//               res.send("worked!");

//               // Delete file on the bucket since we no longer need it
//               file.delete(function(err, apiResponse) {
//                 console.log(err !== null ? apiResponse : err);
//               });
//             }
//           });
//         }
//       });
//     }, 1500);
//   });
// }, 1200000);

// Homepage Route
app.get("/", (req, res) => {
  console.log("Called root route");
  console.log(Object.keys(req.query).length);
  res
    .status(200)
    .send("hello world\n" + redisClient)
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
  const fileNumber = filename.substring(
    filename.lastIndexOf("_") + 1,
    filename.length
  );
  console.log(Math.floor(fileNumber / 10));

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
          "tweets",
          `${Math.floor(fileNumber / 10)}` // Batch number
        ],
        mainJarFileUri: "gs://dataproctst/hbase-bulkload-1.0.jar",
        jarFileUris: ["gs://dataproctst/geohash-1.3.0.jar"]
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

  // Getting bottom left and top right bounding box geohashes
  // Then using these to get all entries inbetween
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
    `geohash.${req.query.precision}`,
    `[{"${startHash}`,
    `[{"${endHash}z`,
    (err, reply) => {
      if (err) throw err;
      console.log("redis done");
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

// Socket connection established
io.on("connection", socket => {
  console.log("A user has connected");

  // Take in the bouunding box from user and stream back the redis query results
  socket.on("get-languages", (SW, NE, precision, doClear, debug) => {
    console.log("languages socket called");
    console.log(debug);
    console.log(SW);
    console.log(NE);
    // Getting bottom left and top right bounding box geohashes
    // Then using these to get all entries inbetween
    const startHash = geohash.encode(SW.lat, SW.lng, precision);

    const endHash = geohash.encode(NE.lat, NE.lng, precision);
    console.log(startHash);
    console.log(endHash);
    console.log("\n");
    redisClient.zrangebylex(
      `geohash.${precision}`,
      `[{"${startHash}`,
      `[{"${endHash}z`, // added z to grab everything with endhash as a prefix
      (err, reply) => {
        if (err) throw err;
        console.log("redis done");
        // console.log(reply);
        socket.emit(
          "return-languages",
          reply.map(jsonStr => {
            const geohashObj = JSON.parse(jsonStr);
            const hashKey = Object.keys(geohashObj)[0];
            const boxStr = geohash.decode_bbox(hashKey);
            const obj = {};
            obj[boxStr] = geohashObj[hashKey];
            return obj;
          }),
          doClear,
          debug
        );
      }
    );
  });

  socket.on("get-languages-slice", (SW, NE, precision, doClear, debug) => {
    console.log("languages slice socket called");
    console.log(debug);
    console.log(SW);
    console.log(NE);
    // Getting bottom left and top right bounding box geohashes
    // Then using these to get all entries inbetween
    const minLat = Math.min(SW.lat, NE.lat);
    const maxLat = Math.max(SW.lat, NE.lat);
    const minLng = Math.min(SW.lng, NE.lng);
    const maxLng = Math.max(SW.lng, NE.lng);

    const bboxHashes = geohash.bboxes(
      minLat,
      minLng,
      maxLat,
      maxLng,
      precision
    );

    console.log(bboxHashes);

    bboxHashes.forEach(hash => {
      redisClient.zrangebylex(
        `geohash.${precision}`,
        `[{"${hash}`,
        `[{"${hash}1`, // added 1 to grab just the one element with the prefix
        (err, reply) => {
          if (err) throw err;
          if (reply.length == 0) {
            return;
          }

          console.log("redis done");
          console.log(reply);
          socket.emit(
            "return-languages",
            reply.map(jsonStr => {
              const geohashObj = JSON.parse(jsonStr);
              const hashKey = Object.keys(geohashObj)[0];
              const boxStr = geohash.decode_bbox(hashKey);
              const obj = {};
              obj[boxStr] = geohashObj[hashKey];
              return obj;
            }),
            doClear,
            debug
          );
        }
      );
    });
    // redisClient.zrangebylex(
    //   `geohash.${precision}`,
    //   `[{"${startHash}`,
    //   `[{"${endHash}z`, // added z to grab everything with endhash as a prefix
    //   (err, reply) => {
    //     if (err) throw err;
    //     console.log("redis done");
    //     console.log(reply);
    //     socket.emit(
    //       "return-languages",
    //       reply.map(jsonStr => {
    //         const geohashObj = JSON.parse(jsonStr);
    //         const hashKey = Object.keys(geohashObj)[0];
    //         const boxStr = geohash.decode_bbox(hashKey);
    //         const obj = {};
    //         obj[boxStr] = geohashObj[hashKey];
    //         return obj;
    //       }),
    //       doClear,
    //       debug
    //     );
    //   }
    // );
  });

  // User has disconnected, add clean up here
  socket.on("disconnect", () => {
    console.log("A user has left");
  });
});

const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`App listening on port ${PORT}`);
//   console.log("Press Ctrl+C to quit.");
// });

// app.listen does not let socket.io listen receive requests
server.listen(PORT, "localhost");
