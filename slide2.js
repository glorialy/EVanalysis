var parseMonth = d3.timeParse("%b %Y");
var gas_x = d3.scaleTime().range([0, width]);
var gas_y = d3.scaleLinear().range([height, 0]);
var line = d3.line()	
    .x(function(d) { return gas_x(d.Month); })
    .y(function(d) { return gas_y(d.price); });

var svg2 = d3.select(".slide2").append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("gasoline_prices.csv", function (error, data) {
  if (error) throw error;
  data.forEach(function(d) {
		d.Month = parseMonth(d.Month);
		d.price = +parseFloat(d.price);
    });
  gas_x.domain(d3.extent(data, function(d) { return d.Month; }));
  gas_y.domain([0, d3.max(data, function(d) { return d.price; })]);

  svg2.append("g").attr("class", "x-axis").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(gas_x));
  svg2.append("g").call(d3.axisLeft(gas_y));
  
  svg2.append("path").datum(data) 
      .attr("class", "line")
      .style("stroke", "#259DCD")
      .attr("d", line);

  const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip");

  const circle = svg2.append("circle")
      .attr("r", 0)
      .attr("fill", "steelblue")
      .style("stroke", "white")
      .attr("opacity", .70)
      .style("pointer-events", "none");
    // create a listening rectangle
  
    const listeningRect = svg2.append("rect")
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
      const xPos = gas_x(d.Month);
      const yPos = gas_y(d.price);
  
  
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
        .html(`<strong>Month:</strong> ${d.Month.toLocaleDateString()}<br><strong>Gas Price:</strong> ${d.price}` )
    });
    // listening rectangle mouse leave function
  
    listeningRect.on("mouseleave", function () {
      circle.transition()
        .duration(50)
        .attr("r", 0);
  
      tooltip.style("display", "none");
    });
  
    const labels = [
      {
        data: {Month: "Dec 1997",	price: 1.177},
        dy: 37,
        dx: -62,
        subject: { text: 'Prius', y:"bottom" },
        id: "minimize-badge",
        note: "Toyota Prius: \nFirst Massive Productive Hybrid EV"
      },
      {
        data: {Month: "Dec 2010",	price: 2.853},
        dy: -100,
        dx: 5,
        note: { align: "middle"},
        subject: { text: 'Volt', y:"bottom" },
        id: "minimize-badge",
        note: "Chevy Volt: First Plug-in Hybrid EV"
      },{
        data: {Month: "Dec 2010",	price: 2.853},
        dy: 75,
        dx: 40,
        note: { align: "middle"},
        subject: { text: 'Leaf', y:"bottom" },
        id: "minimize-badge",
        note: "Nissan Leaf: First mass-produced battery EV"
      },{
        data: {Month: "Jul 2017",	price: 2.414},
        dy: -70,
        dx: 30,
        note: { align: "middle"},
        subject: { text: 'Model3', y:"bottom" },
        id: "minimize-badge",
        note: "Tesla Model 3:\n Best selling Battery EV released"
      },
    ].map(l => {
      l.note = Object.assign({}, l.note, {title: `${l.note}`})
      return l
    })
    window.makeAnnotations = d3.annotation()
    .annotations(labels)
    .type(d3.annotationCalloutCircle)
    .accessors({ x: d => gas_x(parseMonth(d.Month)), 
      y: d => gas_y(d.price)
    })
    .accessorsInverse({
      date: d => timeFormat(gas_x.invert(d.x)),
      close: d => gas_y.invert(d.y) 
    })
    svg2.append("g")
        .attr("class", "annotation-test")
        .call(makeAnnotations)
});

