import React, { useRef, useState, useEffect} from "react";
import { Button } from "@material-ui/core";
import * as d3 from "d3";
import "../App.css";

const InputPlot = (props) => {

    /*
    최초실행시 출력하는 화면
    */
    useEffect(() => {
        var inputSentencetTextBox = d3.select("#inputSentencetTextBox");
        inputSentencetTextBox.append('input')
                            .attr('id', 'inputSentence')
                            .attr('type', 'text')
                            .attr('name', 'inputSentence')
                            .attr('placeholder', 'User input sentence goes here.')
                            .style('width', '80%')
                            .style('height', '80px');
        
        var inputPromptTextBox = d3.select("#inputPromptTextBox");
        inputPromptTextBox.append('input')
                        .attr('id', 'inputPrompt')
                        .attr('type', 'text')
                        .attr('name', 'inputPrompt')
                        .attr('placeholder', 'Manual user prompt goes here.')
                        .style('width', '80%')
                        .style('height', '80px');

        var inputButton = d3.select("#input_button")
        inputButton.append('button')
                    .attr('title', 'Apply')
                    .style('width', '80%')
                    .style('height', '30px');

    }, []);

    function submitInputs(){
        var inputSentence = document.getElementById("inputSentence").value;
        var inputPrompt = document.getElementById("inputPrompt").value;

        alert('Send [' + inputSentence + '] and [' + inputPrompt + '] to server.')
        // TODO : add logics -> sent inputSentence, inputPrompt to server
    }

    return (
        <div style={{padding:"5%"}}>
            <div style={{alignItems:"center", justifyContent:"center"}}>
                <div id="container" style={{padding:"3%"}}>
                    <b>INPUT SENTENCE</b>
                </div>
                <div id="inputSentencetTextBox" style={{paddingBottom:"2%"}}/>

                <div id="container" style={{padding:"3%"}}>
                    <b>PROMPT</b>
                </div>
                <div id="inputPromptTextBox" style={{paddingBottom:"5%"}}/>

                <button onClick={submitInputs} style={{width:"80%", height:"30px"}}>
                    Apply
                </button>
            </div>
        </div>
	)
};

export default InputPlot;