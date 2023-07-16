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

var svg = d3.select("svg").attr("width", 960).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

  //Add annotations
  var hightlight_labels = [ {
    data: { Month: "Jul-17", value: 7802.00, note:  "Tesla Model 3 Lauched" },
    dy: 10,
    dx: 10,
    subject: {
      text: 'A'
    }
  },{
    data: { Month: "Jun-22", value: 59151.00, note:  "Highest ever gas price"},
    dy: 10,
    dx: 10,
    subject: {
    text: 'B'
    }
  }].map(function (l) {
    
    l.note = Object.assign({}, l.note, { title: l.data.note});
    l.subject = { radius: 6 };

    return l;
  });
  const type = d3.annotationCustomType(
    d3.annotationCalloutCircle, 
    {"subject":{"radius": 10 }}
  )
  var timeFormat = d3.timeFormat("%b-%y");

  const makeAnnotations = d3.annotation()
  .annotations(hightlight_labels)
  .type(type)
  .accessors({ x: function x(a) {
      return _x(parseTime(a.Month));
    }, 
    y: function y(a) {
      return _y(a.value);
    }
  }).accessorsInverse({
    date: function date(d) {
      return timeFormat(_x.invert(d.x));
    },
    close: function close(d) {
      return _y.invert(d.y);
    }
  }).on('subjectover', function (annotation) {
    annotation.type.a.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", false);
  }).on('subjectout', function (annotation) {
    annotation.type.a.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", true);
  })
  ;

  const annotationsLegend = [{
    note: { label:  "Tesla Model 3 Lauched on 2017/07/17" },
    subject: { text: "A" }
  },
  {
    note: { label: "Historically highest gasoline price in 2022/6 " },
    subject: { text: "B" }
  },
  ].map(function(d, i){
    d.x = margin.left + i*300
    d.y = 425 
    d.subject.x = "right" 
    d.subject.y = "bottom" 
    d.subject.radius = 10
    return d
  })

  const makeLegendAnnotations = d3.annotation()
  .type(d3.annotationBadge)
  .annotations(annotationsLegend);

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

});

