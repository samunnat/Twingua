package twingua;

import org.apache.hadoop.hbase.mapreduce.Export;
import org.apache.hadoop.util.ProgramDriver;

public class LanguageCountDriver {

  public static void main(String[] args) {
    ProgramDriver programDriver = new ProgramDriver();
    int exitCode = -1;
    try {
        // Query BigTable

        programDriver.addClass("languagecount-hbase", LanguageCountHBase.class,
            "A map/reduce program that counts the languages in the bounding box");

        programDriver.driver(args);
        exitCode = programDriver.run(args);
    } catch (Throwable e) {
        e.printStackTrace();
    }
    System.exit(exitCode);
  }
}