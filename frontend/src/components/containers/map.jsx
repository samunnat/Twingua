import * as React from "react";
import Leaflet from "leaflet";
import socketIO from "socket.io-client";
import Hidden from "@material-ui/core/Hidden";
import * as d3Select from "d3-selection";
import RadioButton from "../atoms/radioButton.jsx";
import Navigator from "./Navigator.jsx";
import Legend from "./legend.jsx";
import {stylesListToClassNames, getCountryName} from "../../lib/utils";
import LanguageWorker from "worker-loader!./language-worker.js";

var drawerWidth = 256;
const classes = stylesListToClassNames({
    map: {
        display: "block",
        height: "100vh",
        // position: "absolute",
        width: "100vw",
        // zIndex: 0
    },
    page: {
        display: "block",
        position: "absolute",
        zIndex: 10000,
    },
    buttonContainer: {
        position: "fixed",
        bottom: ".75%",
        left: "1%",
    },
    buttonOpen: {
        position: "absolute",
        display: "none",
        top: "50%",
        left: "0%",
        zIndex: 20000,
    },
    buttonClose: {
        position: "absolute",
        top: "2%",
        left: drawerWidth - 10,
        color: "white",
        zIndex: 20000,
    },
});

const langKeyToStr = {
    en: "English",
    ar: "Arabic",
    bn: "Bengali",
    cs: "Czech",
    da: "Danish",
    de: "German",
    el: "Greek",
    es: "Spanish",
    fa: "Persian",
    fi: "Finnish",
    fil: "Filipino",
    fr: "French",
    he: "Hebrew",
    hi: "Hindi",
    hu: "Hungarian",
    id: "Indonesian",
    it: "Italian",
    ja: "Japanese",
    ko: "Korean",
    msa: "Malay",
    nl: "Dutch",
    no: "Norwegian",
    pl: "Polish",
    pt: "Portuguese",
    ro: "Romanian",
    ru: "Russian",
    sv: "Swedish",
    th: "Thai",
    tr: "Turkish",
    uk: "Ukrainian",
    ur: "Urdu",
    vi: "Vietnamese",
    "zh-cn": "Chinese (Simplified)",
    "zh-tw": "Chinese (Traditional)",
};

const colors = {
    en: "#BB0A21",
    ar: "#F44336",
    bn: "#880E4F",
    cs: "#F48FB1",
    da: "#AB47BC",
    de: "#7B1FA2",
    el: "#283593",
    es: "#9FA8DA",
    fa: "#1565C0",
    fi: "#003563",
    fil: "#0288D1",
    fr: "#60C2FF",
    he: "#80DEEA",
    hi: "#00897B",
    hu: "#80CBC4",
    id: "#A5D6A7",
    it: "#43A047",
    ja: "#FFEE58",
    ko: "#FFA000",
    msa: "#FFE0B2",
    nl: "#FF5722",
    no: "#D84315",
    pl: "#BCAAA4",
    pt: "#795548",
    ro: "#37474F",
    ru: "#B0BEC5",
    sv: "#004D40",
    th: "#827717",
    tr: "#880E4F",
    uk: "#FF6F00",
    ur: "#B71C1C",
    vi: "#C47D27",
    "zh-cn": "#5B295B",
    "zh-tw": "#E868E8",
};

class Map extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            radioValue: "label",
            data: [],
            filteredLangs: [],
            countryData: [],
        };
    }

    componentDidMount() {
        const defaultZoom = 5; //5; remember to change default precision below

        // Creating socket to retrieve bounding box data
        this.socket = socketIO("http://34.83.68.81:3000");
        // this.socket = socketIO("http://localhost:4000");
        this.socket.on("return-languages", this.addPolygons);
        this.socket.on("return-country-stats", this.getCountryData);

        // Creating the map
        // NOTE: Might want to add bounds to the map
        this.layers = {
            labels: Leaflet.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            }),
            noLabels: Leaflet.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            }),
        };

        this.map = Leaflet.map("map", {
            center: [52.5, 0],
            minZoom: 4,
            zoom: defaultZoom,
            layers: [this.layers.labels],
            zoomControl: false,
        });

        // Changing the position of the +/- buttons
        Leaflet.control
            .zoom({
                position: "bottomright",
            })
            .addTo(this.map);

        // Variables to keep track of map status
        this.loadedCoords = this.map.getBounds();
        this.prevPrecision = 4;
        this.prevZoom = defaultZoom;
        this.curBatch = 0;

        // var svg = d3Select.select(this.map.getPanes().overlayPane).append("svg"),
        //     g = svg.append("g").attr("class", "leaflet-zoom-hide");

        // Load the data onto the starting view
        const SW = {
            lat: this.loadedCoords._southWest.lat,
            lng: this.loadedCoords._southWest.lng,
        };
        const NE = {
            lat: this.loadedCoords._northEast.lat,
            lng: this.loadedCoords._northEast.lng,
        };

        this.socket.emit("get-languages", SW, NE, this.prevPrecision, true);
        this.socket.emit("get-country-stats");

        // Map zoom handler
        this.map.on("moveend", this.mapViewChangeHandler); // This handles moving and zoom
    }

    // Callback socketio function that takes the bbox data and adds them as polygons to the map
    addPolygons = (data, doClear) => {
        if (doClear) {
            this.clearMap();
            this.setState({data: [data]});
        } else {
            this.setState({data: [this.state.data.concat(data)]});
        }

        const halfLength = Math.ceil(data.length / 2);
        const leftData = data.splice(0, halfLength);
        const rightData = data;

        const quarterLength1 = Math.ceil(halfLength / 2);
        const quarterLength2 = Math.ceil(rightData.length / 2);

        // Splitting the data up into quarters
        const quarter1 = leftData.splice(0, quarterLength1);
        const quarter2 = leftData;
        const quarter3 = rightData.splice(0, quarterLength2);
        const quarter4 = rightData;

        const worker1 = new LanguageWorker();
        const worker2 = new LanguageWorker();
        const worker3 = new LanguageWorker();
        const worker4 = new LanguageWorker();

        // Added events for when the workers message the main thread
        this.addWorkerEvents(worker1, 1);
        this.addWorkerEvents(worker2, 2);
        this.addWorkerEvents(worker3, 3);
        this.addWorkerEvents(worker4, 4);

        // Starting the 4 workers
        this.curBatch++;
        worker1.postMessage({data: quarter1, colors: colors, filter: this.state.filteredLangs, batch: this.curBatch, zoom: this.map.getZoom()});
        worker2.postMessage({data: quarter2, colors: colors, filter: this.state.filteredLangs, batch: this.curBatch, zoom: this.map.getZoom()});
        worker3.postMessage({data: quarter3, colors: colors, filter: this.state.filteredLangs, batch: this.curBatch, zoom: this.map.getZoom()});
        worker4.postMessage({data: quarter4, colors: colors, filter: this.state.filteredLangs, batch: this.curBatch, zoom: this.map.getZoom()});
    };

    getCountryData = (data) => {
        this.setState({
            countryData: data
                .map((countryData) => {
                    const countryKey = Object.keys(countryData)[0];
                    const countryName = getCountryName(countryKey);
                    const obj = {};
                    obj[countryName] = countryData[countryKey];
                    return obj;
                })
                .filter((ele) => {
                    return Object.keys(ele)[0] !== "null";
                }),
        });
    };

    addWorkerEvents = (worker) => {
        worker.onmessage = (e) => {
            const message = e.data;
            if (message.type === "done") {
                // console.log("terminate worker");
                worker.terminate();
            } else if (message.type === "data") {
                if (this.curBatch === message.batch || this.map.getZoom() === message.zoom) {
                    message.data.forEach((ele) => {
                        Leaflet.rectangle(
                            [
                                [ele.coords[0], ele.coords[1]], // lat1, long1
                                [ele.coords[0], ele.coords[3]], // lat1, long2
                                [ele.coords[2], ele.coords[3]], // lat2, long2
                                [ele.coords[2], ele.coords[1]], // lat2, long1
                            ],
                            {
                                color: colors[ele.maxLang[0].replace(/"/g, "")],
                                fillOpacity: 0.1,
                            }
                        )
                            .bindTooltip(langKeyToStr[ele.maxLang[0].replace(/"/g, "")])
                            .addTo(this.map);
                    });
                }
                worker.terminate();
            } else {
                // console.log("ERROR: terminating worker");
                worker.terminate();
            }
        };
    };

    // Function that handles map view changes
    mapViewChangeHandler = (e) => {
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

        const bounds = this.map.getBounds();
        // Checking what change occurred
        if (
            this.prevPrecision === precision &&
            this.prevZoom === e.target._zoom &&
            Object.keys(this.map._layers).length <= 15000 // Limit to 15,000 boxes before clearing
        ) {
            // View shifted: screen dragged
            const SW1 = {
                lat: this.loadedCoords._southWest.lat,
                lng: this.loadedCoords._southWest.lng,
            };
            const NE1 = {
                lat: this.loadedCoords._northEast.lat,
                lng: this.loadedCoords._northEast.lng,
            };

            const SW2 = {
                lat: bounds._southWest.lat,
                lng: bounds._southWest.lng,
            };
            const NE2 = {
                lat: bounds._northEast.lat,
                lng: bounds._northEast.lng,
            };

            // Finding slices that we have not loaded yet
            if (NE2.lat > NE1.lat) {
                // There is top slice to load
                const sliceSW = {
                    lat: NE1.lat,
                    lng: SW2.lng,
                };
                const sliceNE = {
                    lat: NE2.lat,
                    lng: NE2.lng,
                };

                this.socket.emit("get-languages", sliceSW, sliceNE, precision, false);
            }

            if (SW2.lat < SW1.lat) {
                // There is a bottom slice to load
                const sliceSW = {
                    lat: SW2.lat,
                    lng: SW2.lng,
                };
                const sliceNE = {
                    lat: SW1.lat,
                    lng: NE2.lng,
                };
                this.socket.emit("get-languages", sliceSW, sliceNE, precision, false);
            }

            if (NE2.lng > NE1.lng) {
                // There is a right slice to load
                const sliceSW = {
                    lat: Math.max(SW1.lat, SW2.lat),
                    lng: NE1.lng,
                };
                const sliceNE = {
                    lat: Math.min(NE1.lat, NE2.lat),
                    lng: NE2.lng,
                };
                this.socket.emit("get-languages", sliceSW, sliceNE, precision, false);
            }

            if (SW2.lng < SW1.lng) {
                // There is a left slice to load
                const sliceSW = {
                    lat: Math.max(SW2.lat, SW1.lat),
                    lng: SW2.lng,
                };
                const sliceNE = {
                    lat: Math.min(NE1.lat, NE2.lat),
                    lng: SW1.lng,
                };
                this.socket.emit("get-languages", sliceSW, sliceNE, precision, false);
            }

            this.loadedCoords = bounds;
        } else {
            // Precision changed. Need to clear map and load in new bbox data
            // NOTE: The map is cleared once the socket event 'addPolygons' is called
            const SW = {
                lat: bounds._southWest.lat,
                lng: bounds._southWest.lng,
            };
            const NE = {
                lat: bounds._northEast.lat,
                lng: bounds._northEast.lng,
            };
            this.prevPrecision = precision;
            this.loadedCoords = bounds;
            this.socket.emit("get-languages", SW, NE, precision, true);
        }

        this.socket.emit("get-country-stats");
        this.prevZoom = e.target._zoom;
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

        return equalNELat === equalSWLat && equalSWLat === equalNELong && equalNELong === equalSWLong;
    };

    radioHandler = (e) => {
        this.setState({radioValue: e.target.value});
        if (e.target.value === "label") {
            this.map.removeLayer(this.layers.noLabels);
            this.map.addLayer(this.layers.labels);
        } else {
            this.map.removeLayer(this.layers.labels);
            this.map.addLayer(this.layers.noLabels);
        }
    };

    toggleSidebar = (e) => {
        this.setState({radioValue: e.target.value});
        if (drawerWidth === 256) {
            document.getElementById("buttonClose").style.display = "none";
            document.getElementById("buttonOpen").style.display = "block";
            drawerWidth = 0;
        } else {
            drawerWidth = 256;
            document.getElementById("buttonClose").style.display = "block";
            document.getElementById("buttonOpen").style.display = "none";
        }
        //console.log(drawerWidth);
    };

    filterClick = (language, selectAll = false, deselectAll = false) => {
        const index = this.state.filteredLangs.indexOf(`"${language}"`);
        if (selectAll) {
            if (this.state.filteredLangs === 0) {
                // All languages are already selected
                return;
            }
            this.setState({filteredLangs: []});
        } else if (deselectAll) {
            const langs = Object.keys(colors).map((ele) => {
                return `"${ele}"`;
            });
            if (langs.length === this.state.filteredLangs) {
                // All languages are already deselected
                return;
            }
            this.setState({filteredLangs: langs});
        } else {
            if (index === -1) {
                // Not in list of filtered languages
                this.setState({filteredLangs: [`"${language}"`, ...this.state.filteredLangs]});
            } else {
                // In list of filtered languages
                this.setState({
                    filteredLangs: this.state.filteredLangs.slice(0, index).concat(this.state.filteredLangs.slice(index + 1, this.state.filteredLangs.length)),
                });
            }
        }

        // Update the map
        const bounds = this.map.getBounds();
        const SW = {
            lat: bounds._southWest.lat,
            lng: bounds._southWest.lng,
        };
        const NE = {
            lat: bounds._northEast.lat,
            lng: bounds._northEast.lng,
        };
        this.loadedCoords = bounds;
        this.socket.emit("get-languages", SW, NE, this.prevPrecision, true);
    };

    render() {
        return (
            <React.Fragment>
                {/* <div className={classes.page}>
                    <div className={classes.buttonContainer}>
                        <RadioButton value="label" text="With Labels" checked={this.state.radioValue === "label"} onChange={this.radioHandler} />
                        <RadioButton value="no-label" text="No Labels" checked={this.state.radioValue !== "label"} onChange={this.radioHandler} />
                    </div>
                </div> */}
                <i id="buttonOpen" className={["fas fa-chevron-right fa-3x", classes.buttonOpen].join(" ")} type="button" onClick={this.toggleSidebar} />
                <i
                    id="buttonClose"
                    className={["fas fa-chevron-circle-left fa-2x", classes.buttonClose].join(" ")}
                    type="button"
                    onClick={this.toggleSidebar}
                />
                <div id="map" className={classes.map} />
                <Hidden xsDown implementation="css">
                    <Navigator PaperProps={{style: {width: drawerWidth}}} data={this.state.data} countryData={this.state.countryData} />
                </Hidden>
                <Legend
                    langColors={colors}
                    data={this.state.data}
                    langKeyToStr={langKeyToStr}
                    filteredLangs={this.state.filteredLangs}
                    filterClick={this.filterClick}
                />
            </React.Fragment>
        );
    }
}

export default Map;
