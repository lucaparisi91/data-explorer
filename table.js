
const data = {"x" : [1.0,2.0,3.0] , "y" : [1.0,4.,9.0] , "delta" : [0.1,0.2,0.02] }


class DynamicTable extends React.Component
{
    createColumnNames()
    {
	const labels=Array();
	for (let label in this.state.data)
	{
	    labels.push(label)
	}
	
	return labels
	    
    }

    
    constructor(props)
    {
	super(props)
	this.state={data : props.data }
	this.update()
    }

    update()
    {
	this.labels=this.createColumnNames();
	this.length=this.labels.length == 0 ? 0 : this.labels.length;
	
    }

    
    createRows()
    {
	const rows = Array();

	for ( let i=0;i<this.length;i++)
	{
	    
	   const  cells = this.labels.map(
	       label=> (
		       <td key={label}>
		       {this.state.data[label][i]}
		   </td>
	       )
	   )
	    
	    rows.push(<tr key={i.toString()}>{cells}</tr>)
	}

	return rows
	    
    }
		    
	
	

    
    render()
    {
	const columns = Array();

	for (let label in this.state.data)
	{
	    columns.push(<th key={label}>{label}</th>)
	}

	const rows = this.createRows();
	
	return (
		<table>
		<thead>
		<tr>{columns}</tr>
		</thead>
		<tbody>
		{rows}
		</tbody>
	    </table>
	)
	    
    }
}

const domContainer = document.querySelector('#testTable');
ReactDOM.render( <DynamicTable data={data} />  , domContainer);
