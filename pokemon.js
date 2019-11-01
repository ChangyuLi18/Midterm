'use strict';


(function() {

  let data = "pokemon.csv";
  let svgContainer = ""; // keep SVG reference in global scope
  const colors = {

    "Bug": "#4E79A7",

    "Dark": "#A0CBE8",

    "Electric": "#F28E2B",

    "Fairy": "#FFBE&D",

    "Fighting": "#59A14F",

    "Fire": "#8CD17D",

    "Ghost": "#B6992D",

    "Grass": "#499894",

    "Ground": "#86BCB6",

    "Ice": "#86BCB6",

    "Normal": "#E15759",

    "Poison": "#FF9D9A",

    "Psychic": "#79706E",

    "Steel": "#BAB0AC",

    "Water": "#D37295"

}
  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 900)
      .attr('height', 700);
    
      // d3.csv is basically fetch but it can be be passed a csv file as a parameter
   
    d3.csv(data)
      .then((data) => makeScatterPlot(data));
    

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global var
    
    // get arrays of fertility rate data and life Expectancy data
    let SpDef = data.map((row) => parseFloat(row["Sp. Def"]));
    let total = data.map((row) => parseFloat(row["Total"]));
    // find data limits
    let axesLimits = findMinMax(SpDef, total);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);
    
    
    // draw title and axes labels
    makeLabels();
    makeColorLegend();
  }
  function makeColorLegend() {
    var key = colors.keys()
    var color = colors.values()
    // Add one dot in the legend for each name.
    var size = 20
    svgContainer.selectAll("mydots")
      .data(key)
      .enter()
      .append("rect")
        .attr("x", 100)
        .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})

    // Add one dot in the legend for each name.
    svgContainer.selectAll("mylabels")
      .data(key)
      .enter()
      .append("text")
        .attr("x", 100 + size*1.2)
        .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")


  }
  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 100)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text("Pokemon: Special Defense vs Total Stats");

    svgContainer.append('text')
      .attr('x', 400)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Sp. Def');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Total');
  }

  function filter() {
     
    dots
        .filter(function(d) {return selected != d['Legendary']&selected != d['Generation'];})
        .attr("display", displayOthers);        
    dots
        .filter(function(d) {return selected == d['Legendary']&selected == d['Generation'];})
        .attr("display", display);
  }
  // plot all the data points on the SVG
  // and add tooltip functionality
function plotData(map) {

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // var selected = 1;
    // var displayOthers =  "inline";
    // var display =  "none";
    // append data to SVG and plot as points
    var dots = svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        //.attr('r', (d) => pop_map_func(d["pop_mlns"]*2) )
        .attr('r',5)
        .attr('stroke', '#4286f4')
        .attr('stroke-width',1)
        .attr('fill', function(d) {return colors[d["Type 1"]]})
        // .filter(function(d) {return selected != d['Legendary'];})
        //       .attr("display", displayOthers)
        // .filter(function(d) {return selected == d['Legendary'];})
        //       .attr("display", display)
        // add tooltip functionality to points
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html(numberWithCommas(d["Name"]+"<br/>"+ d["Type 1"]+"<br/>"+
          d["Type 2"]))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });

    var dropDownL = d3.select("#filterL").append("select")
        .attr("name", "Legendary");
    var dropDownG = d3.select("#filterG").append("select")
        .attr("name", "Generation");

    var optionsL = dropDownL.selectAll("option")
      .data(d3.map(data, function(d) {return d['Legendary'];}).keys())
      .enter()
      .append("option")
      .text(function(d) {return d;})
      .attr('value', function(d) {return d;});

    //dropDownL.on('change',filter())
    dropDownL.on("change", function() {
      var selected = this.value;
      var displayOthers = this.checked ? "inline" : "none";
      var display = this.checked ? "none" : "inline";
      filter()
    //   dots
    //       .filter(function(d) {return selected != d['Legendary'];})
    //       .attr("display", displayOthers);
          
    // dots
    //       .filter(function(d) {return selected == d['Legendary'];})
    //       .attr("display", display);
      });

          var optionsG = dropDownG.selectAll("option")
          .data(d3.map(data, function(d) {return d['Generation'];}).keys())
          .enter()
          .append("option")
          .text(function(d) {return d;})
          .attr('value', function(d) {return d;});
        dropDownG.on("change", filter())
        // dropDownG.on("change", function() {
        //     var selected = this.value;
        //     var displayOthers = this.checked ? "inline" : "none";
        //     var display = this.checked ? "none" : "inline";
    
    
        //   dots
        //         .filter(function(d) {return selected != d['Generation'];})
        //         .attr("display", displayOthers);
                
        // dots
        //         .filter(function(d) {return selected == d['Generation'];})
        //         .attr("display", display);
        //     });
    }
}
  


  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 20, limits.xMax + 20]) // give domain buffer room
      .range([50, (limits.xMax - limits.xMin)*4]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }


  
  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
