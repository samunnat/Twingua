package com.twing.app;

public enum HColumnEnum {
	  COL_TIME ("id".getBytes()),
	  COL_ID ("timestamp_ms".getBytes()),
	  COL_GEO ("geo".getBytes()),
	  COL_BOUNDINGBOX ("place".getBytes()),
	  COL_LANG ("lang".getBytes()),
	  COL_RETWEETCT ("retweet_count".getBytes());
	  COL_FAVCT ("favorite_count".getBytes());
	  COL_QUOTECT ("quote_count".getBytes());
	  COL_REPLYCT ("reply_count".getBytes());
	 
	  private final byte[] columnName;
	  
	  HColumnEnum (byte[] column) {
	    this.columnName = column;
	  }

	  public byte[] getColumnName() {
	    return this.columnName;
	  }
}