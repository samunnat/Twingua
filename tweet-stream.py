import tweepy
import sys
import time
import os
import requests

# Variables that contains the user credentials to access Twitter API
ACCESS_TOKEN = os.environ.get("ACCESS_TOKEN")
ACCESS_TOKEN_SECRET = os.environ.get("ACCESS_TOKEN_SECRET")
CONSUMER_KEY = os.environ.get("CONSUMER_KEY")
CONSUMER_SECRET = os.environ.get("CONSUMER_SECRET")

# print(os.environ.get('CONSUMER_KEY'))
# print(os.environ)

# output_file = 'tweets_eu.json'
global output_file2
output_file2 = 'tweets_1.json'

# Size of the file 100000000
file_max_size = 100000000

# iterator to generate new files with different names
file_iterator = 1

# Mapbox done at http://boundingbox.klokantech.com/
GEO_EUROPE_BOX = [-24.64501397, 35.8630349534, 45.1656662867, 71.2702519386]

# Languages in Europe
# LANGUAGES = ["es, en, cs, da, de, el, fi, fr, he, hu, it, nl, no, pl, pt, ro, ru, sv, tr, uk"]

# initialize a list to hold all the tweepy Tweets
alltweets = []


# Stream listener
class CustomStreamListener(tweepy.StreamListener):
    def on_status(self, status):
        print status.text

    # Write the tweets on the JSON file
    def on_data(self, data):
        # if file is bigger than 90 MB exit the program
        global output_file2
        if os.path.getsize(output_file2) > file_max_size:
            file.close()
            print "File is ", os.path.getsize(output_file2), ". Bigger than 90MB, generating a new one"
            gcs_destination = 'gsutil cp ./' + output_file2 + ' gs://bigdata_tweet_dump/'
            os.system(gcs_destination)
            os.system('rm ' + output_file2)
            endpoint = 'https://big-data-project-233100.appspot.com/bulkload?filename=tweets_' + str(file_iterator)
            print "API request: " + endpoint
            r = requests.get(endpoint)
            # print r.status_code
            # print "-------------"
            # print r.json
            global file_iterator
            file_iterator = file_iterator + 1
            output_file2 = 'tweets_' + str(file_iterator) + '.json'
            global file
            file = open(output_file2, 'a')
            print "Opening file: ", output_file2
        file.write(data)

    def on_error(self, status_code):
        print >> sys.stderr, 'Encountered error with status code:', status_code
        return True # Don't kill the stream

    def on_timeout(self):
        print >> sys.stderr, 'Timeout...'
        return True # Don't kill the stream


# class MyStreamListener(tweepy.StreamListener):
#    def on_status(self, status):
#        print(status.text)


auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

api = tweepy.API(auth)
global file
file = open(output_file2, 'a')
counter3 = 0

# Error handling
if not api:
    print ("Problem connecting to API")

# myStreamListener = MyStreamListener()
# myStream = tweepy.Stream(auth=api.auth, listener=myStreamListener)

# counter = 0
print("Starting Streaming filter")

stream = tweepy.streaming.Stream(auth, CustomStreamListener())
stream.filter(locations=GEO_EUROPE_BOX)

print("Done with the filtering")


# new_tweets = myStream.filter(languages=LANGUAGES, locations=GEO_EUROPE_BOX, count=["10"])
# print(json.dumps(myStream.filter(locations=GEO_EUROPE_BOX)))

'''
for tweet in new_tweets:

        # add to JSON
        counter += 1
        print ("Counter: ",counter,"tweets")
        with open('tweets_eu.json', 'w', encoding='utf8') as file:
            json.dump(tweet._json, file)
'''



