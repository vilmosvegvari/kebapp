const express = require("express");
const mongoose = require("mongoose");
const https = require("https");
const bodyparser = require("body-parser");
const async = require("async");

const cors = require("cors");

const cfg = require("./config");
const app = express();
const port = cfg.port;
const mongoIP = cfg.mongoIP;
const mapboxApiKey = cfg.mapboxApiKey;
const Price = require("./models/price.js");
const Restaurant = require("./models/restaurant.js")
const mapboxPlacesUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places/";

app.use(cors());
app.use(bodyparser.json());

app.listen(port, () => {
  connectToDB();
  console.log("Listening on " + port);
});

function connectToDB() {
  mongoose.connect(
    mongoIP,
    { useUnifiedTopology: true, useNewUrlParser: true },
    () => {
      console.log("connected to db");
    }
  );
}

app.post("/rate", async (req, res) => {
  //get restaurant, price, food, rating, rating type from req
  let cRestaurant = "Jimmy's Kebab, Torna utca 6., Sopron, Gyor-Moson-Sopron 9400, Hungary";
  let cPrice = 1050;
  let cFood = "kebab"
  let cRating = 10;
  let ratingType = "positiv"
  var rating = 0;
  if (ratingType == "positive") {
    rating = 1;
  } else rating = -1

  let currentFood = await Price.findOneAndUpdate({
    price: cPrice,
    restaurant: cRestaurant,
    food: cFood,
    rating: cRating
  }, {
    rating: cRating + rating
  }, { new: true });

  console.log("Updated rating: " + currentFood);

  res.json(currentFood);
});

app.post("/price", async (req, res) => {
  //get restname, food and price from req
  let cRestaurant = "Jimmy's Kebab, Torna utca 6., Sopron, Gyor-Moson-Sopron 9400, Hungary";
  let cPrice = 1060;
  let cFood = "kebab"

  let currentFood = await Price.findOne({
    price: cPrice,
    restaurant: cRestaurant,
    food: cFood
  });

  if (currentFood != null) {
    currentFood = await Price.updateOne(
      { _id: currentFood._id },
      { rating: currentFood.rating + 1 }
    );

    currentFood = await Price.findOne({
      price: cPrice,
      restaurant: cRestaurant,
      food: cFood
    });
    console.log("Updated food: " + currentFood);
    res.json(currentFood);
  } else {
    currentFood = new Price({
      price: cPrice,
      rating: 0,
      restaurant: cRestaurant,
      food: cFood
    });

    currentFood.save((err) => {
      if (err != null) {
        console.log(err);
      } else {
        console.log(currentFood + " is saved");
        res.json(currentFood);
      }
    });
  }
});

app.post("/restaurant", (req, res) => {
  if (req.body.zoom < 13) {
    res.json(null);
  } else {
    let lng = req.body.lng;
    let lat = req.body.lat;
    var url = mapboxPlacesUrl + "fast_food.json?proximity=" + lng + "," + lat + "&access_token=" + mapboxApiKey;

    https.get(url, (response) => {
      let results = "";
      response.setEncoding("utf-8");
      response.on("data", (bodyChunk) => {
        results += bodyChunk;
      });

      response.on("end", () => {
        let json = JSON.parse(results);
        var locationsArray = [];

        json.features.forEach((feature) => {
          console.log(feature.place_name);
          locationsArray.push({
            type: "Feature",
            geometry: {
              type: feature.geometry.type,
              coordinates: [
                feature.geometry.coordinates[0],
                feature.geometry.coordinates[1],
              ],
            }
          });
        });

        res.json({
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: locationsArray,
          }
        });
      });
    });
  }
});

app.post('/restaurant/info', async (req, res) => {
  let loc = {
    longitude: req.body.lng,
    latitude: req.body.lat
  }

  let currentRestaurant = await Restaurant.findOne({
    location: loc
  });

  if (currentRestaurant != null) {
    Price.find({ restaurant: currentRestaurant.name }).exec((err, results) => {
      if (err != null) {
        console.log(err);
      }

      var prices = [];
      results.forEach((doc) => {
        prices.push({
          food: doc.food,
          price: doc.price,
          rating: doc.rating
        });
      });

      res.json({
        name: currentRestaurant.name,
        prices: prices
      });
    });
  }
  else {
    var url = mapboxPlacesUrl + loc.longitude + "," + loc.latitude + ".json?access_token=" + mapboxApiKey;

    https.get(url, (response) => {
      let results = "";
      response.setEncoding("utf-8");
      response.on("data", (bodyChunk) => {
        results += bodyChunk;
      });

      response.on("end", () => {
        let restaurantName = JSON.parse(results).features[0].place_name;

        let restaurant = new Restaurant({
          name: restaurantName,
          location: loc
        });

        restaurant.save((err) => {
          if (err != null) {
            console.log(err);
          } else {
            console.log(restaurant + " is saved.")
          }
        })

        res.json({
          name: restaurantName,
          prices: []
        })
      });
    });
  }
});

/*

░░░░░▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░
░░░▓▓▓▓▓▓▒▒▒▒▒▒▓▓░░░░░░░
░░▓▓▓▓▒░░▒▒▓▓▒▒▓▓▓▓░░░░░
░▓▓▓▓▒░░▓▓▓▒▄▓░▒▄▄▄▓░░░░
▓▓▓▓▓▒░░▒▀▀▀▀▒░▄░▄▒▓▓░░░
▓▓▓▓▓▒░░▒▒▒▒▒▓▒▀▒▀▒▓▒▓░░
▓▓▓▓▓▒▒░░░▒▒▒░░▄▀▀▀▄▓▒▓░
▓▓▓▓▓▓▒▒░░░▒▒▓▀▄▄▄▄▓▒▒▒▓
░▓█▀▄▒▓▒▒░░░▒▒░░▀▀▀▒▒▒▒░
░░▓█▒▒▄▒▒▒▒▒▒▒░░▒▒▒▒▒▒▓░
░░░▓▓▓▓▒▒▒▒▒▒▒▒░░░▒▒▒▓▓░
░░░░░▓▓▒░░▒▒▒▒▒▒▒▒▒▒▒▓▓░
░░░░░░▓▒▒░░░░▒▒▒▒▒▒▒▓▓░░

*/