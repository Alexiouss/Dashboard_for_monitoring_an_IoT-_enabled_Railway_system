const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri='your_uri';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function ConnectToDB() {
    let client; // Define the client variable within the function scope

    try {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB successfully!');
        return client;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}
  
  module.exports = { ConnectToDB,client };
