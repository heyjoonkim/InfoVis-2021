import React, {useEffect, useState} from "react";
import MaterialTable from "material-table";

const TablePlot = (props) => {

	const [selectedId, setSelectedId] = useState(null);

	useEffect(() => {
		
	}, []);

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

    return (
		<div>
			<MaterialTable
				
				columns={[
					{title:"Sentence", field:"sentence"},
					{title:"Label", field:"label"},
				]}
				data={renderItems()}
				
				onRowClick={(evt, selectedRow) => {
					props.setSelectedData(props.data[selectedRow.tableData.id]);
					setSelectedId(selectedRow.tableData.id);
				}}

				// options provided
				options={{
					toolbar:false,
					paging:false,
					maxBodyHeight: 350,
					rowStyle: (rowData) => ({
												backgroundColor:
												selectedId === rowData.tableData.id ? "#6ABAC9" : "#FFF",
												fontSize: 12.5,
											}),
				}}
			/>
        </div>
	)
};

export default TablePlot;