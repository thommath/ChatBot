const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = process.env.mongodburl;
// Database Name
const dbName = 'chatdb';


exports.getdb = function() {
    // Create a new MongoClient
    const client = new MongoClient(url);
    // Use connect method to connect to the Server

    return new Promise((res, rej) => 
        client.connect(function(err) {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            
            const db = client.db(dbName);
            res({db, client});
        })
    )
}

exports.close = function(client) {
    client.close();
}

exports.save = function(id, data) {
    return exports.getdb().then(({client, db}) => {
        // Get the documents collection
        const collection = db.collection('user');
        // Insert some documents
        return new Promise((res, rej) => {
            collection.insert({
                id, data
            }, function(err, result) {
                client.close();
                if (err !== null)
                    rej(err)
                else
                    res(result)
            })
        })
    })
}

exports.load = function(id) {
    return exports.getdb().then(({client, db}) => {
        // Get the documents collection
        const collection = db.collection('user');
        // Insert some documents
        return new Promise((res, rej) => {
            collection.find({id}, function(err, result) {
                client.close();
                if (err !== null)
                    rej(err)
                else
                    res(result)
            })
        })
    })
}
