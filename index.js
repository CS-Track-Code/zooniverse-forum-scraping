import dotenv from 'dotenv';
import {MongoClient} from 'mongodb';
import {getProjects} from './getProjects.js';
import {getDiscussions} from './getDiscussions.js';
import {getComments} from './getComments.js';

dotenv.config();
const url = process.env.DB_URL;
const db_name = process.env.DBNAME;
const data_to_crawl = process.env.DATA_TYPE;
const params = JSON.parse(process.env.PARAMS);

console.log(`Connecting to database ${db_name} in ${url}...`);

MongoClient.connect(url, function(err, db) {
    if (err) {
        console.error("ERROR: connecting to the database was not posible", err);
        process.exit();
    }
    const dbo = db.db(db_name);
    console.log("    Connected to database!");
    switch(data_to_crawl) {
        case 'projects':
            getProjects(dbo, params);
            break;
        case 'discussions':
            getDiscussions(dbo, params);
            break;
        case 'comments':
            getComments(dbo, params);
            break;
        default:
            break;
    }
});