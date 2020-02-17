package com.twingua.hbase.bulkload;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.io.ImmutableBytesWritable;
import org.apache.hadoop.hbase.mapreduce.HFileOutputFormat2;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.input.NLineInputFormat;
import org.apache.hadoop.hbase.mapreduce.LoadIncrementalHFiles;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HBaseDriver {
    private static final Logger log = LoggerFactory.getLogger(HBaseDriver.class);
    static Configuration hbaseconfiguration = null;
    static Configuration conf = new Configuration();
    static HBaseAdmin hbaseAdmin;

    // Is this the same as "Utils.createHBaseMapRedConfiguration"
    public static void connectHBase() {
        log.info("Initializing Connection with Hbase");

        final String HBASE_CONFIG_ZOOKEEPER_CLIENT_PORT = "hbase.zookeeper.property.clientPort";
        final String HBASE_ZOOKEEPER_CLIENT_PORT = "2181";
        final String HBASE_CONFIG_ZOOKEEPER_QUORUM  = "hbase.zookeeper.quorum";
        final String HBASE_ZOOKEEPER_SERVER = "127.0.0.1"; // Machine IP where ZooKeeper is installed
        conf.set(HBASE_CONFIG_ZOOKEEPER_CLIENT_PORT, HBASE_ZOOKEEPER_CLIENT_PORT);

        conf.set(HBASE_CONFIG_ZOOKEEPER_QUORUM, HBASE_ZOOKEEPER_SERVER);

        hbaseconfiguration = HBaseConfiguration.create(conf);

        try {
            hbaseAdmin = new HBaseAdmin(hbaseconfiguration);
            LOG.info("HBase connection successfull");
        } catch (MasterNotRunningException e) {
            LOG.error("HBase Master Exception " + e);
        } catch (ZooKeeperConnectionException e) {
            LOG.error("Zookeeper Exception " + e);
        }
    }

    /**
        * Main entry point for the example.
        *
        * @param args
        *            arguments
        * @throws Exception
        *             when something goes wrong
        */
    public static void main(String[] args) throws Exception {
        LOG.info("Code started");
        HBaseDriver.connectHBase(); // Initializing connection with HBase

        String inputPath=args[0];
        String outputPath=args[1];
        String tableName=args[2];

        conf.set("hbase.table.name", tableName);

        // Is this where
        // conf.set("hbase.fs.tmp.dir", "/tmp");

        Job job = new Job(conf);
        job.setJarByClass(HBaseDriver.class);
        job.setJobName("Bulk Load JSON into HBase");

        // Might want to make this a refer to a JSON parser class
        job.setInputFormatClass(NLineInputFormat.class);
        job.getConfiguration().setInt("mapreduce.input.lineinputformat.linespermap", 100);

        // Linking mapper function
        job.setMapperClass(HBaseMapper.class);

        // Setting Mapper output format
        job.setMapOutputKeyClass(ImmutableBytesWritable.class);
        job.setMapOutputValueClass(KeyValue.class);

        // No reducer??? Gets set by the configureIncrementalLoad below
        job.setNumReduceTasks(0);

        // We do not always want to make a new table, but we will keep this for now
        HTable htable = new HTable(conf, tableName);

        try {
            // HFileOutputFormat.configureIncrementalLoad(job, htable);

            // I think this is where the map function might be ran
            FileInputFormat.addInputPath(job, new Path(inputPath));
            FileOutputFormat.setOutputPath(job, new Path(outputPath));

            // Waiting for the map function to finish and it creates a HFile hopefully
            job.waitForCompletion(true);
        } finally {
            htable.close();
            admin.close();
        }
        // Importing the generated HFiles into a HBase table
        LoadIncrementalHFiles loader = new LoadIncrementalHFiles(conf);
        loader.doBulkLoad(new Path(outputPath, htable));
        log.info("Code ended");
    }

}

// Is this the correct thought path
// Driver -> Mapper -> Conext (HFile) -> HBase create table using HFile