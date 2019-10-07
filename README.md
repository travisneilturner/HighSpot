# Mix Edit

mix-edit.js - A simple JSON-based playlist editor

This program requires node v8.10.0 or later. To install node on macOS see:
https://nodejs.org/en/download/package-manager/#macos

To run, invoke `node mix-edit <mixFile> <changeFile> <outputFile>`.

CHANGEFILE FORMATTING:

The changeFile will have the following structure:  

[
  {
    "op": "add-song",
    "song_id": "2", 
    "playlist_id": "2"
  },
  {
    "op": "add-playlist", 
    "user_id": "2", 
    "song_ids": ["11", "12", "13"]
  },
  {
    "op": "delete-playlist",
    "playlist_id": "1"
  }
  ...
]

For "add-song", both "song_id" and "playlist_id" must exist in the mixFile or mix-edit will 
terminate with an error message.  For "add-playlist", similar restrictions apply.  Deleting 
a non-existent playlist is a no-op.  


SCALABILITY:

To scale to very large mixtape sizes effectively, it would make sense to store the raw data 
(mixtape) in a distributed datastore such as Apache Cassandra (since we don't need any joins).  
Incoming change files of very large size could be partitioned, ingested, and processed in parallel data 
streams using Apache Flink.  Additionally, we could service real-time requests (from 
Web/Microservice API) using the same approach.  
