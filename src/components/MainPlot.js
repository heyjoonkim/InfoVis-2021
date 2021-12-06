import React, { useRef, useState, useEffect} from "react";
import * as d3 from "d3";
import "../App.css";

import TablePlot from "./TablePlot";
import InputPlot from "./InputPlot";
import AttentionPlot from "./AttentionPlot";
import BarPlot from "./BarPlot";

const Mainplot = (props) => {
    const isFirst = useRef(true)

	const splotSvg = useRef(null);
    const size = 300;
    const circleSize = 5;
    const margin = 20;
    const colorList = ['red', 'blue', 'green', 'yellow']

    // for scatter plot & table
    const [embeddingsData, setEmbeddingsData] = useState(props.data['embeddings']);
    const [topk, setTopk] = useState();
    const [attentions, setAttentions] = useState();
    const [selectedData, setSelectedData] = useState(null);

    /*
    최초실행시 출력하는 화면
    */
    useEffect(() => {
        const splot = d3.select(splotSvg.current);
        // set of labels
        var labelSet = new Set();
        var attentions = props.data['attentions']
        // make data
        embeddingsData.forEach(d => {
            d.x = parseFloat(d["tsne"]["x"]);
            d.y = parseFloat(d["tsne"]["y"]);
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
                        .range([size, 0]);
        if(isFirst.current) {
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
                    return colorList[labelList.indexOf(d.label)];
                })
                .attr('r', circleSize)
                .attr("id", (d, i) => "id_" + i)
                .attr('fill-opacity', 1)
                .on("click", (d,i) => {
                    var circles = splot.selectAll('circle');
                    console.log(d);
                    //circles.forEach()
                });
            } else {
                const circle = splot.selectAll('circle');
                circle.transition()
                        .duration(500)
                        .attr('fill-opacity', (d,i) => {
                            if(selectedData === d) {
                                return 1;
                            } else {
                                return 0.3;
                            }
                        });
            }
        
        if(isFirst.current)  
            isFirst.current = false;

    }, [embeddingsData, topk, attentions, selectedData]);


    return (
        <div>
            <div id="container" style={{margin:"1%"}}>
                <b>Visualization for Interpretability of Pretrained Language model</b>
            </div>
            
            <div id="container">
                <div id="scatter_plot">
                    <svg ref={splotSvg} width={size+margin} height={size+margin}>
                    </svg>
                </div>
                <div id="table_plot">
                    <TablePlot
                        data={embeddingsData}
                        selectedData={selectedData}
                        setSelectedData={setSelectedData}
                    />
                </div>
                <div id="input_plot">
                    <InputPlot
                        dataset={props.dataset}
                        model={props.model}
                        embedding={props.embedding}
                        host={props.host}
                        setData={setEmbeddingsData}
                        setTopk={setTopk}
                        setAttentions={setAttentions}
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