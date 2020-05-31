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

app.get("/", (req, res) => {
  res.json({
    message: "Hello world!",
  });
});

app.post("/rate", (req, res) => {
  //req inculedes the location, the price and the rating type: either positive or negative
  //res sends back the new rating for the price
  //update the row in the collection
});

app.post("/price", (req, res) => {
  //req includes the location coordinates, the new price
  //res sends back the saved row
  //insert a new row to prices
  //if the row exist, add one positive rating
});

app.get("/price", (req, res) => {
  //req includes the coordinates for the place
  //res sends back prices for the location
  //query from our mongodb
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

        json.features.forEach((doc) => {
          console.log(doc.place_name);
          locationsArray.push({
            type: "Feature",
            geometry: {
              type: doc.geometry.type,
              coordinates: [
                doc.geometry.coordinates[0],
                doc.geometry.coordinates[1],
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
            console.log(restaurantName + " is saved.")
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
