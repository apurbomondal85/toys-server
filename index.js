const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}@cluster0.unnbbpt.mongodb.net/?retryWrites=true&w=majority`;

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}@cluster0.ph7tdpg.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const toysCollection = client.db("toysDB").collection("toys");

        // total toys 
        app.get('/totalProducts', async(req, res)=>{
            const result = await toysCollection.estimatedDocumentCount();
            res.send({totalProducts : result});
        })

        // get all toys products
        app.get('/AllToys', async (req, res) => {
            const limit = parseInt(req.query.limit) || 6;
            const page = parseInt(req.query.page) || 0;
            const skip = page * limit;
            const result = await toysCollection.find().skip(skip).limit(limit).toArray();
            res.send(result);
        })

        // single toy get by id
        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result)
        })

        // toys get by category
        app.get('/category/:category', async (req, res) => {
            const category = req.params.category;
            const query = { "category": category }
            const result = await toysCollection.find(query).toArray();
            res.send(result)
        })

        // toys get by limited
        app.get('/limitToys', async (req, res) => {
            const limit = parseInt(req.query.limit);
            const result = await toysCollection.find().limit(limit).toArray();
            res.send(result)
        })

        // toys get by search
        app.get('/searchByName/:name', async (req, res) => {
            const searchValue = req.params.name;
            if (!searchValue) {
                return res.status(400).json({ error: 'Search term is required' });
            }
            const result = await toysCollection.find({ name: { $regex: searchValue, $options: "i" } }).toArray();
            res.send(result)
        })

        // toys get by only username
        app.get('/username', async (req, res) => {
            const username = req.query.email;
            const query = { "email": username };
            const result = await toysCollection.find(query).toArray();
            res.send(result)
        })

        // Shorted by price
        app.get('/sortPrice', async(req, res) =>{
            const sortOrder = req.query.sortOrder == 'descending' ? -1 : 1;
            const email = req.query.email;
            const query = {"price": sortOrder}
            const result = await toysCollection.find({email}).sort(query).toArray();
            res.send(result)
        })

        // post toy in mongodb form client side
        app.post('/toys', async (req, res) => {
            const toy = req.body;
            const result = await toysCollection.insertOne(toy);
            res.send(result)
        })

        // update toy property
        app.put('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const updateToyValue = req.body;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateTay = {
                $set: {
                    price: updateToyValue.price,
                    quantity: updateToyValue.quantity,
                    description: updateToyValue.description
                }
            }
            const result = await toysCollection.updateOne(query, updateTay, options)
            res.send(result)
        })
        // single toy deleted
        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.deleteOne(query);
            res.send(result)
        })
    } finally {
        
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Education toys server is running')
})
app.listen(port, () => {
    console.log(`Education toys server on port: ${port}`);
})