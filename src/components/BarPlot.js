import React, { useRef, useEffect} from "react";
import * as d3 from "d3";
import "../App.css";

const BarPlot = (props) => {

    const barPlot = useRef(null);
    
    var margin = {top: 50, right: 30, bottom: 70, left: 60}
        var width = 580;
        var height = 210;
    
    /*
    최초실행시 출력하는 화면
    */
    useEffect(() => {
        var data = null;

        if(props.data != null) {
            data = props.data.topk;
            data.forEach(d => {
                d.score = parseFloat(d.score);
            });
        } else {
            // dummy data
            data = [{
                "token" : "",
                "score" : 0.0
            }]
        }

        var svg = d3.select(barPlot.current)
                    //.append("g")
                    //.attr("transform", `translate(${margin.left}, ${margin.top})`);

        // X axis
        var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(data.map(function(d) { return d.token; }))
            .padding(0.2);
        const xScale = d3.axisBottom(x);

        // Add Y axis
        var y = d3.scaleLinear()
                .domain([
                    0,
                    d3.max(data, d => d.score) 
                ])
                .range([ height, 0]);
        const yScale = d3.axisLeft(y);
        
        if(props.data == null) {
            svg.select('.xaxis').remove();
            svg.select('.yaxis').remove();
            svg.selectAll('rect').remove();

            svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top + height})`)
                .attr('class', 'xaxis')
                .call(xScale)
                .selectAll("text")
                    .attr("transform", "translate(-10,0)rotate(-45)")
                    .style("text-anchor", "end");

            svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`)
                .attr('class', 'yaxis')
                .call(yScale);

            

        } else {
            svg.select('.xaxis')
                .transition().duration(1000)
                .call(xScale)
                .selectAll("text")
                    .attr("transform", "translate(-10,0)rotate(-45)")
                    .style("text-anchor", "end");

            svg.select('.yaxis')
                .transition().duration(1000)
                .call(yScale);
            
            // UPDATE Bars
            var bars = svg.selectAll("rect").data(data)
                            
            bars.enter()
                .append("rect")
                .merge(bars)
                .attr("transform", `translate(${margin.left}, ${margin.top})`)
                .transition().duration(1000)
                .attr("x", function(d) { return x(d.token); })
                .attr("y", function(d) { return y(d.score); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(d.score); })
                .attr("fill", "#69b3a2");
        }
    }, [props.data]);

    return (
        <div>
            <div id="container" style={{ padding: "2%" }}>
                        <b>Top-10 Prediction</b>
                </div>
            <div id="svg_container" style={{alignItems:"center", justifyContent:"center", height:"310px"}}>
                
                <svg id="barPlot" ref={barPlot} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}/>
            </div>
        </div>
	)
};

export default BarPlot;