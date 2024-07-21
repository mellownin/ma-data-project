const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://mongo:27017';
const DATABASE_NAME = 'cmsMaPublicDataDb';

async function testConnection() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');
    } catch (error) {
        console.error('Connection to MongoDB failed', error);
    } finally {
        await client.close();
    }
}

testConnection()