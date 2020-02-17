import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.io.ImmutableBytesWritable;
import org.apache.hadoop.hbase.mapreduce.HFileOutputFormat2;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.input.NLineInputFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BulkLoadDriver {
  private static final Logger log = LoggerFactory.getLogger(BulkLoadDriver.class);

  public static void submitBulkLoadJob(String hbaseTable, String input, String output, String hadoopConfDir,
                                       String hadoopUser) throws Exception {
    System.setProperty("HADOOP_USER_NAME", hadoopUser);
    System.setProperty("mapreduce.job.maps", "2");
    Configuration conf = Utils.createHBaseMapRedConfiguration(hadoopConfDir);
    conf.set("hbase.fs.tmp.dir", "/tmp");

    Job job = Job.getInstance(conf, "HBase Bulk Importer for HTRC");
    job.setJarByClass(BulkLoadMapper.class);
    job.setMapperClass(BulkLoadMapper.class);
    job.setMapOutputKeyClass(ImmutableBytesWritable.class);
    job.setMapOutputValueClass(Put.class);

    job.setInputFormatClass(NLineInputFormat.class);

    job.getConfiguration().setInt("mapreduce.input.lineinputformat.linespermap", 100);


    Path tmpPath = new Path(output);
    Connection hbCon = ConnectionFactory.createConnection(conf);
    Table hTable = hbCon.getTable(TableName.valueOf(hbaseTable));
    RegionLocator regionLocator = hbCon.getRegionLocator(TableName.valueOf(hbaseTable));
    Admin admin = hbCon.getAdmin();

    try {
      HFileOutputFormat2.configureIncrementalLoad(job, hTable, regionLocator);
      FileInputFormat.addInputPath(job, new Path(input));
      HFileOutputFormat2.setOutputPath(job, tmpPath);
      job.waitForCompletion(true);
    } finally {
      hTable.close();
      regionLocator.close();
      admin.close();
      hbCon.close();
    }
  }
}