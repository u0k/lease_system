const { MongoClient } = require('mongodb')
require('dotenv').config()

const url = process.env.DB_URL
const client = new MongoClient(url)

let db;

module.exports = {
    connectToDatabase: async function() {
        try {
            await client.connect()
            db = client.db('nuoma')
            console.log("Connected to database")
        } catch (error) {
            console.error(error)
        }
    },
    getDB: function () {
        return db;
    }
}