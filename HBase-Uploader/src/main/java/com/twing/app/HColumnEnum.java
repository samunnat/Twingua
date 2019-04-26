package com.twingua.hbase.bulkload;

public enum HColumnEnum {
	  COL_ID ("id".getBytes()),
	  COL_TIME ("timestamp_ms".getBytes()),
	  COL_GEO ("geo".getBytes()),
	  COL_BOUNDINGBOX ("place".getBytes()),
	  COL_PLACETYPE ("placetype".getBytes()),
	  COL_PLACENAME ("placename".getBytes()),
	  COL_PLACECC ("placecc".getBytes()),
	  COL_BOUNDINGGEO ("boundinggeo".getBytes()),
	  COL_LANG ("lang".getBytes()),
	  COL_RETWEETCT ("retweet_count".getBytes()),
	  COL_FAVCT ("favorite_count".getBytes()),
	  COL_QUOTECT ("quote_count".getBytes()),
	  COL_REPLYCT ("reply_count".getBytes());

	  private final byte[] columnName;

	  HColumnEnum (byte[] column) {
	    this.columnName = column;
	  }

	  public byte[] getColumnName() {
	    return this.columnName;
	  }
}