import React from "react";
import Mainplot from "./components/MainPlot";

import dummy from "./data/dummy.json";

import "./App.css";

function App() {

  const dataset = ["SST-2", "RTE"];
  const model = ["bert-base-uncased", "albert-xxlarge-v2"];
  const embedding  = ['mask', 'cls', 'mean', 'max'];
  const host='localhost'

  return (
    <div className="App">
      <div class="splotContainer">
        <Mainplot
          // TODO : fix
          data={dummy}
          dataset={dataset}
          model={model}
          embedding={embedding}
          host={host}
        />
      </div>
    </div>
  );
}

export default App;
