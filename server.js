const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const PORT = 3000;
require('dotenv').config();

// DB string
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'yakuza-crafting-list'

// MongoDB connection
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    });

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// GET
app.get('/', async (req, res) => {
    // const craftItems = await db.collection('craft-list').find().toArray()
    // const craftIncomplete = await db.collection('craft-list').countDocuments({completed: false})
    // res.render('index.ejs', { items: craftItems, left: craftIncomplete })
    db.collection('craft-list').find().toArray()
    .then(data => {
        db.collection('craft-list').countDocuments({completed: false})
        .then(itemsLeft => {
            res.render('index.ejs', { items: data, left: itemsLeft })
        })
    })
});

// POST
app.post('/addCraftingItem', (req, res) => {
    db.collection('craft-list').insertOne({item: req.body.craftingItem, material1: req.body.mat1, material2: req.body.mat2, material3: req.body.mat3, material4: req.body.mat4, material5: req.body.mat5, material6: req.body.mat6, material7: req.body.mat7,  completed: false})
    .then(result => {
        console.log('Crafting Item Added')
        res.redirect('/')
    })
    .catch(error => console.error(error))
});

// PUT
app.put('/markComplete', (req, res) => {
    db.collection('craft-list').updateOne({item: req.body.itemFromJS}, {
        $set: {
            completed: true
        }
    }, {
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Completed')
        res.json('Marked Completed')
    })
    .catch(error => console.error(error))
});

app.put('/markIncomplete', (req, res) => {
    db.collection('craft-list').updateOne({item: req.body.itemFromJS}, {
        $set: {
            completed: false
        }
    }, {
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked incomplete')
        res.json('Marked incomplete')
    })
    .catch(error => console.error(error))
});

// DELETE
app.delete('/deleteItem', (req, res) => {
    db.collection('craft-list').deleteOne({item: req.body.itemFromJS})
    .then(result => {
        console.log('Item Deleted')
        res.json('Item Deleted')
    })
    .catch(error => console.error(error))
});

// PORT listen
app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});