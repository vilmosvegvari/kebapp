
const express = require('express');
const mongoose = require('mongoose');
const https = require('https');

const cfg = require('./config');
const app = express();
const port = cfg.port;
const mongoIP = cfg.mongoIP;
const mapboxApiKey = cfg.mapboxApiKey;
const priceSchema = require('./models/price.js');

app.listen(port, ()=>{
    connectToDB();
    console.log('Listening on ' + port);
});

function connectToDB(){
    mongoose.connect(mongoIP, {useUnifiedTopology: true, useNewUrlParser: true},()=>{
        console.log("connected to db");
    });
}

app.get('/', (req,res)=>{
    res.json({
        "message": "Hello world!"
    });
})

app.post('/rate', (req,res)=>{
    //req inculedes the location, the price and the rating type: either positive or negative
    //res sends back the new rating for the price
    //update the row in the collection
})

app.post('/price', (req,res)=>{
    //req includes the location coordinates, the new price
    //res sends back the saved row
    //insert a new row to prices
    //if the row exist, add one positive rating
})

app.get('/price', (req,res)=>{
    //req includes the coordinates for the place
    //res sends back prices for the location
    //query from our mongodb
})

app.get('/restaurant', (req,res)=>{
    //req includes the bbox coordinates
    //eg: 
    /*
        {
            "left corner": {
                "x": 77.083056,
                "y": 38.908611
            },
            "right corner": {
                "x": -76.997778,
                "y": 38.959167
            }
        }
    */
   //res sends back the result from the query using mapbox places
   //query from https://api.mapbox.com/geocoding/v5/mapbox.places/ and send the data to the frontend
   //https query eg: https://api.mapbox.com/geocoding/v5/mapbox.places/kebab.json?bbox=-77.083056,38.908611,-76.997778,38.959167&access_token=mapboxApiKey
})