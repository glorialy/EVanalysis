"use strict";

// line chart code: https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0
// time series from: http://bl.ocks.org/mbostock/3883245
// set the dimensions and margins of the graph
var margin = { top: 50, right: 50, bottom: 50, left: 80 },
    height = 500 - margin.top - margin.bottom;
var maxWidth = 860 - margin.left - margin.right;
var width = 860 - margin.left - margin.right;

var parseTime = d3.timeParse("%b-%y");
var _x = d3.scaleTime().range([0, width]);
var _y = d3.scaleLinear().range([height, 0]);
var salesline = d3.line()	
    .x(function(d) { return _x(d.Month); })
    .y(function(d) { return _y(d.value); });

var svg = d3.select(".slide1").attr("width", 960).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("ev_sales.csv", function (error, data) {
  if (error) throw error;
  data.forEach(function(d) {
		d.Month = parseTime(d.Month);
		d.value = +parseFloat(d.value);
    });
  _x.domain(d3.extent(data, function(d) { return d.Month; }));
  _y.domain([0, d3.max(data, function(d) { return d.value; })]);

  svg.append("g").attr("class", "x-axis").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(_x));
  svg.append("g").call(d3.axisLeft(_y));
  
  // Nest the entries by symbol
  var dataNest = d3.nest()
      .key(function(d) {return d.variable;})
      .entries(data);

const colors = {
        "BEV": "#00BCD4",
        "HEV": "#ffc107",
        "PHEV": "#0097a7",
        "Total LDV": "#D32F2F"
      };

  // Loop through each symbol / key
  dataNest.forEach(function(d) {
      svg.append("path")
          .attr("class", "line")
          .style("stroke", function() { // Add dynamically
              return d.color = colors[d.key]; })
          .attr("d", salesline(d.values));
  });

  svg.append("g").attr("class", "annotation-group").call(makeAnnotations);
  svg.append("g")
        .attr("class", "annotation-legend")
        .call(makeLegendAnnotations)
  svg.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", true);
  
  d3.select("svg g.annotation-legend")
  .selectAll('text.legend')
  .data(annotationsLegend)
  .enter()
  .append('text')
  .attr('class', 'legend')
  .text(function(d){ return d.note.label })
  .attr('x', function(d, i){ return margin.left + 30 + i*300 })
  .attr('y', 440)

const variableLabel = [
  {variable: "BEV", value: 91699, "note": "Battery EV"},
  {variable: "PHEV", value: 22212, "note": "Plug-in Hybrid EV"},
  {variable: "HEV", value: 95334, 'note': "Hybrid EV"}
];
   
svg.append("g").selectAll("line")
  .data(variableLabel)
  .enter()
  .append("text")
  .attr("x", function(d) { return maxWidth })
  .attr("y", function(d) { return _y(d.value) })
  .attr("fill", function(d) {return colors[d.variable];})
  .text(function(d) { return d.note });


const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

const circle = svg.append("circle")
    .attr("r", 0)
    .attr("fill", "steelblue")
    .style("stroke", "white")
    .attr("opacity", .70)
    .style("pointer-events", "none");
  // create a listening rectangle

  const listeningRect = svg.append("rect")
    .attr("width", width)
    .attr("height", height);

  // create the mouse move function

  listeningRect.on("mousemove", function (event) {
    const [xCoord] = d3.mouse(this);
    const bisectDate = d3.bisector(d => d.Month).left;
    const x0 = gas_x.invert(xCoord);
    const i = bisectDate(data, x0, 1);
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = x0 - d0.Month > d1.Month - x0 ? d1 : d0;
    const xPos = _x(d.Month);
    const yPos = _y(d.price);


    // Update the circle position

    circle.attr("cx", xPos)
      .attr("cy", yPos);

    // Add transition for the circle radius

    circle.transition()
      .duration(50)
      .attr("r", 5);

    // add in  our tooltip

    tooltip
      .style("display", "block")
      .style("left", `${xPos + 100}px`)
      .style("top", `${yPos + 50}px`)
      .html(`<strong>Month:</strong> ${d.Month.toLocaleDateString()}<br><strong>Gas Price:</strong> ${d.value}` )
  });
});

