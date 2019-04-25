import React, { Component } from "react";
import "./styles.css";
import Map from "./components/containers/map.jsx";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Map />
      </div>
    );
  }
}

export default App;
