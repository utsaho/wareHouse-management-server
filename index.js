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
        const requestCollection = client.db("bookHouse").collection("request");
        const adviceCollection = client.db("bookHouse").collection("advice");
        const qnaCollection = client.db("bookHouse").collection("qna");
        const bannerCollection = client.db("bookHouse").collection("banner");
        app.get('/test', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get('/banner', async (req, res) => {
            const query = {};
            const cursor = bannerCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get('/qna', async (req, res) => {
            const query = {};
            const cursor = qnaCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/request', async (req, res) => {
            const request = req.body;
            const result = await requestCollection.insertOne(request);
            res.send(result);
        });

        app.get('/books', async (req, res) => {
            const size = parseInt(req.query.size);
            const page = parseInt(req.query.page);
            const email = req.query.email;

            let query = {};
            let cursor = bookCollection.find(query);
            let result;
            if (email) {
                query = { email: email };
                cursor = bookCollection.find(query);
            }
            if (size && !page) {
                result = await cursor.limit(size).toArray();
            }
            else if (size && page) {
                result = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                result = await cursor.toArray();
            }
            res.send(result);
        })

        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const book = await bookCollection.findOne(query);
            res.send(book);
        });

        app.get('/advice', async (req, res) => {
            const query = {};
            const cursor = adviceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });


        app.put('/book/:id', async (req, res) => {
            const id = req.params.id;
            const updateBook = req.body;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const doc = {
                $set: {
                    quantity: updateBook.quantity
                }
            }
            const result = await bookCollection.updateOne(filter, doc, option);
            res.send(result);
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
                const query = { email: email };
                result = await bookCollection.countDocuments(query);
            }
            else {
                result = await bookCollection.estimatedDocumentCount();
            }
            res.json(result);
        });

        app.delete('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookCollection.deleteOne(query);
            res.send(result);
        });
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