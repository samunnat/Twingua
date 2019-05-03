import * as React from "react";
import Leaflet from "leaflet";
import RadioButton from "../atoms/radioButton.jsx";
import socketIO from "socket.io-client";
import Hidden from "@material-ui/core/Hidden";
import Navigator from "./Navigator";
import { stylesListToClassNames } from "../../lib/utils";

const drawerWidth = 256;
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

const colors = {
  en: "#EF9A9A",
  fr: "#F44336",
  ch: "#880E4F"
  // "#F48FB1",
  // "#AB47BC",
  // "#7B1FA2",
  // "#283593",
  // "#9FA8DA",
  // "#1565C0",
  // "#90CAF9",
  // "#0288D1",
  // "#81D4FA",
  // "#80DEEA",
  // "#00897B",
  // "#80CBC4",
  // "#A5D6A7",
  // "#43A047",
  // "#FFEE58",
  // "#FFA000",
  // "#FFE0B2",
  // "#FF5722",
  // "#D84315",
  // "#BCAAA4",
  // "#795548",
  // "#37474F",
  // "#B0BEC5",
  // "#004D40",
  // "#827717",
  // "#880E4F",
  // "#FF6F00",
  // "#B71C1C",
  // "#E8F5E9",
  // "#E8EAF6",
  // "#FFEBEE",
  // "#212121"
};

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      radioValue: "label",
      data: {}
    };
  }

  componentDidMount() {
    const defaultZoom = 11; //5; remember to change default precision below

    // Creating socket to retrieve bounding box data
    this.socket = socketIO("http://localhost:4000");
    this.socket.on("return-languages", this.addPolygons);

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
      zoom: defaultZoom,
      layers: [this.layers.labels]
    });

    // Variables to keep track of map status
    this.loadedCoords = this.map.getBounds();
    console.log(this.loadedCoords);
    this.prevPrecision = 6;

    // Map zoom handler
    this.map.on("moveend", this.mapViewChangeHandler); // This handles moving and zoom
  }

  // Callback socketio function that takes the bbox data and adds them as polygons to the map
  addPolygons = (data, doClear, debug) => {
    if (doClear) {
      this.clearMap();
    }
    // this.setState({})
    data.forEach(bboxData => {
      const key = Object.keys(bboxData)[0];
      const coords = key.split(",").map(ele => parseFloat(ele));
      const languages = Object.keys(bboxData[key]);
      var maxLang = [-1, -1];
      languages.forEach(langKey => {
        if (bboxData[key][langKey] > maxLang[1]) {
          maxLang = [langKey, bboxData[key][langKey]];
        }
      });

      if (maxLang[1] !== -1) {
        Leaflet.rectangle(
          [
            [coords[0], coords[1]], // lat1, long1
            [coords[0], coords[3]], // lat1, long2
            [coords[2], coords[3]], // lat2, long2
            [coords[2], coords[1]] // lat2, long1
          ],
          {
            color: colors[maxLang[0]],
            fillOpacity: 0.05
          }
        ).addTo(this.map);
      }
    });
  };

  // Function that handles map view changes
  mapViewChangeHandler = e => {
    // Call API to query bounding box information
    console.log(this.map._layers);
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

    const bounds = this.map.getBounds();
    // Checking what change occurred
    if (this.prevPrecision === precision) {
      // View shifted: Could have been a zoom or drag
      const SW1 = {
        lat: this.loadedCoords._southWest.lat,
        lng: this.loadedCoords._southWest.lng
      };
      const NE1 = {
        lat: this.loadedCoords._northEast.lat,
        lng: this.loadedCoords._northEast.lng
      };

      const SW2 = {
        lat: bounds._southWest.lat,
        lng: bounds._southWest.lng
      };
      const NE2 = {
        lat: bounds._northEast.lat,
        lng: bounds._northEast.lng
      };

      // Finding slices that we have not loaded yet
      if (NE2.lat > NE1.lat) {
        // There is top slice to load
        console.log("load top slice");
        const sliceSW = {
          lat: NE1.lat,
          lng: SW2.lng
        };
        const sliceNE = {
          lat: NE2.lat,
          lng: NE2.lng
        };

        this.socket.emit(
          "get-languages-slice",
          sliceSW,
          sliceNE,
          precision,
          false,
          "top"
        );
      }

      if (SW2.lat < SW1.lat) {
        // There is a bottom slice to load
        console.log("load bottom slice");
        const sliceSW = {
          lat: SW2.lat,
          lng: SW2.lng
        };
        const sliceNE = {
          lat: SW1.lat,
          lng: NE2.lng
        };
        this.socket.emit(
          "get-languages-slice",
          sliceSW,
          sliceNE,
          precision,
          false,
          "bottom"
        );
      }

      if (NE2.lng > NE1.lng) {
        // There is a right slice to load
        console.log("load right slice");
        const sliceSW = {
          lat: Math.max(SW1.lat, SW2.lat),
          lng: NE1.lng
        };
        const sliceNE = {
          lat: Math.min(NE1.lat, NE2.lat),
          lng: NE2.lng
        };
        this.socket.emit(
          "get-languages-slice",
          sliceSW,
          sliceNE,
          precision,
          false,
          "right"
        );
      }

      if (SW2.lng < SW1.lng) {
        // There is a left slice to load
        console.log("load left slice");
        const sliceSW = {
          lat: Math.max(SW2.lat, SW1.lat),
          lng: SW2.lng
        };
        const sliceNE = {
          lat: Math.min(NE1.lat, NE2.lat),
          lng: SW1.lng
        };
        this.socket.emit(
          "get-languages-slice",
          sliceSW,
          sliceNE,
          precision,
          false,
          "left"
        );
      }

      this.loadedCoords = bounds;
      console.log(this.loadedCoords);
    } else {
      // Precision changed. Need to clear map and load in new bbox data
      // NOTE: The map is cleared once the socket event 'addPolygons' is called
      const SW = {
        lat: bounds._southWest.lat,
        lng: bounds._southWest.lng
      };
      const NE = {
        lat: bounds._northEast.lat,
        lng: bounds._northEast.lng
      };
      this.prevPrecision = precision;
      this.loadedCoords = bounds;
      this.socket.emit("get-languages", SW, NE, precision, true);
    }

    // console.log(bounds);

    console.log("Zoom level: " + e.target._zoom);

    // // Splitting and reformatting bounds object
    // const SW = { lat: bounds._southWest.lat, lng: bounds._southWest.lng };
    // const NE = { lat: bounds._northEast.lat, lng: bounds._northEast.lng };

    // this.socket.emit("get-languages", SW, NE, precision);
  };

  // Function to clear all layers on the leaflet map
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

  compareBounds = (bound1, bound2) => {
    const equalNELat = bound1._northEast.lat === bound2._northEast.lat;
    const equalSWLat = bound1._southWest.lat === bound2._southWest.lat;
    const equalNELong = bound1._northEast.lng === bound2._northEast.lng;
    const equalSWLong = bound1._southWest.lng === bound2._southWest.lng;

    return (
      equalNELat === equalSWLat &&
      equalSWLat === equalNELong &&
      equalNELong === equalSWLong
    );
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
        <Hidden xsDown implementation="css">
          <Navigator PaperProps={{ style: { width: drawerWidth } }} />
        </Hidden>
      </React.Fragment>
    );
  }
}

export default Map;
