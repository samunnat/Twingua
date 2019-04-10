/*
 * Copyright 2014 Sreejith Pillai
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.twing.app;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.hadoop.hbase.KeyValue;
import org.apache.hadoop.io.WritableComparable;
import org.apache.hadoop.hbase.io.ImmutableBytesWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

public class HBaseMapper extends
		Mapper<LongWritable, Text, ImmutableBytesWritable, KeyValue> {
	final static byte[] COL_FAMILY = "tweetFamily".getBytes();
//This should be the same as in the create table command in hBase shell
	List<String> columnList = new ArrayList<String>();
	ParseXml parseXml = new ParseXml();
	ImmutableBytesWritable hKey = new ImmutableBytesWritable();
	KeyValue kv;

	protected void setup(Context context) throws IOException,
			InterruptedException {
		columnList.add("id");
		columnList.add("timestamp_ms");
		columnList.add("geo");
		columnList.add("place");
		columnList.add("lang");
		columnList.add("retweet_count");
		columnList.add("favorite_count");
		columnList.add("quote_count");
		columnList.add("reply_count");
	}

	/**
	 * Map method gets XML data from tag <book> to </book>. To read the xml content the data is sent to getXmlTags method
	 * which parse the XML using STAX parser and returns an String array of contents.
	 * String array is iterated and each elements are stored in KeyValue
	 * 
	 */
	public void map(LongWritable key, Text value, Context context)
			throws InterruptedException, IOException {
		String line = value.toString();

		String fields[] = parseXml.getXmlTags(line, columnList);

		hKey.set(fields[0].getBytes());

		if (!fields[1].equals("")) {
			kv = new KeyValue(hKey.get(), COL_FAMILY,
					HColumnEnum.COL_ID.getColumnName(),
					fields[1].getBytes());
			context.write(hKey, kv);
		}

		if (!fields[2].equals("")) {
			kv = new KeyValue(hKey.get(), COL_FAMILY,
					HColumnEnum.COL_TIME.getColumnName(), fields[2].getBytes());
			context.write(hKey, kv);
		}

		if (!fields[3].equals("")) {
			kv = new KeyValue(hKey.get(), COL_FAMILY,
					HColumnEnum.COL_GEO.getColumnName(), fields[3].getBytes());
			context.write(hKey, kv);
		}
		if (!fields[4].equals("")) {
			kv = new KeyValue(hKey.get(), COL_FAMILY,
					HColumnEnum.COL_BOUNDINGBOX.getColumnName(), fields[4].getBytes());
			context.write(hKey, kv);
		}
		if (!fields[5].equals("")) {
			kv = new KeyValue(hKey.get(), COL_FAMILY,
					HColumnEnum.COL_LANG.getColumnName(),
					fields[5].getBytes());
			context.write(hKey, kv);
		}
		if (!fields[6].equals("")) {
			kv = new KeyValue(hKey.get(), COL_FAMILY,
					HColumnEnum.COL_RETWEETCT.getColumnName(),
					fields[6].getBytes());
			context.write(hKey, kv);
		}
		if (!fields[7].equals("")) {
			kv = new KeyValue(hKey.get(), COL_FAMILY,
					HColumnEnum.COL_FAVCT.getColumnName(),
					fields[7].getBytes());
			context.write(hKey, kv);
		}
		if (!fields[8].equals("")) {
			kv = new KeyValue(hKey.get(), COL_FAMILY,
					HColumnEnum.COL_QUOTECT.getColumnName(),
					fields[8].getBytes());
			context.write(hKey, kv);
		}
		if (!fields[9].equals("")) {
			kv = new KeyValue(hKey.get(), COL_FAMILY,
					HColumnEnum.COL_REPLYCT.getColumnName(),
					fields[9].getBytes());
			context.write(hKey, kv);
		}
	}
}