const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hey uthso!! server running...');
})

app.listen(port, () => {
    console.log('Your server is runnning on: ', port);
})