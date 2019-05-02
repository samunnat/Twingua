import * as React from "react";
import Leaflet from "leaflet";
import RadioButton from "../atoms/radioButton.jsx";
import socketIO from "socket.io-client";
import { stylesListToClassNames } from "../../lib/utils";

const classes = stylesListToClassNames({
  map: {
    display: "block",
    height: "100vh",
    // position: "absolute",
    width: "100vw"
    // zIndex: 0
  },
  page: {
    display: "block",
    position: "absolute",
    zIndex: 10000
  },
  buttonContainer: {
    position: "fixed",
    bottom: ".75%",
    left: "1%"
  }
});

const colors = [
  "#EF9A9A",
  "#F44336",
  "#880E4F",
  "#F48FB1",
  "#AB47BC",
  "#7B1FA2",
  "#283593",
  "#9FA8DA",
  "#1565C0",
  "#90CAF9",
  "#0288D1",
  "#81D4FA",
  "#80DEEA",
  "#00897B",
  "#80CBC4",
  "#A5D6A7",
  "#43A047",
  "#FFEE58",
  "#FFA000",
  "#FFE0B2",
  "#FF5722",
  "#D84315",
  "#BCAAA4",
  "#795548",
  "#37474F",
  "#B0BEC5",
  "#004D40",
  "#827717",
  "#880E4F",
  "#FF6F00",
  "#B71C1C",
  "#E8F5E9",
  "#E8EAF6",
  "#FFEBEE",
  "#212121"
];

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      radioValue: "label"
    };
  }

  componentDidMount() {
    this.socket = socketIO("http://localhost:4000");
    this.socket.on("return-languages", this.addPolygon);
    // this.socket.on("connect", function(socket) {
    //   console.log("Connected!");
    // });
    // Creating the map
    // NOTE: Might want to add bounds to the map
    this.layers = {
      labels: Leaflet.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }
      ),
      noLabels: Leaflet.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }
      )
    };

    this.map = Leaflet.map("map", {
      center: [52.5, 0],
      minZoom: 4,
      zoom: 5,
      layers: [this.layers.labels]
    });

    // Map zoom handler
    this.map.on("moveend", this.zoomHandler); // This handles moving and zoom
  }

  addPolygon = jsonObj => {
    console.log("server says hello world");
    // const key = Object.keys(jsonObj)[0];
    // const coords = key.split(",").map(ele => parseFloat(ele));
    // const languages = Object.keys(jsonObj[key]);
    // var max = (-1, -1);
    // languages.forEach((count, index) => {
    //   if (count > max[1]) {
    //     max = (index, count);
    //   }
    // });

    // if (max[0] !== -1) {
    //   Leaflet.polygon(
    //     [
    //       [coords[0], coords[1]], // lat1, long1
    //       [coords[0], coords[3]], // lat1, long2
    //       [coords[2], coords[3]], // lat2, long2
    //       [coords[2], coords[1]] // lat2, long1
    //     ],
    //     {
    //       color: colors[Math.floor(Math.random() * colors.length)],
    //       fillOpacity: 0.2
    //     }
    //   ).addTo(this.map);
    // }
  };

  zoomHandler = e => {
    this.socket.emit("get-languages", "hello world");

    // Call API to query bounding box information
    var precision;
    switch (e.target._zoom) {
      case 4:
      case 5:
      case 6:
        precision = 4;
        break;
      case 7:
      case 8:
        precision = 5;
        break;
      default:
        precision = 6;
        break;
    }

    console.log("Zoom level: " + e.target._zoom);
    const bounds = this.map.getBounds();
    const SW = { lat: bounds._southWest.lat, lng: bounds._southWest.lng };
    const NE = { lat: bounds._northEast.lat, lng: bounds._northEast.lng };
    // TESTING
    precision = 4;

    this.updateBBoxes(SW, NE, precision);
  };

  updateBBoxes = (SW, NE, precision) => {
    fetch(
      `http://localhost:4000/languages?lat1=${SW.lat}&long1=${SW.lng}&lat2=${
        NE.lat
      }&long2=${NE.lng}&precision=${precision}`,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
      .then(response => response.json())
      .then(data => {
        this.clearMap();
        data.forEach(val => {
          const key = Object.keys(val)[0];
          const coords = key.split(",").map(ele => parseFloat(ele));
          const languages = Object.keys(val[key]);
          var max = (-1, -1);
          languages.forEach((count, index) => {
            if (count > max[1]) {
              max = (index, count);
            }
          });

          if (max[0] !== -1) {
            Leaflet.polygon(
              [
                [coords[0], coords[1]], // lat1, long1
                [coords[0], coords[3]], // lat1, long2
                [coords[2], coords[3]], // lat2, long2
                [coords[2], coords[1]] // lat2, long1
              ],
              {
                color: colors[Math.floor(Math.random() * colors.length)],
                fillOpacity: 0.2
              }
            ).addTo(this.map);
          }
        });
      })
      .catch(e =>
        console.log("Can’t access endpoint. Blocked by browser?" + e)
      );
  };

  clearMap = () => {
    for (var i in this.map._layers) {
      if (this.map._layers[i]._path !== undefined) {
        try {
          this.map.removeLayer(this.map._layers[i]);
        } catch (e) {
          console.log("problem with " + e + this.map._layers[i]);
        }
      }
    }
  };

  radioHandler = e => {
    this.setState({ radioValue: e.target.value });
    if (e.target.value === "label") {
      this.map.removeLayer(this.layers.noLabels);
      this.map.addLayer(this.layers.labels);
    } else {
      this.map.removeLayer(this.layers.labels);
      this.map.addLayer(this.layers.noLabels);
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className={classes.page}>
          <div className={classes.buttonContainer}>
            <RadioButton
              value="label"
              text="With Labels"
              checked={this.state.radioValue === "label"}
              onChange={this.radioHandler}
            />
            <RadioButton
              value="no-label"
              text="No Labels"
              checked={this.state.radioValue !== "label"}
              onChange={this.radioHandler}
            />
          </div>
        </div>
        <div id="map" className={classes.map} />
      </React.Fragment>
    );
  }
}

export default Map;
