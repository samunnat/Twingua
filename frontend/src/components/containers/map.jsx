import * as React from "react";
import Leaflet from "leaflet";

import { stylesListToClassNames } from "../../lib/utils";

const classes = stylesListToClassNames({
  map: {
    display: "block",
    height: "100vh",
    width: "100vw"
  }
});

class Map extends React.Component {
  zoomHandler = () => {
    // Call API to query bounding box information
    console.log("zoom end");
  };

  componentDidMount() {
    // Creating the map
    // NOTE: Might want to add bounds to the map
    this.map = Leaflet.map("map", {
      center: [47.526, 0],
      zoom: 5,
      layers: [
        Leaflet.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          }
        )
      ]
    });

    // Map zoom handler
    this.map.on("zoomend", this.zoomHandler);

    // Adding bounding boxes
    this.boundingBoxes = new Array(10);
    for (let i = 0; i < 10; i++) {
      this.boundingBoxes[i] = [];

      for (let j = 0; j < 10; j++) {
        this.boundingBoxes[i].push(
          Leaflet.polygon(
            [[45 + i, 1 + j], [46 + i, 1 + j], [46 + i, j], [45 + i, j]],
            { color: "gray", fillOpacity: 0.3 }
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
    this.boundingBoxes[1][1].setStyle({
      fillColor: "#4c4c4c",
      fillOpacity: 0.4
    });
  }

  render() {
    return (
      <React.Fragment>
        <div id="map" className={classes.map} />
        <span>hello </span>
      </React.Fragment>
    );
  }
}

export default Map;
