var last_index=0

 function figure(width_,height_)
{
	var width = width_
	var height= height_
	var padding = [50,20,20,20]
	var json_data = {}
	this.svg= {}
	this.root={}
	this.scaleX={}
	this.scaleY={}
	var xAxis
	var xrange
	var yrange
	var yAxis
	var dot= {"r": 4}
	var index=0
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
  			this.root=d3.select("body")
				.append("div")
				.attr("id",last_index)
				.attr("class","plot")
			// range control
			xrange=this.root.append("p").text("X range: ")
			xrange.append("input").attr("class","minx").attr("type","number")
			
			xrange.append("input").attr("class","maxx").attr("type","number")

			yrange=this.root.append("p").text("Y range: ")
			yrange.append("input").attr("class","miny").attr("type","number")
			
			yrange.append("input").attr("class","maxy").attr("type","number")

			.append("input").class="minx"

			this.svg=this.root.append("svg")
				.attr("width",width)
				.attr("height",height)
				.attr("id",index)
			this.svg.append("clipPath")
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


    	this.root.select("input.minx").attr("value",minx).attr("step",step)
    	this.root.select("input.maxx").attr("value",maxx).attr("step",step)

		var scaleX=d3.scaleLinear().domain([
			minx,
			maxx
			]).range([padding[0],width-padding[1]])

		var miny=d3.min(dataset,function(d){return d[1]} )
    	var maxy=d3.max(dataset,function(d){return d[1]})
    	var stepy=(maxy-miny)/10.

    	

    	this.root.select(".miny").attr("value",miny).attr("step",stepy)
    	this.root.select(".maxy").attr("value",maxy).attr("step",stepy)


		 var scaleY=d3.scaleLinear().domain([
			miny,maxy
			]).range([height-padding[2],padding[3]])

		this.svg.append("g")
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

	this.scaleX=scaleX
	this.scaleY=scaleY


	this.svg.append("g").
		attr("class","x axis")
		.attr("transform","translate(0,"+(height-padding[2]) + ")")
		.call(xAxis)
	this.svg.append("g")
		.attr("class","y axis")
		.attr("transform","translate("+(padding[0]) + ",0)")
		.call(yAxis)
	this.root.append("p").attr("class","cursor_position").text("None,None")

}

this.rescaleAxis=function(minX,maxX,axis)
{
	var dataPoints=this.svg.selectAll("circle")
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
		this.scaleX=scale
	}
	else if(axis=="y")
	{
		axis=d3.axisLeft(scale)
		positionSelector="cy"
		axisSelector=".y.axis"
		idx=1
		yAxis=axis
		this.scaleY=scale
	}

	dataPoints.attr(positionSelector,function(d){return scale(d[idx])})
	this.svg.select(axisSelector).call(axis)


}


}

var figs=[]



d3.json("plot.json").then(
	function(json_data)
	{
		// function() {
  					
  
  //   				}

		function change_axis ( i,axis)
			{
				return function()
				{
					parent=this.parentNode
    			    var minx=d3.select(parent).select(".min"+axis).property("value");
    				var maxx=d3.select(parent).select(".max"+axis).property("value");
   					
  					figs[i].rescaleAxis(minx,maxx,axis)
				}

			}
		function update_positions_on_mouse_over(i)
		{
			return function()
			{
				var pos = d3.mouse(this);
				x=figs[i].scaleX.invert(pos[0])
				y=figs[i].scaleX.invert(pos[1])

				figs[i].root.select(".cursor_position").text(x.toFixed(2) + "," + y.toFixed(2) )

			}
		}


		for(var i=0;i<json_data["figures"].length;i=i+1)
		{
			var fig= new figure(800,500)
			fig.data(json_data["figures"][i])
			fig.makeScatterPlot()
			fig.root.selectAll('.minx,.maxx')
  				.on('change',change_axis(i,"x") )
  			fig.root.selectAll('.miny,.maxy')
  			  	.on('change',change_axis(i,"y") )
  			fig.root.select("g.dataPoints").on('mouseover',update_positions_on_mouse_over(i) )
  			console.log(fig.root)
  			figs.push(fig)

		}
	}
	)

// d3.selectAll('#maxx,#minx')
//   .on('change', function() {
//     var minx = eval(d3.select("#minx").property('value'));
//     var maxx= eval(d3.select("#maxx").property('value'));
//     console.log([minx,maxx])
//     for (i=0;i<figs.length;i++)
//     	{
//     		figs[i].rescaleAxis(minx,maxx,"x")
//    		}
//     })

//  d3.selectAll('#maxy,#miny')
//     .on('change', function() {
//       var miny = eval(d3.select("#miny").property('value'));
//       var maxy= eval(d3.select("#maxy").property('value'));
//       console.log([miny,maxy])
//       for(i=0;i<figs.length;i++)
//       	{
//       		figs[i].rescaleAxis(miny,maxy,"y")
//       	}
//       })

