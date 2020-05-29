const mongoose = require('mongoose');

const RestaurantSchema=mongoose.Schema({
    longitude:Number,
    latitude:Number,
    uniqueName:String
});

module.exports=mongoose.model('Restaurants',RestaurantSchema);