const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());

// mongoDB uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@porfolioprojects.vkb3mrm.mongodb.net/?retryWrites=true&w=majority`;

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

        const database = client.db('JoyaJewelry');
        const usersCollection = database.collection('users');
        const brandsCollection = database.collection('brands');
        const productsCollection = database.collection('products');

        // add product
        app.post('/add-product', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })

        // save user info when user registers using email and password
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const name = req.body.name;
            const photoURL = req.body.photoURL;
            const gender = req.body.gender;
            const phone = req.body.phone;
            const address = req.body.address;

            const query = { email: email }
            const options = { upsert: true }

            const updateDoc = {
                $set: {
                    name: name,
                    email: email,
                    photoURL: photoURL,
                    gender: gender,
                    phone: phone,
                    address: address,
                }
            }

            const result = await usersCollection.updateOne(query, updateDoc, options);

            res.send(result);
        });

        // save user info when user logs in using google
        app.put('/users/google/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email }
            const options = { upsert: true }

            const updateDoc = {
                $set: {
                    email: email
                }
            }

            const result = await usersCollection.updateOne(query, updateDoc, options);
            console.log(result);
            res.send(result);
        });

        // brands route
        app.get('/brands', async (req, res) => {
            const sortingCriteria = { name: 1 };
            const documents = await brandsCollection.find({}).sort(sortingCriteria).toArray();
            res.send(documents);
        });

        // get new arrivals
        app.get('/new-arrivals', async (req, res) => {
            const query = {};
            const sort = { dateAdded: -1 };
            const limit = 10
            const products = await productsCollection.find(query).sort(sort).limit(limit).toArray();
            res.send(products);
        });

        // get trending products
        app.get('/trending-products', async (req, res) => {
            const query = {};
            const sort = { views: -1 };
            const limit = 10
            const products = await productsCollection.find(query).sort(sort).limit(limit).toArray();
            res.send(products);
        });

        app.get('/', (req, res) => {
            res.send('Hello World!')
        });




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})