import React, {useEffect, useState} from "react";
import MaterialTable from "material-table";
import axios from 'axios';

const TablePlot = (props) => {


	useEffect(() => {
		
	}, [props.data]);

	function renderItems() {
		var result = [];
		props.data.forEach((d, i) => {
			var tmp = {
				"sentence":d['sentence'], 
				"label" : d["label"],
			}
			result.push(tmp);
		})
		return result;
	}

	function selectData(selectedRow) {

		if(props.selectedTableId === selectedRow.tableData.id) {
			props.setSelectedTableId(null);
			props.setSelectedData(null);
			return;
		}

		var data = props.data[selectedRow.tableData.id];
		var sentence = data['sentence'];
		sentence = sentence.split(props.prompt)[0];

		var url = props.host + '/sentence_detail';

        var formData = new FormData();
        formData.append("sentence" , sentence);
        formData.append("prompt" , props.prompt);

        axios.post(url, formData)
            .then(function (response) {
                //check for embeddings data 
				var selectedData = {};              
                if("data" in response) {
                    var data = response['data'];
                    if("topk" in data) {
						var topk = data['topk'];
						selectedData['topk'] = topk;
					
                    }
					if('attentions' in data) {
						var attentions = data['attentions'];
						selectedData['attentions'] = attentions;
					}
					selectedData['id'] = selectedRow.tableData.id;
					props.setSelectedData(selectedData);
                } else {
                    alert("No [embeddings] in response!");
                }
            })
            .catch(function(error) {
                console.log('ERROR : ', JSON.stringify(error))
            });
			props.setSelectedTableId(selectedRow.tableData.id);
	}

    return (
		<div>
			<MaterialTable 				
				columns={[
					{title:"Sentence", field:"sentence"},
					{title:"Label", field:"label"},
				]}
				data={renderItems()}
				
				onRowClick={(evt, selectedRow) => {
					selectData(selectedRow);
				}}

				// options provided
				options={{
					toolbar:false,
					paging:false,
					maxBodyHeight: 400,
					rowStyle: (rowData) => ({
												backgroundColor:
												props.selectedTableId === rowData.tableData.id ? "#6ABAC9" : "#FFF",
												fontSize: 12.5,
											}),
				}}
			/>
        </div>
	)
};

export default TablePlot;