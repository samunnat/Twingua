import pandas as pd

#Not sure if happybase is still being updated/working. It would be faster than manually setting up a thrift server on the cloud instance...
#Here is some set-up for Thrift just in case
'''
from thrift import Thrift
from thrift.transport import TSocket, TTransport
from thrift.protocol import TBinaryProtocol

from hbase import ttypes
from hbase.Hbase import Client, Mutation


sock = TSocket.TSocket('localhost', 9090)
transport = TTransport.TBufferedTransport(sock)
protocol = TBinaryProtocol.TBinaryProtocol(transport)
client = Client(protocol)
transport.open()
'''
f = open('tweets_test.json','r')

#reads whole json into memory, assigns column names and stuff. Currently leaves timestamp as a raw number
df = pd.read_json(f, lines=True, orient='columns', convert_dates=False)

#print((df.loc[1,"place"])["bounding_box"]["coordinates"])
#print(df.columns.tolist())

rows = len(df.index)

#for i in range(rows):
	#print ((df.loc[i,"place"])["bounding_box"]["coordinates"])	
'''
time stamp

	test=df.loc[0,'timestamp_ms']

id

	df.loc[i,'id']

geo

	df.loc[i,'geo']['coordinates']

bounding box

	coord = (df.loc[i,"place"])["bounding_box"]["coordinates"]

	coord[0][0][0], coord[0][0][1] = coord[0][0][1], coord[0][0][0]
	coord[0][1][0], coord[0][1][1] = coord[0][1][1], coord[0][1][0]
	coord[0][2][0], coord[0][2][1] = coord[0][2][1], coord[0][2][0]
	coord[0][3][0], coord[0][3][1] = coord[0][3][1], coord[0][3][0]

language

	df.loc[i,'lang']

retweet ct, fav ct, quote ct, reply ct
	
	df.loc[i,'retweet_count']
	df.loc[i,'favorite_count']
	df.loc[i,'quote_count']
	df.loc[i,'reply_count']
	
'''
	
	
#These are upload commands for raw Thrift, if we have to use it
'''	
	mutations = [Mutation(column='place:bounding_box', value=(df.loc[i,"place"])["bounding_box"]["coordinates"])]
	client.mutateRow('tweet_table', df.loc[i,"id"], mutations)
	
transport.close()
'''	

















