import React from "react";
import Mainplot from "./components/MainPlot";

import dummy from "./data/dummy.json";

import "./App.css";

function App() {

  const dataset = ["sst2", "ag_news"];
  const model = ["bert-base-cased", "oberta-base"];
  const embedding  = ['mask', 'cls', 'mean', 'max'];
  // TODO : fix domain
  const host='http://kari.snu.ac.kr:9999'

  return (
    <div className="App">
      <div class="splotContainer">
        <Mainplot
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
