var svg3 = d3.select(".slide3").append("g").attr("transform", "translate(360, 120)");

var slider = d3.select("#slider");
var color = d3.scaleOrdinal().range(["#FF7F50", "#6495ED"]);

// Define the scales
var xScale = d3.scaleBand().domain([0, 1]).range([50, 250]).padding(0.1);
var yScale = d3.scaleLinear().domain([0, 1000]).range([300, 0]);

svg3.append("foreignObject")
    .attr("x", -250)
    .attr("y", 0)
    .attr("width", 300)
    .attr("height", 200)
    .append("xhtml:div")
    .attr("id", "paragraph")
    .html("<b>Understanding your savings potential.</b><p>The values are an approximation of the electricity and gasoline rates. Customize the inputs to see what kind of benefits you might get when you switch from a gasoline-powered car to an electric vehicle (EV).</p>");

var save = svg3.append("foreignObject")
    .attr("x", 300)
    .attr("y", -50)
    .attr("width", 250)
    .attr("height", 200)
    .append("xhtml:div")
    .attr("id", "save")
    .html("<p>EV gets you this many more miles for the price you pay for a gallon of gas.</p>");

// horizontal line
svg3.append("line")
    .attr("x1", -200)
    .attr("y1", 300)
    .attr("x2", 500)
    .attr("y2", 300)
    .attr("stroke", "lightgrey")
    .attr("stroke-width", 2);

// text block for gas
svg3.append("text")
    .attr("x", -120)
    .attr("y", 230)
    .text("Gas")
    .attr("font-family", "sans-serif")
    .attr("font-size", "23px")
    .attr("fill", "black");

// Create the text box for gas
var gas = svg3.append("text")
    .attr("x", -120)
    .attr("y", 260)
    .text(Math.round(d3.select("#input1").property("value")) + " miles")
    .attr("font-family", "sans-serif")
    .attr("font-size", "25px");

// text block
svg3.append("text")
    .attr("x", 400)
    .attr("y", 230)
    .text("EV")
    .attr("font-family", "sans-serif")
    .attr("font-size", "23px")
    .attr("fill", "black");

// Create the text box for ev
var ev = svg3.append("text")
    .attr("x", 400)
    .attr("y", 260)
    .text(Math.round(d3.select("#input2").property("value")) + " miles")
    .attr("font-family", "sans-serif")
    .attr("font-size", "25px");

var bars = svg3.selectAll("rect").data([50, 180]).enter().append("rect")
    .attr("x", (d, i) => xScale(i))
    .attr("y", d => yScale(d))
    .attr("width", xScale.bandwidth())
    .attr("height", d => 300 - yScale(d))
    .style("fill-opacity", 1)
    .style("fill", function(d, i) {
        return color(i);
      })
    ;


// Function to update the bar chart
function update(n) {
    var inputs = d3.selectAll(".input-number").nodes().map(n => +n.value);
    var values = [0, 0]
    values[0] = inputs[1] / inputs[0];
    values[1] = (1/inputs[3]) * inputs[2];
    bars.data(values)
        .attr("y", d => yScale(d*24))
        .attr("height", d => 300 - yScale(d*24));
    gas.text(Math.round(values[0]) + " miles");
    ev.text(Math.round(values[1]) + " miles")
    save.html("<p>EV gets you this many more miles for the price you pay for a gallon of gas.</p><h1>" + (Math.round(values[1]) - Math.round(values[0])) + " Miles</h1>")
}

d3.selectAll(".input-number").on("input", update);

update();

