package twingua;

import java.io.IOException;

import org.apache.hadoop.conf.Configuration;

import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.client.Scan;
import org.apache.hadoop.hbase.filter;
import org.apache.hadoop.hbase.filter.FilterList;
import org.apache.hadoop.hbase.filter.CompareFilter.CompareOp;
import org.apache.hadoop.hbase.client.HTable;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.client.ResultScanner;
import org.apache.hadoop.hbase.util.Bytes;

public class QueryBigTable {
    public static void main(String[] args) {

    }

    public static void queryTable (int[] boundingBox, TableName tableName, Configuration config, ) {
        HTable table = new HTable(config, tableName);

        // NOTE: If this is to be extended to other places in the world we need to account for N or S
        byte[] topLongitude = Bytes.toBytes(topLong);
        byte[] bottomLongitude = Bytes.toBytes(bottomLong);

        // Defining a filter to get only tweets with Longitude values in our bounding box
        FilterList filterList = new FilterList();
        filterList.add(new SingleColumnValueFilter(COLUMN_FAMILY, longitude, CompareOp.GREATER_OR_EQUAL, topLongitude));
        filterList.add(new SingleColumnValueFilter(COLUMN_FAMILY, longitude, CompareOp.LESS_OR_EQUAL, bottomLongitude));

        // Instantiating Scan object
        // NOTE: Start and Stop row should be related to the latitude values lexicographically and the filter
        //       will help us get only the rows within the bounding box's longitude values
        Scan scan = Scan()
            .withStartRow(bounding box top left)
            .withStopRow(bounding box bottom right)
            .setFilter(filterList);

        // Instantiating a Scanner to go through the table
        ResultScanner scanner = table.getScanner(scan);

        // Reading the scan result values
        for (Result res = scanner.next(); res != null; result = scanner.next()) {
            // Data is in bytes, so convert to our preferred types

        }

        scanner.close();
    }
}