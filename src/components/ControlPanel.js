import React from "react";
import Select from 'react-select'
import axios from 'axios'


const ControlPanel = (props) => {
    const dataset = generateInput(props.dataset);
    const model = generateInput(props.model);
    const embedding = generateInput(props.embedding);

    var selectedDataset = dataset[0].value;
    var selectedModel = model[0].value;
    var selectedMask = embedding[0].value;

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

    function submitOptions(){
        var url = props.host + '/options';
        alert('Send [' + selectedDataset + '], [' + selectedModel + '], [' + selectedMask + '] to ' + url);
        // TODO : add logics -> sent inputSentence, inputPrompt to server
        const response = axios.post(url, {
                                        dataset : selectedDataset,
                                        model : selectedModel,
                                        embedding : selectedMask
                                    });
        // check for embeddings data                            
        if("embeddings" in response) {
            props.setData(response["embeddings"]);
        } else {
            alert("No [embeddings] in response!");
        }
        //check for topk data
        if("topk" in response) {
            props.setTopk(response["topk"]);
        } else {
            alert("No [topk] in response!");
        }  
        // check for attentions data
        if("attentions" in response) {
            props.setAttentions(response["attentions"]);
        } else {
            alert("No [attentions] in response!");
        }
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
                        selectedDataset = options.value;
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
                        selectedModel = options.value;
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
                        selectedMask = options.value;
                    }}
                />
            </div>
            <button onClick={submitOptions} id="control_text" style={{width:"10%", height:"30px"}}>
                    Change Settings
            </button>
        </div>
		
	)
};

export default ControlPanel;