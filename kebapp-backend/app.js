
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