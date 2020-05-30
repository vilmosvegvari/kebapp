import React from "react";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

let map;

let jsonPost = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
};

class Application extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: 16.83519,
      lat: 47.556339,
      zoom: 13,
    };
  }

  componentDidMount() {
    map = new mapboxgl.Map({
      container: this.mapContainer,
      style: "mapbox://styles/mapbox/outdoors-v11",
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom,
    });

    map.on("load", () => {
      map.loadImage(
        "https://image.flaticon.com/icons/png/512/541/541769.png",
        function (error, image) {
          if (error) throw error;
          map.addImage("kebab", image);
        }
      );
    });

    map.on("moveend", () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2),
      });
      jsonPost.body = JSON.stringify({
        lng: this.state.lng,
        lat: this.state.lat,
        zoom: this.state.zoom,
      });

      fetch(process.env.REACT_APP_BACKEND_URL + "restaurant", jsonPost).then(
        (response) => {
          if (response) this.addLayerwithPoints(response);
        }
      );
    });
  }

  addLayerwithPoints(source) {
    if (map.getLayer("kebabLayer")) map.removeLayer("kebabLayer");
    if (map.getSource("kebabs")) map.removeSource("kebabs");
    map.addSource("kebabs", source);
    map.addLayer({
      id: "kebabLayer",
      type: "symbol",
      source: "kebabs",
      layout: {
        "icon-image": "kebab",
        "icon-size": 0.05,
      },
    });
  }

  render() {
    return (
      <div>
        <div ref={(el) => (this.mapContainer = el)} className="mapContainer" />
      </div>
    );
  }
}

ReactDOM.render(<Application />, document.getElementById("app"));
