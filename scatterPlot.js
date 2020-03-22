var last_index=0

 function figure(width_,height_)
{
	var width = width_
	var height= height_
	var padding = [30,20,20,20]
	var json_data = {}
	var svg= {}
	var scaleX
	var scaleY
	var xAxis
	var yAxis
	var dot= {"r": 2}
	var index
 	this.color = function(){return "red"}
 	this.data = function(data_)
 	{
 		json_data=data_
 		color = d3.scaleOrdinal()
  			.domain(json_data["labels"])
  			.range(d3.schemeSet2);
 	}

 	this.makeScatterPlot = function()
		{	
			dataset=json_data["data"]

			index=last_index + 1
			last_index=index
  		//var color=function(label) {return "red"}
			svg=d3.select("body")
				.append("svg")
				.attr("width",width)
				.attr("height",height)
				.attr("id",index)
			svg.append("clipPath")
  				.attr("id", "mask")
  				.style("pointer-events", "none")
    			.append("rect")
    			.attr("x",padding[0])
      			.attr("y",padding[2])
      			.attr("width",width-padding[1]-padding[0])
      			.attr("height", height - padding[2]-padding[3])

    	
    	var minx = d3.min(dataset,function(d){return d[0]} )
    	var maxx=d3.max(dataset,function(d){return d[0]})
    	var step=(maxx - minx)/10.

    	d3.select("#minx").attr("value",minx).attr("step",step)
    	d3.select("#maxx").attr("value",maxx).attr("step",step)

		scaleX=d3.scaleLinear().domain([
			minx,
			maxx
			]).range([padding[0],width-padding[1]])

		var miny=d3.min(dataset,function(d){return d[1]} )
    	var maxy=d3.max(dataset,function(d){return d[1]})
    	var stepy=(maxy-miny)/10.

    	d3.select("#miny").attr("value",miny).attr("step",stepy)
    	d3.select("#maxy").attr("value",maxy).attr("step",stepy)


		 scaleY=d3.scaleLinear().domain([
			miny,maxy
			]).range([height-padding[2],padding[3]])

		svg.append("g")
			.attr("class","dataPoints")
			.attr("clip-path", "url(#mask)")
			.selectAll("circle")
	    	.data(dataset)
	    	.enter()
	    	.append("circle")

				.attr("cx",function(d){return scaleX(d[0])})
				.attr("cy",function(d){return scaleY(d[1])})
				.attr("r",dot["r"])
				.attr("fill",function(d){return color(d[2])})

	xAxis=d3.axisBottom(scaleX)
	yAxis=d3.axisLeft(scaleY)

	svg.append("g").
		attr("class","x axis")
		.attr("transform","translate(0,"+(height-padding[2]) + ")")
		.call(xAxis)
	svg.append("g")
		.attr("class","y axis")
		.attr("transform","translate("+(padding[0]) + ",0)")
		.call(yAxis)
	return svg
}

this.rescaleAxis=function(minX,maxX,axis)
{
	var dataPoints=svg.selectAll("circle")
	var scale=d3.scaleLinear()
			.domain( [minX,maxX])
	if (axis=="x")
	{
			scale.range([padding[0],width-padding[1]])
	}
	else if (axis=="y")
	{
			scale.range([height-padding[2],padding[3]])
	}

	var axis;
	var idx;
	if (axis=="x")
	{
		axis=d3.axisBottom(scale)
		positionSelector="cx"
		axisSelector=".x.axis"
		idx=0
		xAxis=axis
		scaleX=scale
	}
	else if(axis=="y")
	{
		axis=d3.axisLeft(scale)
		positionSelector="cy"
		axisSelector=".y.axis"
		idx=1
		yAxis=axis
		scaleY=scale
	}

	dataPoints.attr(positionSelector,function(d){return scale(d[idx])})
	svg.select(axisSelector).call(axis)


}


}

var figs=[]
d3.json("plot.json").then(
	function(json_data)
	{
		var fig= new figure(500,200)
		fig.data(json_data)
		fig.makeScatterPlot()
		figs.push(fig)

		var fig2= new figure(500,200)
		fig2.data(json_data)
		fig2.makeScatterPlot()
		figs.push(fig2)

		
	})

d3.selectAll('#maxx,#minx')
  .on('change', function() {
    var minx = eval(d3.select("#minx").property('value'));
    var maxx= eval(d3.select("#maxx").property('value'));
    console.log([minx,maxx])
    for (i=0;i<figs.length;i++)
    	{
    		figs[i].rescaleAxis(minx,maxx,"x")
   		}
    })

 d3.selectAll('#maxy,#miny')
    .on('change', function() {
      var miny = eval(d3.select("#miny").property('value'));
      var maxy= eval(d3.select("#maxy").property('value'));
      console.log([miny,maxy])
      for(i=0;i<figs.length;i++)
      	{
      		figs[i].rescaleAxis(miny,maxy,"y")
      	}
      })
