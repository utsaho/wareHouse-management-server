const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const { query } = require('express');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@bookcluster.jjxng.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const userCollection = client.db("bookHouse").collection("users");
        const bookCollection = client.db("bookHouse").collection("books");
        app.get('/test', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/books', async (req, res) => {
            const size = parseInt(req.query.size);
            const page = parseInt(req.query.page);
            const email = req.query.email;

            // console.log(email);

            let query = {};
            let cursor = bookCollection.find(query);
            let result;
            if (email) {
                query = { email: email };
                cursor = bookCollection.find(query);
            }
            if (size && !page) {
                result = await cursor.limit(size).toArray();
                // console.log(size);
            }
            else if (size && page) {
                result = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                result = await cursor.toArray();
            }
            res.send(result);
        })

        app.post('/book', async (req, res) => {
            const { id } = req.body;
            const query = { _id: ObjectId(id) };
            const book = await bookCollection.findOne(query);
            res.send(book);
        });

        app.post('/additems', async (req, res) => {
            const book = req.body;
            const result = await bookCollection.insertOne(book);
            res.send(result);
        });

        app.get('/totalBooks', async (req, res) => {
            const email = req.query.email;
            let query = {}
            let result;
            if (email) {
                // console.log('your email: ', email);
                const query = { email: email };
                result = await bookCollection.countDocuments(query);
            }
            else {
                result = await bookCollection.estimatedDocumentCount();
            }
            res.json(result);
        });
        // app.post('/myItems', async (req, res) => {
        //     const email = req.body.email;
        //     const query = { email: email };
        //     const cursor = bookCollection.find(query);
        //     const result = await cursor.toArray();
        //     res.send(result);
        // });
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hey uthso!! your server running...');
});

app.listen(port, () => {
    console.log('Your server is runnning on: ', port);
});