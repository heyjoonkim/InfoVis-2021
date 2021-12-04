import React, { useRef, useState, useEffect} from "react";
import * as d3 from "d3";
import "../App.css";

import ControlPanel from "./ControlPanel";
import TablePlot from "./TablePlot";
import InputPlot from "./InputPlot";
import AttentionPlot from "./AttentionPlot";
import BarPlot from "./BarPlot";

const Mainplot = (props) => {

	const splotSvg = useRef(null);
    const size = 300;
    const circleSize = 5;
    const margin = 20;
    const colorList = ['red', 'blue', 'green', 'yellow']

    const [dataset, setDataset] = useState(props.dataset[0]);
    const [model, setModel] = useState(props.model[0]);
    const [embedding, setEmbedding] = useState(props.embedding[0]);

    // for scatter plot & table
    const [embeddingsData, setEmbeddingsData] = useState(props.data['embeddings']);
    const [topk, setTopk] = useState(props.data['topk']);
    const [attentions, setAttentions] = useState(props.data['attentions']);

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
            .attr("id", (d, i) => "id"+i)
            .on("click", (d,i) => {
                var circles = splot.selectAll('circle');
                circles.forEach()
            });

    }, [embeddingsData]);


    return (
        <div>
            <div class="splotContainer" id="control_panel">
                <ControlPanel
                    dataset={props.dataset}
                    model={props.model}
                    embedding={props.embedding}
                    host={props.host}
                    setData={setEmbeddingsData}
                    setTopk={setTopk}
                    setAttentions={setAttentions}
                />
            </div>
            <div id="container">
                <div id="scatter_plot">
                    <svg ref={splotSvg} width={size+margin} height={size+margin}>
                    </svg>
                </div>
                <div id="table_plot">
                    <TablePlot
                        data={embeddingsData}
                        setData={setEmbeddingsData}
                    />
                </div>
                <div id="input_plot">
                    <InputPlot/>
                </div>
            </div>
            <div id="container">
                <div id="bottom_plot">
                    <BarPlot
                        data={topk}
                    />
                </div>
                <div id="bottom_plot">
                    <AttentionPlot
                        attentions={attentions}
                    />
                </div>
            </div>
        </div>
	)
};

export default Mainplot;