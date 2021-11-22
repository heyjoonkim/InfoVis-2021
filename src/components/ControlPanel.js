import React from "react";
import Select from 'react-select'


const ControlPanel = (props) => {
    const dataset = generateInput(props.dataset);
    const model = generateInput(props.model);
    const embedding = generateInput(props.embedding);

    function generateInput(values) {
        var length = values.length;
        var index;
        var results = [];
        for(index=0; index < length; index++){ 
            results.push({
                value : values[index],
                label : values[index]
            });
        }
        
        return results
    }

    return (
        <div id="container">
            <div id="control_text">
                Sample Dataset :
            </div>
            <div style={{width: "15%"}}>
                <Select
                    options={dataset}
                    defaultValue={dataset[0]}
                    onChange={(options) => {
                        props.setDataset(options.value);
                    }}
                />
            </div>
            <div id="control_text">
                Model :
            </div>
            <div style={{width: "15%"}}>
                <Select
                    options={model}
                    defaultValue={model[0]}
                    onChange={(options) => {
                        props.setModel(options.value);
                    }}
                />
            </div>
            <div id="control_text">
                Embedding method :
            </div>
            <div style={{width: "15%"}}>
                <Select
                    options={embedding}
                    defaultValue={embedding[0]}
                    onChange={(options) => {
                        props.setEmbedding(options.value);
                    }}
                />
            </div>
        </div>
		
	)
};

export default ControlPanel;