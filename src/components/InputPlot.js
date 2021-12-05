import React, { useRef, useState, useEffect} from "react";
import axios from 'axios';
import Select from 'react-select';
import * as d3 from "d3";
import "../App.css";

const InputPlot = (props) => {
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
    
    useEffect(() => {
        var inputSentencetTextBox = d3.select("#inputSentencetTextBox");
        inputSentencetTextBox.append('input')
                            .attr('id', 'inputSentence')
                            .attr('type', 'text')
                            .attr('name', 'inputSentence')
                            .attr('placeholder', 'User input sentence goes here.')
                            .style('width', '80%')
                            .style('height', '40px');
        
        var inputPromptTextBox = d3.select("#inputPromptTextBox");
        inputPromptTextBox.append('input')
                        .attr('id', 'inputPrompt')
                        .attr('type', 'text')
                        .attr('name', 'inputPrompt')
                        .attr('placeholder', 'Manual user prompt goes here.')
                        .style('width', '80%')
                        .style('height', '40px');

        var inputButton = d3.select("#input_button")
        inputButton.append('button')
                    .attr('title', 'Apply')
                    .style('width', '80%')
                    .style('height', '30px');

    }, []);

    function submitInputs(){
        var url = props.host + '/submit';
        var inputSentence = document.getElementById("inputSentence").value;
        var inputPrompt = document.getElementById("inputPrompt").value;

        var requestDict = {
                            dataset : selectedDataset,
                            model : selectedModel,
                            embedding : selectedMask,
                            inputSentence : inputSentence,
                            inputPrompt : inputPrompt
                        };

        alert('Send [' + JSON.stringify(requestDict) + '] to ' + url);
        // TODO : add logics -> sent inputSentence, inputPrompt to server
        const response = axios.post(url, requestDict);
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
        <div style={{padding:"5%"}}>
            <div style={{alignItems:"center", justifyContent:"center"}}>
                <div id="container">
                    <div id="control_text">
                        Sample Dataset
                    </div>
                    <div style={{width:"50%"}}>
                        <Select
                            options={dataset}
                            defaultValue={dataset[0]}
                            onChange={(options) => {
                                selectedDataset = options.value;
                            }}
                        />
                    </div>
                </div>

                <div id="container" >
                    <div id="control_text">
                        Model
                    </div>
                    <div style={{width:"50%"}}>
                        <Select
                            options={model}
                            defaultValue={model[0]}
                            onChange={(options) => {
                                selectedModel = options.value;
                            }}
                        />
                    </div>
                </div>

                <div id="container" >
                    <div id="control_text">
                        Embedding method
                    </div>
                    <div style={{width:"50%"}}>
                        <Select
                            options={embedding}
                            defaultValue={embedding[0]}
                            onChange={(options) => {
                                selectedMask = options.value;
                            }}
                        />
                    </div>
                </div>

                <hr />
                                    
                <div id="container">
                    <div id="control_text">
                        Input Sentence
                    </div>
                </div>
                <div id="inputSentencetTextBox"/>
                <div id="container">
                    <div id="control_text">
                        Prompt :
                    </div>
                </div>
                <div id="inputPromptTextBox"/>

                <button onClick={submitInputs} style={{width:"80%", height:"30px", marginTop:"3%"}}>
                    Apply
                </button>
            </div>
        </div>
	)
};

export default InputPlot;