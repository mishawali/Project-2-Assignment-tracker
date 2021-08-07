const { MongoClient } = require('mongodb');
const config = require('./config.json');
const uri = config.db.uri;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function inserttask(){
    client.connect(err => {
        const collection = client.db("taskdb").collection("tasks");
        //   console.log(collection);
        const database = client.db("taskdb");
        const movies = database.collection("tasks");
        // create a document to be inserted
        const doc = { name: "Red" };
        const result = movies.insertOne(doc);
        console.log(
            `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
        );
        client.close();
    });

}
inserttask()


// async function run() {
//     try {
//         await client.connect();
//         const database = client.db("taskdb");
//         const movies = database.collection("tasks");
//         // create a document to be inserted
//         const doc = { name: "Red" };
//         const result = await movies.insertOne(doc);
//         console.log(
//             `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
//         );
//     } finally {
//         await client.close();
//     }
// }
// run().catch(console.dir);