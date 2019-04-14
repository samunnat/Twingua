package com.twingua.hbase.bulkload;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.hadoop.hbase.KeyValue;
import org.apache.hadoop.io.WritableComparable;
import org.apache.hadoop.hbase.io.ImmutableBytesWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.GsonBuilder;

import ch.hsr.geohash.GeoHash;

public class HBaseMapper extends Mapper<LongWritable, Text, ImmutableBytesWritable, KeyValue> {
	final static byte[] COL_FAMILY = "tweetFamily".getBytes();

	//This should be the same as in the create table command in hBase shell
	List<String> columnList = new ArrayList<String>();
	ImmutableBytesWritable hKey = new ImmutableBytesWritable();

	protected void setup(Context context) throws IOException, InterruptedException {
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
	 * Map method gets JSON data from google storage. The line is converted to a string then converted into a JsonObject.
	 * This object is used to create column families.
	 */
	public void map(LongWritable key, Text value, Context context) throws InterruptedException, IOException {
		String line = value.toString();

		int numberOfCharacters = 12;

		Gson gson = new GsonBuilder().create();

		try {
			JsonObject twt = new JsonParser().parse(line).getAsJsonObject();

			// Creating column family

			hKey.set(twt.get("id").toString().getBytes());

			//hKey.set(GeoHash.encodeHash((twt.get("place").getAsJsonObject().get("bounding_box")
			//	.getAsJsonObject().getAsJsonArray("coordinates").get(0).getAsJsonArray().get(0).getAsJsonArray().get(1)).getAsDouble(),
			//	(twt.get("place").getAsJsonObject().get("bounding_box").getAsJsonObject()
			//	.getAsJsonArray("coordinates").get(0).getAsJsonArray().get(0).getAsJsonArray().get(0)).getAsDouble()).getBytes());

			context.write(hKey, new KeyValue(hKey.get(), COL_FAMILY, HColumnEnum.COL_TIME.getColumnName(), twt.get("timestamp_ms").toString().getBytes()));
			context.write(hKey, new KeyValue(hKey.get(), COL_FAMILY, HColumnEnum.COL_GEO.getColumnName(), twt.get("geo").toString().getBytes()));
			context.write(hKey, new KeyValue(hKey.get(), COL_FAMILY, HColumnEnum.COL_BOUNDINGBOX.getColumnName(), twt.get("place").toString().getBytes()));
			
			double lat1 = (twt.get("place").getAsJsonObject().get("bounding_box")
				.getAsJsonObject().getAsJsonArray("coordinates").get(0).getAsJsonArray().get(0).getAsJsonArray().get(1)).getAsDouble();

			double long1 = (twt.get("place").getAsJsonObject().get("bounding_box")
				.getAsJsonObject().getAsJsonArray("coordinates").get(0).getAsJsonArray().get(0).getAsJsonArray().get(0)).getAsDouble();

			double lat2 = (twt.get("place").getAsJsonObject().get("bounding_box")
				.getAsJsonObject().getAsJsonArray("coordinates").get(0).getAsJsonArray().get(1).getAsJsonArray().get(1)).getAsDouble();

			double long2 = (twt.get("place").getAsJsonObject().get("bounding_box")
				.getAsJsonObject().getAsJsonArray("coordinates").get(0).getAsJsonArray().get(1).getAsJsonArray().get(0)).getAsDouble();

			double lat3 = (twt.get("place").getAsJsonObject().get("bounding_box")
				.getAsJsonObject().getAsJsonArray("coordinates").get(0).getAsJsonArray().get(2).getAsJsonArray().get(1)).getAsDouble();

			double long3 = (twt.get("place").getAsJsonObject().get("bounding_box")
				.getAsJsonObject().getAsJsonArray("coordinates").get(0).getAsJsonArray().get(2).getAsJsonArray().get(0)).getAsDouble();


			double lat4 = (twt.get("place").getAsJsonObject().get("bounding_box")
				.getAsJsonObject().getAsJsonArray("coordinates").get(0).getAsJsonArray().get(3).getAsJsonArray().get(1)).getAsDouble();

			double long4 = (twt.get("place").getAsJsonObject().get("bounding_box")
				.getAsJsonObject().getAsJsonArray("coordinates").get(0).getAsJsonArray().get(3).getAsJsonArray().get(0)).getAsDouble();

			double hashlat = (lat1 + lat2 + lat3 + lat4)/4;
			double hashlong = (long1 + long2 + long3 + long4)/4;


			GeoHash bbGeohash = GeoHash.withCharacterPrecision(hashlat, hashlong, numberOfCharacters);

			context.write(hKey, new KeyValue(hKey.get(), COL_FAMILY, HColumnEnum.COL_BOUNDINGGEO.getColumnName(), 
				bbGeohash.toBase32().getBytes()));
			
			context.write(hKey, new KeyValue(hKey.get(), COL_FAMILY, HColumnEnum.COL_LANG.getColumnName(), twt.get("lang").toString().getBytes()));
			context.write(hKey, new KeyValue(hKey.get(), COL_FAMILY, HColumnEnum.COL_RETWEETCT.getColumnName(), twt.get("retweet_count").toString().getBytes()));
			context.write(hKey, new KeyValue(hKey.get(), COL_FAMILY, HColumnEnum.COL_FAVCT.getColumnName(), twt.get("favorite_count").toString().getBytes()));
			context.write(hKey, new KeyValue(hKey.get(), COL_FAMILY, HColumnEnum.COL_QUOTECT.getColumnName(), twt.get("quote_count").toString().getBytes()));
			context.write(hKey, new KeyValue(hKey.get(), COL_FAMILY, HColumnEnum.COL_REPLYCT.getColumnName(), twt.get("reply_count").toString().getBytes()));
		} catch (Exception e) {

		}
	}
}