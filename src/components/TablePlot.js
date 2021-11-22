import React, {useEffect} from "react";
import MaterialTable from "material-table";

const TablePlot = (props) => {

	useEffect(() => {
		
	}, [props.selectedData]);

	function renderItems() {
		var result = [];
		console.log(props.data);
		props.data.forEach((d, i) => {
			var tmp = {
				"sentence":d['sentence'], 
				"label" : d["label"],
			}
			result.push(tmp);
		})
		return result;
	}

    return (
		<div>
			<MaterialTable
				// options provided
				options={{
					toolbar:false,
					paging:false,
					maxBodyHeight: 350,
					rowStyle: {
					fontSize: 12.5,
					}
					}}
				columns={[
					{title:"Sentence", field:"sentence"},
					{title:"Label", field:"label"},
				]}
				data={renderItems()}
			/>
        </div>
	)
};

export default TablePlot;