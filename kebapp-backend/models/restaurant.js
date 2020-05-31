const mongoose = require('mongoose');

const RestaurantSchema=mongoose.Schema({
    name:String,
    location :{
        longitude:Number,
        latitude:Number
    }
});

module.exports=mongoose.model('Restaurant',RestaurantSchema);