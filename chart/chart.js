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


const Figure = ({boxSettings,input_data} ) =>
{

    const [ data,setData] = React.useState(input_data);

    const [xLabel,setXLabel] = React.useState(data.columns[0]);
    const [yLabel,setYLabel] = React.useState(data.columns[1]);

    const [expandFactor,setExpandFactor] = React.useState(0.1);


    let xExtent = React.useMemo( () => {
          return d3.extent(data,(d) => {return parseFloat(d[xLabel]);}   );
    },[data,xLabel]);
    let yExtent = React.useMemo( () => {
        return d3.extent(data,(d) => {return parseFloat(d[yLabel]);}   );
  },[data,yLabel]);


   // let yExtent =  d3.extent(data,(d) => {return parseFloat(d[yLabel]);}   );


    const [xRange,setXRange] = React.useState(  xExtent );
    const [yRange,setYRange] = React.useState( yExtent  );

    const [selectionBox,setSelectionBox] = React.useState({left : xExtent[0],right : xExtent[1],top : yExtent[1],bottom :yExtent[0] ,show : false} );


    React.useEffect(()=>{
        
        setSelectionBox( {left : xExtent[0],right : xExtent[1],top : yExtent[1],bottom :yExtent[0] ,show : false} );
        setXRange(xExtent);
        setYRange(yExtent)

    },[xLabel,yLabel])

    React.useEffect(()=>{
        //yExtent =  d3.extent(data,function(d) {return parseFloat(d[yLabel]);}   );
        setYRange(yExtent);

    },[yLabel])

    React.useEffect(()=>{
        //yExtent =  d3.extent(data,function(d) {return parseFloat(d[yLabel]);}   );
        setYRange(yExtent);

    },[yLabel])


    const updateXSelection= (left,right,show=true) =>
    {
        
        if  ( (left < xRange[0] )|| (right > xRange[1] ) ) 
        {
            const leftRange = (left < xRange[0]) ? xExtent[0] : xRange[0];
            const rightRange = (right > xRange[1] ) ? xExtent[1] : xRange[1];

            setXRange([leftRange,rightRange]);
        }



        const box = Object.assign({}, selectionBox);
        box.left=left;
        box.right=right;
        box.show=show;
        setSelectionBox(box);

    }

    const updateYSelection= (left,right,show=true) =>
    {
        
        if  ( (left < yRange[0] )|| (right > yRange[1] ) ) 
        {
            const leftRange = (left < yRange[0]) ? yExtent[0] : yRange[0];
            const rightRange = (right > yRange[1] ) ? yExtent[1] : yRange[1];

            setYRange([leftRange,rightRange]);
        }



        const box = Object.assign({}, selectionBox);
        box.bottom=left;
        box.top=right;
        box.show=show;
        setSelectionBox(box);

    }

    const updateXRange=(newRange) =>
    {
        updateXSelection(newRange[0],newRange[1],false);

        setXRange(newRange);
        //setExpandFactor(0.0);

    }

    const updateYRange=(newRange) =>
    {
        updateYSelection(newRange[0],newRange[1],false);

        setYRange(newRange);
        //setExpandFactor(0.0);

    }

    const innerBox = getInnerBox(boxSettings) ;


    /*
    Scales  
    */


    const xScale = createScale(
        { domain : xRange,
          range :   [0,innerBox.width],
          expandFactor : expandFactor
        }
          );

    const yScale = createScale(
            { domain : yRange,
              range :   [0,innerBox.height].reverse(),
              expandFactor : expandFactor
            }
              )
    
    

    


    const svg = <svg
            className="plotContainer"
            width={boxSettings.width}
            height={boxSettings.height}
            >
                 <g 
                    transform={
                        `translate(${boxSettings.marginLeft}, ${boxSettings.marginTop})`
                    }

                >
                <clipPath id="chartArea">
                <rect  style={{width:innerBox.width,height:innerBox.height}} />
                </clipPath>

                <rect className="plotArea" style={{width:innerBox.width,height:innerBox.height}} />
                    <g  clipPath="url(#chartArea)">
                        <Scatter
                        data={data} 
                        xScale={xScale}
                        yScale={yScale}
                        xLabel={xLabel}
                        yLabel={yLabel}
                        />

                        <HilightBox 

                            {... selectionBox}
                            xScale = {xScale}
                            yScale = {yScale}

                        />
                    </g>
                </g>



                <g 
                transform={
                    `translate(${boxSettings.marginLeft}, ${boxSettings.marginTop})`
                    }
                className="axis"
                >
                <Axis scale={yScale}
                orientation="left"

                innerTickWidth={innerBox.width}
                />

                </g>



                <g 
                transform={
                    `translate(${boxSettings.marginLeft}, ${boxSettings.height - boxSettings.marginBottom})`
                    }
                className="axis"
                >
                <Axis scale={xScale}
                orientation="bottom"
                innerTickWidth= {innerBox.height}
                />

                </g>

               


                
            </svg>
    
     return <div>
        {svg}

        <div className="plotControl" >

        <AxisControl 
        label={xLabel}
        setLabel={setXLabel}
        columns={data.columns}
        updateSelection={updateXSelection}
        updateRange={updateXRange}
        extent={xExtent}
        selectionBox={selectionBox}
        axis="x"

        />

        <AxisControl 
            label={yLabel}
            setLabel={setYLabel}
            columns={data.columns}
            updateSelection={updateYSelection}
            updateRange={updateYRange}
            extent={yExtent}
            selectionBox={selectionBox}
            axis="y"
        />
        </div>
        </div>

}

const AxisControl =  ({label,setLabel,columns,updateSelection,updateRange,extent,selectionBox,axis}) =>
{
    
    return  <div className="axisControl">
        
        <dl>
            <dt>Label</dt>
            <dd>

                 <SelectColum
                  value = {label}
                    labels = {columns}
                    onChange = {(e) => setLabel(e.target.value) }
                    />
            </dd>

            <dt>Range</dt>
            <dd>

             <Slider 
        
        onChange= { (e,value) => { updateSelection( value[0] , value[1] )  } }
        onChangeCommitted = {(e,value) => { updateRange(value)} }
         max={extent[1]} 
         min = {extent[0]}
         step={0.01 * (extent[1] - extent[0])} 
         value={
             axis === "x" ? [selectionBox.left, selectionBox.right ]
                       : [selectionBox.bottom,selectionBox.top]
            } 
         style={{width:100}}
         valueLabelDisplay="auto"

         />
         
        </dd>
        </dl>
          </div>
          
}














const SelectColum=({value,labels,onChange}) =>
{
    const labelOptions=labels.map( (x)=> <option value={x} key={x}> {x} </option>    )
    return <select value={value} onChange={onChange} >
            {labelOptions}
        </select>
}



const Scatter=({data,xLabel,yLabel,xScale,yScale,line}) =>
{
    const transformedData = data.map( 
        (d) =>{
            return [ xScale(d[xLabel]) , yScale(d[yLabel]) ]
        }
    );

     const dots=transformedData.map( (d)=>
    {
        return <Dot 
        key={`${d[0]}-${d[1]}`} 
        kind="circle" 
        x={d[0]}
        y={d[1]} 

        size={20}

        />
    });



    const lineGenerator = d3.line();

    const d=lineGenerator(transformedData);
    let lineElement={};

    if (line === undefined )
    {
    lineElement = <path
     d={d}
     style={{
         fill:"none",
         "strokeWidth": 2,
         "strokeLinejoin" :"round",
         "strokeLinecap": "round",
         "stroke" : "blue",
         "strokeDasharray":"6,6"
        }}
     > </path>;
    }

    return <g  >
        {dots}
        {lineElement}
        </g>
};

const Dot = ({kind,size,x,y}) =>
{

    if (kind === "circle")
    {
        const r=Math.sqrt(size);
        return <circle cx={x} cy={y} r={r} 
        />;
    }

}



const Tick = ({orientation,width,innerWidth=0}) =>
{
    let innerTick;

    const getTickEndPoints= (orientation) =>
    {
        if (orientation === "bottom")
        {
            return [ [0,0] , [0,width]    ]
        }
        else if (orientation === "left")
        {
        return [ [-width,0] , [0,0]  ]
        }
    }

    if (orientation === "bottom")
    {
        innerTick=
        <line 
        className="inner"
        x1={0} 
        x2={0}
        y1={0}
        y2={-innerWidth}
        />
    }

    
    if (orientation === "left")
    {
        innerTick=
        <line 
        className="inner"
        x1={0} 
        x2={innerWidth}
        y1={0}
        y2={0}
        />
    }
    




    const [ [x1,y1], [x2,y2]  ] =getTickEndPoints(orientation);



    return <g className="tick">   
     <line className="outer"
        x1={x1}
        x2={x2}

        y1={y1}
        y2={y2}
        />

        {innerTick}
        </g>

    
}


function createScale({range,domain,expandFactor=0})
{
    const domainWidth= domain[1] - domain[0];

    const expandedDomain= [ 
        domain[0] - domainWidth*expandFactor,
        domain[1] + domainWidth*expandFactor
        
    ]


    const scale = d3.scaleLinear()
    .domain(expandedDomain)
    .range(range);
    return scale;
}


const Axis = ({scale,orientation , innerTickWidth=10}) =>
{
    const domain = scale.domain();
    const range = scale.range();

    

    const tickWidth=6;
    
    
    const width= range[1] - range[0];


    const tickValues = scale.ticks()
    const tickRangeOffsets = tickValues.map( (offSet) => scale(offSet))
    
    const ticks = d3.zip(tickRangeOffsets,tickValues).map(([offSet,label]) => {

    const tick = <Tick orientation={orientation} width={tickWidth} innerWidth={innerTickWidth} ></Tick>;
    let tickTransform;
    let labelTransform;
    
    if ( orientation == "bottom" )
    {
        tickTransform=`translate(${offSet},0)`;
        labelTransform=`translateY(${ 20}px)`;

    }
    else if (orientation == "left")
    {
        tickTransform=`translate(0,${offSet})`;
        labelTransform=`translateX(-${20}px)`;

    }



    return <g transform={tickTransform} key={offSet}>
            {tick}
            <text
            style={{
              fontSize: "10px",
              textAnchor: "middle",
              transform: labelTransform
            }}>
                {label}
            </text>
        </g>
    });


    const getEndPoints= (orientation,range) =>
    {
        if ( orientation == "bottom" )
            {
            return [[range[0],0] , [range[1],0] ]
            }
        else if (orientation == "left")
            {
                return [[0,range[0]] , [0,range[1]]]
            }
    }


    const [[x1,y1],[x2,y2]] = getEndPoints(orientation,range);


    return  <g >

                <line
                x1={x1} 
                x2={x2}
                y1={y1}  
                y2={y2} 
                />  

                {ticks}

                </g>
}

const HilightBox = ( {left,right,bottom,top, xScale, yScale,show}) =>
{
    const x1 = xScale(left);
    const x2 = xScale(right);
    const y1 = yScale(bottom);
    const y2 = yScale(top);

    const width= x2 - x1;
    const height= y1 - y2;

    const visibility = (show === true) ? "visible" : "hidden";



    return <g className="hilightBox" transform={`translate(${x1},${ y2})`} visibility={visibility}>
        <rect width={width} height={ height   }  />
    </g>

}

const boxSettings = 
{
    width : 600,
    height : 400,
    marginLeft : 40,
    marginRight : 10,
    marginBottom : 30,
    marginTop : 10
};

function getInnerBox(boxSettings)
{
    return {
        width : boxSettings.width - boxSettings.marginLeft - boxSettings.marginRight,
        height : boxSettings.height - boxSettings.marginTop - boxSettings.marginBottom
    }
}






  d3.dsv(" ","test.dat").then( (data) =>{

    ReactDOM.render(
        < Figure boxSettings={boxSettings} input_data={data} />,
        document.getElementById('test_plot')
      );

  }
  );