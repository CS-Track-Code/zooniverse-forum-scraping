# Zooniverse Forum Crawler
In this repository you can find the code associated to the crawler used to extract the forum data from Zooniverse platform. The crawler extracts information about the Projects, Discussions and Comments (three different collections).

## Prerequisites
You need to install node.js in order to make this crawler to work. You also need to setup a mongo database to be used as storage (you can have a local DB or a remote DB). The Mongo database must contain three collections: "Projects", "Discussions", and "Comments".

## Using the crawler
You need to create an .env file and define the following enviroment variables based on your database information and the type of data you want to extract:
```` 
    DB_URL: The URL of your mongo DB.
    DBNAME: The name of your database.
    DATA_TYPE: There are three types of data to be extracted: 1. projects, 2. discussions and 3. comments.
    PARAMS: a stringified json containing the params needed for the GET requests to Zooniverse platform.
    DISCUSSION_SIZE: Limits the comments extraction to discussions with the number of comments equal or higher than this variable.
````

It is important to extract data in order to obtain valid results (first projects, then discussions and finally the comments). For the GET requests you need to define the following params: headers, referrer, referrerPolicy, body, method, mode and credentials. Once you define the .env, you can simply execute the crawler using:

```` 
node index.js
```` 