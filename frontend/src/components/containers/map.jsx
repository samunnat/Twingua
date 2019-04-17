import * as React from "react";
import Leaflet from "leaflet";
import RadioButton from "../atoms/radioButton.jsx";

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

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      radioValue: "label"
    };

    // this.colors = {}
    this.colors = [
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
  }

  componentDidMount() {
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
    this.map.on("zoomend", this.zoomHandler);

    // Adding bounding boxes
    const incrementAmt = 0.1;
    const end = 5;
    this.boundingBoxes = new Array(end / incrementAmt);
    for (let i = 0; i < end; i += incrementAmt) {
      this.boundingBoxes[i] = [];

      for (let j = 0; j < end; j += incrementAmt) {
        this.boundingBoxes[i].push(
          Leaflet.polygon(
            // [[0, 0], [0, 1], [1, 1], [1, 0]],
            [
              [45 + i, j],
              [45 + i, incrementAmt + j],
              [45 + incrementAmt + i, incrementAmt + j],
              [45 + incrementAmt + i, j]
            ],
            {
              color: this.colors[
                Math.floor(Math.random() * this.colors.length)
              ],
              fillOpacity: 0.2
            }
          ).addTo(this.map)
        );
      }
    }

    // Adding a polygon to the map
    // var polygon = Leaflet.polygon(
    //   [[47.526, -1.5], [46.526, -1.5], [46.526, -0.0], [47.526, -0.0]],
    //   { color: "red" }
    // ).addTo(this.map);

    // Changing the color of a bounding box
    // this.boundingBoxes[1][1].setStyle({
    //   fillColor: "#4c4c4c",
    //   fillOpacity: 0.4
    // });
  }

  zoomHandler = e => {
    // Call API to query bounding box information
    console.log("Zoom level: " + e.target._zoom);
    const bounds = this.map.getBounds();
    const northWest = {
      lat: bounds._northEast.lat,
      long: bounds._southWest.lng
    };
    const southEast = {
      lat: bounds._southWest.lat,
      long: bounds._northEast.lng
    };
    console.log(this.map.getBounds());
    console.log([northWest, southEast]);
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
