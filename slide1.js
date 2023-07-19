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
  var div = d3.select("body").append("div")
     .attr("class", "tooltip-donut")
     .style("opacity", 0);

  dataNest.forEach(function(d) {
      svg.append("path")
          .attr("class", "line")
          .style("stroke", function() { // Add dynamically
              return d.color = colors[d.key]; })
          .attr("d", salesline(d.values))
          .on("mouseover", function(d) {
            d3.select(this).style("stroke-width", "2px");
          })                  
          .on("mouseout", function(d) {
            d3.select(this).style("stroke-width", "1px");
          });
  });

const variableLabel = [
  {variable: "BEV", value: 91699, "note": "Battery EV"},
  {variable: "PHEV", value: 22212, "note": "Plug-in Hybrid EV"},
  {variable: "HEV", value: 95334, 'note': "Hybrid EV"}
];

// Line Mark Notation
  svg.append("g").selectAll("line")
  .data(variableLabel)
  .enter()
  .append("text")
  .attr("x", function(d) { return maxWidth })
  .attr("y", function(d) { return _y(d.value) })
  .attr("fill", function(d) {return colors[d.variable];})
  .text(function(d) { return d.note });


  // // coordinates
  // var focus = svg.append("g")
  //   .attr("class", "focus")
  //   .style("display", "none");

  // focus.append("circle")
  //   .attr("r", 4.5);

  // focus.append("text")
  //   .attr("x", 9)
  //   .attr("dy", ".35em");

  // svg.append("rect")
  //   .attr("class", "overlay")
  //   .attr("width", width)
  //   .attr("height", height)
  //   .on("mouseover", function() {
  //     focus.style("display", null);
  //   })
  //   .on("mouseout", function(d) {
  //     focus.style("display", "none");
  //   })
  //   .on("mousemove", mousemove);

  // function mousemove(d) {
  //   const bisectDate = d3.bisector(d => d.Month).left;
  //   var x0 = _x.invert(d3.mouse(this)[0]),
  //     y0 = _y.invert(d3.mouse(this)[1]),
  //     i = bisectDate(data, x0, 1),
  //     d0 = data[i - 1],
  //     d1 = data[i],
  //     d2 = data[i + 150],
  //     d3 = data[i + 300],
  //     d = (x0 - d0.Month)^2 + (y0 -d1.value)^2 > (d1.Month - x0) ^2 + (y0- d1.value)^2 ? d1 : d0
  //     d = (x0 - d.Month)^2 + (y0 -d.value)^2 > (d2.Month - x0) ^2 + (y0- d2.value)^2 ? d2 : d,
  //     d = (x0 - d.Month)^2 + (y0 -d.value)^2 > (d3.Month - x0) ^2 + (y0- d3.value)^2 ? d3 : d
  //     ;
  //   console.log(d0,d1,d)
  //   focus.attr("transform", "translate(" + _x(d.Month) + "," + _y(d.value) + ")");
  //   focus.select("text").text(d.value);
  // }

});

