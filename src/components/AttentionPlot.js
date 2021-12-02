import React, { useRef, useState, useEffect} from "react";
import Select from "react-select"
import * as d3 from "d3";
import "../App.css";

const AttentionPlot = (props) => {
    
    const splotSvg = useRef(null);
    const barplotSvg = useRef(null);
    const svgSize = 100 * 2 + 100;

    const interval = 1000;

    var wordLength;
    if(props['attentions']['input_tokens'].length > props['attentions']['prompt_tokens'].length)
        wordLength = props['attentions']['input_tokens'].length;
    else 
        wordLength = props['attentions']['prompt_tokens'].length;

    const fixed_height = 10;

    const [tokens,setTokens]=useState({
        'input_tokens' : props['attentions']['input_tokens'], 
        'prompt_tokens' : props['attentions']['prompt_tokens']});

    // first layer attention as default
    const [data,setData]=useState(props['attentions']['0']);

    function generateColumns(num_layer) {
        var index;
        var results = [];
        for(index=0; index < num_layer; index++){ 
            results.push({
                value : "layer" + index,
                label : "layer" + index
            });
        }
        return results;
    }

    const tableview_columns = generateColumns(props['attentions']['num_layer']);
    
    function onChange_column(value) {
        var length = value.value.length;
        console.log('length', length)
        var layer_index = value.value[length-1];
        console.log('layer_index', layer_index);


        if(layer_index in props['attentions'])
            setData(props['attentions'][layer_index]);
        else
            alert('No data for layer ' + layer_index);
    }

    /*
    최초실행시 출력하는 화면
    */
    useEffect(() => {
        d3.select(splotSvg.current).selectAll("*").remove()

        let xScale_top = d3.scaleLinear()
                        .domain([0, wordLength * interval])
                        .range([0, 200])

        let xScale_bot = d3.scaleLinear()
                        .domain([0, wordLength * interval])
                        .range([0, 200])

        let yScale = d3.scaleLinear()
                        .domain([0, fixed_height])
                        .range([200, 0])
        
        const xAxis_top = d3.axisBottom(xScale_top).tickFormat(function(d){
            var index = d / interval;
            return tokens['input_tokens'][index];
        });

        const xAxis_bot = d3.axisBottom(xScale_bot).tickFormat(function(d){
            var index = d / interval;
            return tokens['prompt_tokens'][index];
        });


        const yAxis = d3.axisLeft(yScale)          

        const svg = d3.select(splotSvg.current)
        const lines_svg = d3.select(splotSvg.current).append('g').attr('transform', `translate( ${100}, ${0})`)
        
        svg.append('g')
            .attr('transform', `translate(${100}, ${0})`)
            .call(xAxis_top)  
        svg.append('g')
            .attr('transform', `translate( ${100}, ${200})`)
            .call(xAxis_bot)

        lines_svg.selectAll('line')
            .attr('transform', `translate( ${0}, ${0})`)
            .data(data)
            .enter()
            .append('line')
            .attr("stroke", "red")
            .attr('stroke-width', d => d.attn_value)
            .attr("x1", d => xScale_top((d.input_pos*interval )))
            .attr("x2", d => xScale_bot((d.prompt_pos*interval )))
            .attr("y1", yScale(fixed_height))
            .attr("y2", yScale(0));

            console.log('@@ DONE @@');

    }, [data]);

    

    return (
        <div>
            <div>
                <div id="container" style={{padding:"2%"}}>
                    <b>Attention Map</b>
                </div>
                <div style={{padding:"2%", paddingTop:"0%", width:"30%"}}>
                    <Select
                        options={tableview_columns}
                        onChange={onChange_column}
                    />
                </div>
                <svg ref={splotSvg} width={svgSize} height={svgSize} /> 
                <svg ref={barplotSvg} width={svgSize} height={svgSize} /> 
            </div>


            
        </div>
	)
};

export default AttentionPlot;