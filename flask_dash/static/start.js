'use strict';

const {
    colors,
    CssBaseline,
    ThemeProvider,
    Typography,
    Container,
    makeStyles,
    createMuiTheme,
    Box,
    SvgIcon,
    Link,
    Button,
    Slider
  } = MaterialUI;



var socket = io();



socket.on('draw_plot', function(data) {
    const image=document.querySelector("#plot_image");
    const imageData = data.split('\'')[1]

    image.src="data:image/png;base64, " + imageData
    
});

socket.on("connect", () => {socket.emit("data_info")})

class DrawButton extends React.Component
{
    constructor(props)
    {
        super(props)
        this.draw_plot_command=props.onClick;

    }
    render()
    {
        



        const button =  
        <button className="draw" onClick={this.draw_plot_command} > Draw</button>
        

        return button
    }

}

class SelectLabel extends React.Component
{
    constructor(props)
    {
        super(props)
        this.state={columns : props.columns,axis : props.axis}
        
    }


   

    render()
    {


        const options = this.state.columns.map( (label) =>
            <option value={label} key={label} >
                {label}
            </option>
        );


        const selectOb = 
        <div>
            {this.state.axis} column:  
        <select name={ this.state.axis + "_label"} value={this.props.value} onChange={this.props.onChange } >
            {options}
        </select>
        </div>
        ;

        return selectOb;
    }
}


class AxisRange extends React.Component
{
    


    constructor(props)
    {
        super(props)

        

    }


    render()
    {
        const shiftInInterval=function(x,min,max)
        {
            return (x > min) ?  (   ( x < max) ? x : max ) : min ;
        }

        const valueLeft=shiftInInterval(this.props.value[0],this.props.min,this.props.max);
        const valueRight=shiftInInterval(this.props.value[1],this.props.min,this.props.max);

        
        return  <div className="slider" >
        <Slider
         value={ [valueLeft,valueRight] } 
         onChange={this.props.onChange} 
         min={this.props.min}
         max={this.props.max}
        aria-labelledby="label"
        step={0.01}
        valueLabelDisplay="auto"

        onChangeCommitted={this.props.onChangeCommitted}

        />

        </div>
  
    }


}



class PlotControl extends React.Component
{
    constructor(props)
    {
        super(props)
        this.state=props.data_info;
        this.state.xLabel=this.state.columns[0]
        this.state.yLabel=this.state.columns[1]
        this.state.minX=this.state.ranges[this.state.xLabel][0]
        this.state.maxX=this.state.ranges[this.state.xLabel][1]

        this.state.minY=this.state.ranges[this.state.yLabel][0]
        this.state.maxY=this.state.ranges[this.state.yLabel][1]

        this.draw();
    }




    render()
    {
        const xRange = this.state.ranges[this.state.xLabel];
        const yRange = this.state.ranges[this.state.yLabel];

        const element = <div>
                    <SelectLabel columns={this.state.columns} axis="x" value={this.state.xLabel} onChange={this.update.bind(this)} />
                    <SelectLabel columns={this.state.columns} axis="y" value={this.state.yLabel} onChange={this.update.bind(this)} />
                    <AxisRange
                     value={[this.state.minX,this.state.maxX]} 
                     onChange={this.updateXrange.bind(this)}
                     min = {xRange[0]}
                     max= {xRange[1]}
                     onChangeCommitted={ (event,value) => this.draw() }
                     >  
                     </AxisRange>

                     <AxisRange
                     value={[this.state.minY,this.state.maxY]} 
                     onChange={this.updateYrange.bind(this)}
                     min = {yRange[0]}
                     max= {yRange[1]}
                     onChangeCommitted={ (event,value) => this.draw() }
                     >  
                     </AxisRange>
                    

                </div> ;
        return element;
    }

    draw()
    {
        socket.emit("draw_plot",{
            "x":this.state.xLabel,
            "y":this.state.yLabel,
            "minX": this.state.minX,
            "maxX" : this.state.maxX,
            "minY": this.state.minY,
            "maxY" : this.state.maxY

        });

    }

    update(e)
    {
        

        const action = this.draw.bind(this);
        const updatedSettings={}

        if ( e.target.name === "x_label" )
        {
            updatedSettings.xLabel = e.target.value;
            const xrange=this.state.ranges[e.target.value];
            this.state.minX=xrange[0];
            this.state.maxX=xrange[1];


        }
        else if (e.target.name == "y_label")
        {
            updatedSettings.yLabel = e.target.value;
            const yrange=this.state.ranges[e.target.value];
            this.state.minY=yrange[0];
            this.state.maxY=yrange[1];
        }

        this.setState(updatedSettings, () => this.draw());


    }

    updateXrange(e,newRange)
    {
        this.setState(
            {minX:newRange[0],
                maxX:newRange[1]
            }
            );


    }


    updateYrange(e,newRange)
    {
        this.setState(
            {minY:newRange[0],
                maxY:newRange[1]
            }
            );


    }


}


socket.on("data_info", function(data)
{
    ReactDOM.render(
        <PlotControl data_info={data} />,
        document.getElementById('plotControl')
      );


}

)
