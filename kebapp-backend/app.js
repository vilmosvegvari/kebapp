
const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.listen(3000, ()=>{
    connectToDB();
    console.log('Listening on http://localhost:3000/');
});

function connectToDB(){
    mongoose.connect('mongodb://localhost/kebapp',{useUnifiedTopology: true, useNewUrlParser: true},()=>{
        console.log("connected to db");
    });
}

app.get('/', (req,res)=>{
    res.json({
        "message": "Hello world!"
    });
})

app.post('/rate', (req,res)=>{
    //req inculedes the unique restaurant name, the price and the rating type: either positive or negative
    //res sends back the new rating for the price
    //update the row in the collection
})

app.get('/restaurant', (req,res)=>{
    //req includes the current longitude, latitude
    //res sends back the restaurants and the prices for the local area
    //query from the collection, and respond with a list
})