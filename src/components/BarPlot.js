import React, { useRef, useState, useEffect} from "react";
import * as d3 from "d3";
import "../App.css";

const BarPlot = (props) => {
    
    /*
    최초실행시 출력하는 화면
    */
    useEffect(() => {
        var svg_div = d3.select("#svg_contrainer");
        var svg_width = svg_div.style('width').slice(0, -2);
        var svg_height = svg_div.style('height').slice(0, -2);
        console.log(svg_div.style('width'), svg_div.style('height'))
        console.log(svg_width, svg_height)
        

        var margin = {top: 30, right: 30, bottom: 70, left: 60},
            width = svg_width - margin.left - margin.right,
            height = svg_height - margin.top - margin.bottom;

        props.data.forEach(d => {
			d.score = parseFloat(d.score);
		});

        var svg = d3.select("#barPlot")
                    .attr("width", svg_width + margin.left + margin.right)
                    .attr("height", svg_height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // X axis
        var x = d3.scaleBand()
                .range([ 0, width ])
                .domain(props.data.map(function(d) { return d.token; }))
                .padding(0.2);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
                .domain([
                    0,
                    d3.max(props.data, d => d.score) 
                ])
                .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("mybar")
            .data(props.data)
            .enter()
            .append("rect")
                .attr("x", function(d) { return x(d.token); })
                .attr("y", function(d) { return y(d.score); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(d.score); })
                .attr("fill", "#69b3a2");
    }, []);

    return (
        <div id="svg_contrainer" style={{alignItems:"center", justifyContent:"center", height:"310px"}}>
            <svg id="barPlot"/>
        </div>
	)
};

export default BarPlot;