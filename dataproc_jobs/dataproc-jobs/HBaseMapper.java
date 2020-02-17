package com.twingua.hbase.bulkload;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.hadoop.hbase.KeyValue;
import org.apache.hadoop.hbase.io.ImmutableBytesWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

public class HBaseMapper extends Mapper<LongWritable, Text, ImmutableBytesWritable, KeyValue> {
    final static byte[] COL_FAMILY = "bookFamily".getBytes();

    List<String> columnList = new ArrayList<String>();
    ImmutableBytesWritable hKey = new ImmutableBytesWritable();
    KeyValue kv;

    protected void setup(Context context) throws IOException, InterruptedException {
        columnList.add("id");
        columnList.add("name");
    }

    /**
     * Map method gets XML data from tag <book> to </book>. To read the xml content the data is sent to getXmlTags method
     * which parse the XML using STAX parser and returns an String array of contents.
     * String array is iterated and each elements are stored in KeyValue
     *
     */
    public void map(LongWritable key, Text value, Context context) throws InterruptedException, IOException {
        String line = value.toString();

        String fields[] = ["Alan", "Paradise"]

        hKey.set(fields[0].getBytes());

        kv = new KeyValue(hKey.get(), COL_FAMILY, HColumnEnum.COL_AUTHOR.getColumnName(), field[1].getBytes());
        context.write(hKey, kv);
    }
}