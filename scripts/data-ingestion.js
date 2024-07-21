const axios = require('axios'); // Makes HTTP requests to webpage
const cheerio = require('cheerio'); // For parsing and navigating the HTML of the webpage
const fs = require('fs'); // For file system operations like reading and writing files
const path = require('path'); // For handling file and directory paths
const unzipper = requrie('unzipper'); // For extracting zip files
const { MongoClient } = require('mongodb'); // for connecting to MongoDB and performing database operations

const MONGO_URI = 'mongodb://mongo:27017';
const DATABASE_NAME = 'cmsMaPublicDb';
const COLLECTION_NAME = ''

