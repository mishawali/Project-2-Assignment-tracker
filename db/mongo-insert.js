const { MongoClient } = require("mongodb");

// Replace the uri string with your MongoDB deployment's connection string.
const uri =
  "mongodb+srv://dbuser:a3uzj1Tgv3slXpcC@cluster0.pqhy3.mongodb.net/taskdb?retryWrites=true&w=majority";

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function InsertTask(record) {
  try {
    await client.connect();

    const database = client.db("taskdb");
    const movies = database.collection("tasks");
    // create a document to be inserted
    const result = await movies.insertOne(record);

    console.log(
      `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
    );
  } finally {
    await client.close();
  }
}
InsertTask(record).catch(console.dir);
