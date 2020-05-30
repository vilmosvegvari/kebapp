const mongoose = require('mongoose');

const PriceSchema=mongoose.Schema({
    price: Number,
    rating: Number,
    location :{
        longitude:Number,
        latitude:Number
    }
});

module.exports=mongoose.model('Prices',PriceSchema);