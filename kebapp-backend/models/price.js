const mongoose = require('mongoose');

const PriceSchema=mongoose.Schema({
    price: Number,
    rating: Number,
    restaurant: String,
    food: String
});

module.exports=mongoose.model('Price',PriceSchema);