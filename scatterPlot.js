
data= { "x" : [0.0,0.2,0.6,0.9] , "y" : [0.0,0.23,0.39,0.6]     }

data["z"]=data["y"].map((y) => y**2);


class figure
{
    constructor(element)
    {
	this.rootElement=element;
	this.svg=element.append("svg").attr("width","100%");
	this.svg.attr("height","100%");
	this.xAxes=[];
	this.yAxes=[];

	
	const box = this.rootElement.node().getBoundingClientRect();
	this.width=box.width;
	this.height=box.height;
	this.padding=[10,10,40,30];
	
	
    }

 

    createScaleAxis(axConfig)
    {
	const minx = axConfig["min"];
	const maxx = axConfig["max"];
	const ax = axConfig["ax"];

	let mappedMin;
	let mappedMax;
	let axisObject;
	
	if (ax == "x")
	{
	
	    mappedMin = this.padding[3];
	    mappedMax = this.width - this.padding[1] ;
	}
	else if (ax == "y")
	{
	    mappedMin = this.height - this.padding[2];
	    mappedMax = this.padding[0];
	}
	
	const scale = d3.scaleLinear()
	      .domain([minx,maxx])
	      .range([mappedMin,mappedMax]);

	return scale;
    }

    
    createAxis(axConfig)
    {
	
	const that = this;
	
	const update=function(axConfig)
	{
	    if (! ( "ax" in axConfig) )
	    {
		axConfig.ax=this.ax;
	    }
	    const scale=that.createScaleAxis(axConfig)
	    
	    let xOffset,yOffest;
		
	    if (this.ax === "x")
	    {
		this.axis=d3.axisBottom(scale);
		
		
		xOffset=0;
		yOffest=that.height - that.padding[2] 
		
	    }
	    else if (this.ax === "y")
	    {
		this.axis = d3.axisLeft(scale);
		xOffset=that.padding[3];
		yOffest=0;
	    }
	    
	    this.artist.attr("class",this.ax + " axis")
		.attr("transform","translate(" + xOffset + ","+ yOffest+ ")");
	    
	    this.artist.call(this.axis);
	}
	
	const artist = this.svg.append("g")
	
	const axisObject={artist: artist,"ax":axConfig.ax,update: update}
	axisObject.update(axConfig);
	
	return axisObject;
	
    }
    
    addAxis(axConfig)
    {
	const axis = this.createAxis(axConfig);

	if (axis.ax == "x")
	{
	    this.xAxes.push(axis);
	}
	else if (axis.ax == "y")
	{
	    this.yAxes.push(axis);
	}

	return this;
    }
    
}

    

class scatterPlot
{
    constructor(figure,label)
    {
	this.figure=figure
	this.xAxis=figure.xAxes[0];
	this.yAxis=figure.yAxes[0];
	
	this.svg=this.figure.svg;
	this.radius=5;
	this.color="red";
	this.label=label;
	const element=this.figure.svg.append("g").attr("class",label);
	element.append("path").attr("class","line");

	const xGridElements=this.xAxis.artist.append("g").attr("class","grid");
	const yGridElements=this.yAxis.artist.append("g").attr("class","grid");
	
	
    }

    subRePlot()
    {
	this.plot(this.data,this.xColumn,this.yColumn)
    }

    rePlot()
    {
	if (this.parentPlot != undefined)
	{
	    this.parentPlot.rePlot();
	}
	else
	{
	    this.subReplot()
	}
    }
    

    
    xrange(minx,maxx)
    {
	this.xAxis.update({"min":minx  ,"max":maxx,"scale" : "linear"} )
    }

    yrange(minx,maxx)
    {
	this.yAxis.update({"min":minx  ,"max":maxx,"scale" : "linear"} )
    }


    
    plotLines(data,xColum,yColumn)
    {
	const scaleX = this.xAxis.axis.scale();
	const scaleY = this.yAxis.axis.scale();
	
	const line = d3.line()
	      .x( (d)  => scaleX(d[0]) )
	      .y( (d) => scaleY(d[1] ))
	      .curve(d3.curveCardinal);
	
	const element=this.svg.select("g."+this.label).select("path");
	
	element
	    .attr("d", 	line(d3.zip(data[xColum],data[yColumn])) )
	    .attr("stroke", this.color)
            .attr("stroke-width", 2)
            .attr("fill", "none");
	
    }

    
    plot(data,xColumn,yColumn)
    {
	this.xColumn = xColumn;
	this.data=data;
	this.yColumn=yColumn;


	
	const x= data[xColumn];
	const y = data[yColumn]
	
	const scaleX = this.xAxis.axis.scale();
	const scaleY = this.yAxis.axis.scale();

	const element=this.svg.select("g."+this.label);
	
	element.selectAll("circle").data(x).enter()
	    .append("circle");
	
	element.selectAll("circle").data(x)
	    .attr("cx", function(d) {return scaleX(d) } )
	    .attr("r", this.radius)
	    .attr("fill",this.color);
	
	element.selectAll("circle").data(y)
	    .attr("cy",function(d) {return scaleY(d)})

	if (this.lines != undefined )
	{
	    this.plotLines(data,xColumn,yColumn);
	}
    }

    
    
    makeGrid(displayAxes=["x","y"])
    {
	const xArtist=this.xAxis.artist;
	const yArtist=this.yAxis.artist;
	
	const xticks = this.xAxis.axis.scale().ticks();
	const yticks = this.yAxis.axis.scale().ticks();
	
	const scaleY = this.yAxis.axis.scale();
	const scaleX = this.xAxis.axis.scale();
	
	const xGridElements=xArtist.select("g.grid");
	const yGridElements=yArtist.select("g.grid");
	
	
	xGridElements.selectAll("line").data(xticks).enter().append("line");
	yGridElements.selectAll("line").data(yticks).enter().append("line");
	
	if ( displayAxes.includes("x") )
	{
	    xGridElements.selectAll("line")
		.data(xticks)
		.attr("x1",(d) => scaleX(d))
		.attr("y1",(d) => 0)
		.attr("x2",(d) => scaleX(d))
		.attr("y2",(d) => -( this.figure.height - this.figure.padding[0] - this.figure.padding[2] ) )
		.attr("style","stroke:lightgray;stroke-width:2");
	}

	if ( displayAxes.includes("y") )
	{

	    yGridElements.selectAll("line")
		.data(yticks)
		.attr("x1",(d) => 0 )
		.attr("y1",(d) => scaleY(d) )
		.attr("y2",(d) => scaleY(d) )
		.attr("x2",(d) => ( this.figure.width - this.figure.padding[1] - this.figure.padding[3] ) )
		.attr("style","stroke:lightgray;stroke-width:2");
	}
	
	
	

	
	
    }
    
}


class Plot
{
    constructor(figure)
    {
	this.figure=figure;
	this.plots=Array(0);	
    }

    
    scatterPlot(label)
    {
	const plot = new scatterPlot(this.figure,label);
	
	this.plots.push( plot  );
	
	return plot;
	
    }
    
    rePlot()
    {
	for (let plot of this.plots)
	{
	    plot.subRePlot();
	}
    }
}


const fig = new figure(d3.select("#scatterPlotContainer") );
fig.addAxis({"min":0,"max":1,"ax":"x","scale" : "linear"});
fig.addAxis({"min":0,"max":1,"ax":"y","scale" : "linear"});

const plot = new Plot(fig)

const plot1 = plot.scatterPlot("plot1");
const plot2 = plot.scatterPlot("plot2");


plot2.color="blue";
plot1.yrange(0,1);

plot1.plot(data,"x","y");
plot2.plot(data,"x","z");

plot1.yrange(0,0.6);


plot1.lines=true;
plot2.lines=true;

plot.rePlot();
plot1.makeGrid();





//fig.xAxes[0].update({"min":0,"max":2,"scale" : "linear"});



//data["y"]=data["y"].map( (y) => y);
//plot2.plot(data,"x","y");

//fig.xAxes[0].update({"min":0  ,"max":0.8,"scale" : "linear"} )
