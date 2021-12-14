import React, { useRef, useState, useEffect} from "react";
import * as d3 from "d3";
import "../App.css";

import TablePlot from "./TablePlot";
import InputPlot from "./InputPlot";
import AttentionPlot from "./AttentionPlot";
import BarPlot from "./BarPlot";

const Mainplot = (props) => {

	const splotSvg = useRef(null);
	const svgLegend = useRef(null);
    const size = 300;
    const circleSize = 5;
    const margin = 40;
    const colorList = d3.schemeTableau10;
    
    // for scatter plot & table
    const [embeddingsData, setEmbeddingsData] = useState(props.data['embeddings']);
    const [topk, setTopk] = useState();
    const [attentions, setAttentions] = useState();
    const [selectedData, setSelectedData] = useState(null);
    const [prompt, setPrompt] = useState(null);
	const [selectedTableId, setSelectedTableId] = useState(null);

    /*
    최초실행시 출력하는 화면
    */
    useEffect(() => {
        const splot = d3.select(splotSvg.current);
        const legend = d3.select(svgLegend.current);
        // set of labels
        var labelSet = new Set();
        // make data
        embeddingsData.forEach(d => {
            d.x = parseFloat(d["x"]);
            d.y = parseFloat(d["y"]);
            d.label = parseInt(d["label"]);

            labelSet.add(d.label);
        });

        // list of labels
        var labelList = Array.from(labelSet);

        // scatter plot x-scale
        let xScale = d3.scaleLinear()
                        .domain([
                            d3.min(embeddingsData, d => d.x),
                            d3.max(embeddingsData, d => d.x)
                        ])
                        .range([0, size]);
        // scatter plot y-scale
        let yScale = d3.scaleLinear()
                        .domain([
                            d3.min(embeddingsData, d => d.y),
                            d3.max(embeddingsData, d => d.y)
                        ])
                        .range([size + 20, 0]);
        
        splot.selectAll('circle').remove();

        // initial circles
        splot.append('g')
            .attr('transform', `translate(${margin}, ${margin})`)
            .selectAll('circle')
            .data(embeddingsData)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .style("fill", (d, i) => {
                
                if(selectedData === null) {
                    return colorList[labelList.indexOf(d.label)];
                }

                if(selectedData.id === i) {
                    return "red";
                } else {
                    return colorList[labelList.indexOf(d.label)];
                }
            })
            .attr('r', circleSize)
            .attr("id", (d, i) => "id_" + i)
            .attr('fill-opacity', 1)
            .transition()
            .duration(500)
            .attr('fill-opacity', (d,i) => {
                if(selectedData === null) {
                    return 1;
                }
                if(selectedData.id === i) {
                    return 1;
                } else {
                    return 0.1;
                }
            });

        
        
        var labelLength = labelList.length;
        // remove previous legends
        legend.selectAll("circle").remove();
        legend.selectAll("text").remove();
        legend.selectAll("rect").remove();
        legend.append('rect')
                .attr("x", 350)
                .attr("y", 55)
                .attr("width", 100)
                .attr("height", 20 + 30 * labelLength)
                .style("fill", "#EAEAEA");

        for(var labelIndex = 0; labelIndex < labelLength; labelIndex++) {
            var label = labelList[labelIndex];
            var labelColor = colorList[labelIndex]
            legend.append("circle").attr("cx",size+margin*2).attr("cy",margin*2+labelIndex*30).attr("r", 6).style("fill", labelColor)
            legend.append("text").attr("x", size+15+margin*2).attr("y", margin*2+labelIndex*30).text(label).style("font-size", "15px").attr("alignment-baseline","middle")
        }

        //var tmp = splot.select("#legend");
        //tmp.style("stroke", "black")
                //.style("")
        
        // selected data
        if(selectedData != null) {
            var circles = splot.select("#id_"+selectedData.id);
            circles.raise();
        }
        //circles
    }, [embeddingsData, topk, attentions, selectedData]);

    return (
        <div>
            <div style={{paddingTop:"1%", paddingBottom:"1%", marginTop:"1%", marginBottom:"1%", textAlign:"center", fontSize:"2rem", border: "1px solid black"}}>
                <b>Visualization for Interpretability of Pretrained Language model</b>
            </div>
            
            <div id="container">
                <div id="scatter_plot">
                    <svg ref={splotSvg} width={size+margin+100} height={size+margin + 100}>
                        <svg id="legend" ref={svgLegend}/>
                    </svg>
                </div>
                <div id="table_plot">
                    <TablePlot
                        data={embeddingsData}
                        selectedData={selectedData}
                        host={props.host}
                        prompt={prompt}
                        setSelectedData={setSelectedData}
                        selectedTableId={selectedTableId}
                        setSelectedTableId={setSelectedTableId}
                    />
                </div>
                <div id="input_plot">
                    <InputPlot
                        dataset={props.dataset}
                        model={props.model}
                        embedding={props.embedding}
                        host={props.host}
                        data={embeddingsData}
                        setData={setEmbeddingsData}
                        setTopk={setTopk}
                        setAttentions={setAttentions}
                        setPrompt={setPrompt}
                        setSelectedData={setSelectedData}
                        setSelectedTableId={setSelectedTableId}
                    />
                </div>
            </div>
            <div id="container">
                <div id="bottom_plot">
                    <BarPlot
                        data={selectedData}
                    />
                </div>
                 <div id="bottom_plot">
                    <AttentionPlot
                        attentions={selectedData}
                    />
                </div>
            </div>
        </div>
	)
};

export default Mainplot;