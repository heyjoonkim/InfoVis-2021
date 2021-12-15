import React, { useRef, useEffect} from "react";
import axios from 'axios';
import Select from 'react-select';
import * as d3 from "d3";
import "../App.css";

const InputPlot = (props) => {

    const isFirst = useRef(true)

    const dataset = generateInput(props.dataset);
    const model = generateInput(props.model);
    const embedding = generateInput(props.embedding);

    var selectedDataset = useRef(dataset[0].value);
    var selectedModel = useRef(model[0].value);
    var selectedMask = useRef(embedding[0].value);

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
                        .attr('value', 'This is a [MASK] movie.')
                        .style('width', '80%')
                        .style('height', '40px');
                        //.attr('placeholder', 'Manual user prompt goes here.')

        var inputButton = d3.select("#input_button")
        inputButton.append('button')
                    .attr('title', 'Apply')
                    .style('width', '80%')
                    .style('height', '30px');

        if(isFirst.current) {
            applyFilter();
        }
        isFirst.current = false;

    }, []);

    function applyFilter(){
        var url = props.host + '/submit';
        var inputPrompt = document.getElementById("inputPrompt").value;

        
        props.setPrompt(inputPrompt);

        var formData = new FormData();
        formData.append('dataset', selectedDataset.current);
        formData.append("model" , selectedModel.current);
        formData.append("embedding" , selectedMask.current);
        formData.append("inputPrompt" , inputPrompt);

        axios.post(url, formData)
            .then(function (response) {
                //check for embeddings data                        
                if("data" in response) {
                    var data = response['data'];
                    if("embeddings" in data) {
                        props.setData(data["embeddings"]);
                    }
                    props.setSelectedData(null);
                    props.setSelectedTableId(null);
                } else {
                    alert("No [embeddings] in response!");
                }
            })
            .catch(function(error) {
                console.log('ERROR : ', JSON.stringify(error))
            });
    }

    function submitInputs(){
        var url = props.host + '/input_sentence';
        var inputSentence = document.getElementById("inputSentence").value;
        var inputPrompt = document.getElementById("inputPrompt").value;

        if(inputSentence.length === 0) {
            alert('Error! Enter a sentence!');
            return;
        }

        var formData = new FormData();
        formData.append("embedding" , selectedMask.current);
        formData.append("inputPrompt" , inputPrompt);
        formData.append("inputSentence" , inputSentence);

        axios.post(url, formData)
            .then(function (response) {
                //check for embeddings data                     
                if("data" in response) {
                    var data = response['data'];
                    if("embeddings" in data) {
                        var embeddings = props.data.slice();
                        embeddings.unshift(data["embeddings"]);
                        props.setData(embeddings);
                    }
                    props.setSelectedData(null);
                    props.setSelectedTableId(null);
                } else {
                    alert("No [embeddings] in response!");
                }
            })
            .catch(function(error) {
                console.log('ERROR : ', JSON.stringify(error))
            });
    }

    return (
        <div style={{padding:"5%"}}>
            <div style={{alignItems:"center", justifyContent:"center"}}>
                <div id="container">
                    <div id="control_text">
                        Dataset
                    </div>
                    <div style={{width:"50%"}}>
                        <Select
                            options={dataset}
                            defaultValue={dataset[0]}
                            onChange={(options) => {
                                selectedDataset.current = options.value;
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
                                selectedModel.current = options.value;
                            }}
                        />
                    </div>
                </div>

                <div id="container" >
                    <div id="control_text">
                        Embedding
                    </div>
                    <div style={{width:"50%"}}>
                        <Select
                            options={embedding}
                            defaultValue={embedding[0]}
                            onChange={(options) => {
                                selectedMask.current = options.value;
                            }}
                        />
                    </div>
                </div>
                <div id="container">
                    <div id="control_text" style={{marginTop:"1%"}}>
                        Prompt
                    </div>
                </div>
                <div id="inputPromptTextBox"/>                
                
                <button onClick={applyFilter} style={{width:"80%", height:"30px", marginTop:"3%"}}>
                    Apply Filter
                </button>

                <hr />                

                <div id="container">
                    <div id="control_text" style={{width:"50%"}}>
                        Input Sentence
                    </div>
                </div>
                <div id="inputSentencetTextBox"/>

                <button onClick={submitInputs} style={{width:"80%", height:"30px", marginTop:"3%"}}>
                    Submit New Sentence
                </button>
            </div>
        </div>
	)
};

export default InputPlot;