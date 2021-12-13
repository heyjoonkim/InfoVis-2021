import React, { useRef, useState, useEffect } from "react";
import Select from "react-select"
import * as d3 from "d3";
import "../App.css";

const AttentionPlot = (props) => {

    const splotSvg = useRef(null);
    const barplotSvg = useRef(null);
    const svgSize = 300 * 2 + 100;

    const interval = 1000;

    const fixed_height = 10;

    const [data, setData] = useState()
    function generateColumns(num_layer) {
        var index;
        var results = [];
        for (index = 0; index < num_layer; index++) {
            results.push({
                value: "layer" + index,
                label: "layer" + index
            });
        }
        return results;
    }

    var tableview_columns
    function tableview_columns_generate() {
        if (props['attentions'] == null) {
            tableview_columns = ['Default']
        } else if (props['attentions'] != null) {
            tableview_columns = generateColumns(props.attentions['attentions']['num_layer'])
        }
    }
    tableview_columns_generate()
    //

    const [layerIdx, setLayerIdx] = useState([0])

    function onChange_column(value) {
        var length = value.value.length;
        var layer_index = value.value[length - 1];
        setLayerIdx(layer_index)

        if (props.attentions['attentions'] != null) {
            if (layer_index in props.attentions['attentions'])
                setData(props.attentions['attentions'][layer_index]);
            else
                alert('No data for layer ' + layer_index);
        }
    }

    useEffect(() => {

        if (props['attentions'] != null) {

            tableview_columns_generate()

            d3.select(splotSvg.current).selectAll("*").remove()
            var wordLength = Math.max(
                props.attentions['attentions']['input_tokens'].length,
                props.attentions['attentions']['prompt_tokens'].length)

            let xScale_top = d3.scaleLinear()
                .domain([0, (wordLength - 0.5) * interval])
                .range([0, 600])

            let xScale_bot = d3.scaleLinear()
                .domain([0, (wordLength - 0.5) * interval])
                .range([0, 600])

            let yScale = d3.scaleLinear()
                .domain([0, fixed_height + 1])
                .range([200, 0])

            const xAxis_top = d3.axisBottom(xScale_top).tickFormat(function (d) {
                var index = d / interval;
                return props.attentions['attentions']['input_tokens'][index];
            }).tickSize(0);

            const xAxis_bot = d3.axisBottom(xScale_bot).tickFormat(function (d) {
                var index = d / interval;
                return props.attentions['attentions']['prompt_tokens'][index];
            }).tickSize(0);

            const svg = d3.select(splotSvg.current)
            const lines_svg = d3.select(splotSvg.current).append('g').attr('transform', `translate( ${100}, ${0})`)

            svg.append('g')
                .attr('class', 'xaxis')
                .attr('transform', `translate(${100}, ${0})`)
                .call(xAxis_top).attr('stroke-width', 0)
            svg.append('g')
                .attr('class', 'yaxis')
                .attr('transform', `translate( ${100}, ${200})`)
                .call(xAxis_bot).attr('stroke-width', 0)


            var attn_value_list = props.attentions['attentions'][`${layerIdx}`].map(d => d.attn_value)
            var layer_q3 = d3.quantile(attn_value_list, 0.75)

            lines_svg.selectAll('line')
                .attr('transform', `translate( ${0}, ${0})`)
                .data(props.attentions['attentions'][`${layerIdx}`])
                .enter()
                .append('line')
                .attr("stroke", "red")
                //.attr('stroke-width', d => d.attn_value * d.attn_value / max_attn_value)
                .attr('stroke-width', function(d){
                    if (d.attn_value > layer_q3){
                        return d.attn_value
                    } else{
                        return d.attn_value/10
                    }
                })
                .attr("x1", d => xScale_top((d.input_pos * interval)))
                .attr("x2", d => xScale_bot((d.prompt_pos * interval)))
                .attr("y1", yScale(fixed_height))
                .attr("y2", yScale(0))


            const text_svg_top = d3.select(splotSvg.current).append('g').attr('transform', `translate( ${100}, ${0})`)
            const text_svg_bottom = d3.select(splotSvg.current).append('g').attr('transform', `translate( ${100}, ${0})`)
            text_svg_top.selectAll('text')
                //.attr('transform', 'translate(100, 200)')
                .data(props.attentions['attentions']['input_tokens'])
                .enter()
                .append('text')
                .attr('id', (d, i) => 'text_input_' + i)
                .attr('x', (d, i) => xScale_top((interval * (i - 0.5))))
                .attr('y', yScale(fixed_height))
                .text(d => d)
                .style('font-size', 7 +
                    (30 / props.attentions['attentions']['input_tokens'].length))
            text_svg_bottom.selectAll('text')
                //.attr('transform', 'translate(100, 200)')
                .data(props.attentions['attentions']['prompt_tokens'])
                .enter()
                .append('text')
                .attr('id', (d, i) => 'text_input_' + i)
                .attr('x', (d, i) => xScale_top((interval * (i - 0.5))))
                .attr('y', yScale(0))
                .text(d => d)
                .style('font-size', 7 +
                    (30 / props.attentions['attentions']['input_tokens'].length))

        } else {
            const svg = d3.select(splotSvg.current);
            svg.select('.xaxis').remove();
            svg.select('.yaxis').remove();
            svg.selectAll('line').remove();

        }

    }, [props.attentions, data]);

    return (
        <div>
            <div>
                <div id="container" style={{ padding: "2%" }}>
                    <b>Attention Map</b>
                </div>
                <div style={{ padding: "2%", paddingTop: "0%", width: "20%" }}>
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