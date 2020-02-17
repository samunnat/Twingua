# Twingua

## HBase Bulk-load Testing

1. (Local) On the root directory run (stay in this directory)
   ```
   cd hbase-bulkload
   ```
2. (Local) Build jar with maven (build should succeed)
   ```
   mvn clean install
   ```
3. (Local) SSH into dataproc cluster
   ```
   gcloud compute --project "big-data-project-233100" ssh --zone "us-west1-a" "testcl-m"
   ```
4. (SSH) Open HBase Shell
   ```
   hbase shell
   ```
5. (SSH) Create a table
   ```
   create 'tweet', 'tweetFamily'
   ```
6. (GCloud) Delete pre-existing HFiles
   - Go to Google Cloud storage through their website
   - Click on `dataproctst`
   - Select `hfiles/` and `Delete` it
7. (Local) Submit hadoop job (NOTE: This currently is using the book example as data)
   ```
   gcloud dataproc jobs submit hadoop --cluster testcl --region us-west1 --jar target/hbase-bulkload-1.0.jar -- com.twing.app.HBaseDriver gs://dataproctst/datInput.xml gs://dataproctst/hfiles tweet
   ```
8. (SSH) Inside of the HBase shell (cleanup)
   ```
   scan 'tweet'
   disable 'tweet'
   drop 'tweet'
   ```
