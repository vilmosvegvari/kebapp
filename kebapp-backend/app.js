const express = require("express");
const mongoose = require("mongoose");
const https = require("https");

const cors = require("cors");

const cfg = require("./config");
const app = express();
const port = cfg.port;
const mongoIP = cfg.mongoIP;
const mapboxApiKey = cfg.mapboxApiKey;
const priceSchema = require("./models/price.js");
const mapboxPlacesUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places/";

app.use(cors());

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
  //get coordinates from req
  //get zoom from req
  //calculate the box
  //response json:
  //loop the features remove unnecessary
  //remove query before
  let lx = -77.083056;
  let ly = 38.908611;
  let rx = -76.997778;
  let ry = 38.959167;
  var url =
    mapboxPlacesUrl +
    "starbucks.json?bbox=" +
    lx +
    "," +
    ly +
    "," +
    rx +
    "," +
    ry +
    "&access_token=" +
    mapboxApiKey;

  https.get(url, (response) => {
    let results = "";
    response.setEncoding("utf-8");
    response.on("data", (bodyChunk) => {
      results += bodyChunk;
    });

    response.on("end", () => {
      let json = JSON.parse(results);
      var geometryArray = [];

      json.features.forEach((element) => {
        geometryArray.push({
          type: "Feature",
          geometry: {
            type: element.geometry.type,
            coordinates: [
              element.geometry.coordinates[0],
              element.geometry.coordinates[1],
            ],
          }
        });
      });

      let resJson = {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: geometryArray,
        },
      };
      console.log(resJson);
      res.setHeader("Content-Type", "application/json");
      res.json(resJson);
    });
  });
});
