const mongoose = require('mongoose');

const PriceSchema=mongoose.Schema({
    uniqueRestaurantName:String,
    price: Number,
    rating: Number
});

module.exports=mongoose.model('Prices',PriceSchema);