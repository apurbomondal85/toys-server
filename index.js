const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}@cluster0.unnbbpt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const toysCollection = client.db("toysDB").collection("toys");

        const indexKeys = {name: 1};
        const indexOptions = {name: "name"};

        const result = await toysCollection.createIndex(indexKeys, indexOptions)



        app.get('/toys', async(req, res) =>{
            const result = await toysCollection.find().toArray();
            res.send(result);
        })

        app.get('/toys/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await toysCollection.findOne(query);
            res.send(result)
        })

        app.get('/toys/category/:category', async(req, res) => {
            const category = req.params.category;
            if (category === "All") {
                return;
            }
            const query = {"category": category}
            const result = await toysCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/limitToys', async(req, res)=>{
            const limit = parseInt(req.query.limit);
            const result = await toysCollection.find().limit(limit).toArray();
            res.send(result)
        })

        app.get('/searchByName/:name', async(req, res) => {
            const searchValue = req.params.name;
            if (!searchValue) {
                return res.status(400).json({ error: 'Search term is required' });
              }
            const result = await toysCollection.find({ name: { $regex: searchValue, $options: "i" } }).toArray();
            res.send(result)
        })

        app.get('/username', async(req, res) => {
            const username = req.query.email;
            const query = {"email": username};
            const result = await toysCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/toys', async(req, res) => {
            const toy = req.body;
            const result = await toysCollection.insertOne(toy);
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Education toys server is running')
})
app.listen(port, () => {
    console.log(`Education toys server on port: ${port}`);
})