var formatNumber = d3.format("")
	
var margin = {top: 33, right: 10, bottom: 13, left: 200},
    width = 1260 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var y = d3.scaleBand()
    .rangeRound([height, 0])
    .padding(0.1)
    .align(0.1);

var x = d3.scaleLinear()
    .rangeRound([0, width]);
// get total attribute using below function
d3.csv("data/stacked_barchart.csv", function(d, i, columns) {
      for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
      d.total = t;
      return d;
    }, 
  function(error, data){
  	//console.log(data.slice(3, 5))
  	var keys = data.columns.slice(1);
  	//layers is to split data into different layers
  	var layers = d3.stack().keys(keys)(data);
  	//console.log(layers[0])
  	xStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d[1]; }); }),
    xGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d[1] - d[0]; }); });
    //console.log(xGroupMax)

    //data.sort(function(a, b) {return b.total - a.total; });

    

    y.domain(data.map(function(d) {
    	return d["Undergraduate Major"];
    }));
    x.domain([0, xStackMax]);

    var z = d3.scaleOrdinal()
        .range(["#fdd0a2", "#fdae6b", "#fd8d3c", "#e6550d"]);
    var keys = data.columns.slice(1);
    z.domain(keys);

	var color = d3.scaleLinear()
	    .domain([0, 3])
	    .range(["#fdd0a2", "#e6550d"]);

    var xAxis = d3.axisBottom()
	    .scale(x)
	    .tickSize(0)
	    .tickPadding(6);

	var yAxis = d3.axisLeft()
	    .scale(y)
	    .tickSize(2)
	    .tickPadding(6);

	var svg = d3.select("div#first").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  	.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	var layer = svg.selectAll(".layer")
	    .data(layers)
	  	.enter().append("g")
	    .attr("class", "layer")
	    .attr("id", function(d) { return d.index; })
	    .style("fill", function(d, i) { return color(i); });


	var rect = layer.selectAll("rect")
	    .data(function(d) { return d; })
	  	.enter().append("rect")
	    .attr("y", function(d, i) { 
	    	return y(d.data["Undergraduate Major"]);
	    })
	    .attr("x", 0)
	    .attr("height", y.bandwidth())
	    .attr("width", 0)
	    .on("mouseover", function() { tooltip.style("display", null); })
          .on("mouseout", function() { tooltip.style("display", "none"); })
          .on("mousemove", function(d) {
            console.log(d);
            var xPosition = d3.mouse(this)[0] + 15;
            var yPosition = d3.mouse(this)[1] - 15;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d[1]-d[0]);
          });

	rect.transition()
	    .delay(function(d, i) {return i * 10; })
	    .attr("x", function(d) { 
	    	return x(d[0]); 
	    })
	    .attr("width", function(d) { 
	    	return x(d[1]) - x(d[0]);
	     });

	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + (height) + ")")
	    .call(xAxis);

	svg.append("g")
	    .attr("class", "y axis")
	    .attr("transform", "translate(" + 0 + ",0)")
	    .style("font-size", "10px")
	    .call(yAxis);

	var legend = svg.append("g")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
			.attr("x", width - 19)
			.attr("width", 19)
			.attr("height", 19)
			.attr("fill", z);

		legend.append("text")
			.attr("x", width - 24)
			.attr("y", 9.5)
			.attr("dy", "0.32em")
			.text(function(d) { return d; });

	var tooltip = svg.append("g")
          .attr("class", "tooltip")
          .style("display", "none");
            
        tooltip.append("rect")
          .attr("width", 60)
          .attr("height", 20)
          .attr("fill", "#ccffff")
          .style("opacity", 0.9);

        tooltip.append("text")
          .attr("x", 30)
          .attr("dy", "1.2em")
          .style("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "bold");


	d3.selectAll("input").on("change", change);

	var timeout = setTimeout(function() {
	    d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
	    setTimeout(function() {
	        d3.select("input[value=\"percent\"]").property("checked", true).each(change);
	    }, 2000);
	}, 2000);

	function change() {
	    clearTimeout(timeout);

	    if (this.value === "grouped") transitionGrouped();
	    else if (this.value === "stacked") transitionStacked();
	}

	function transitionGrouped() {
	    x.domain([0, xGroupMax]);

	    rect.transition()
	        .duration(500)
	        .delay(function(d, i) { return i * 10; })
	        .attr("y", function(d, i, j) { 
	        	return y(d.data["Undergraduate Major"]) + y.bandwidth() / 4 * 
	        	parseInt(this.parentNode.id); 
	        })
	        .attr("height", y.bandwidth() / 4)
	    .transition()
	        .attr("x", function(d) { 
	        	return 0;
	         })
	        .attr("width", function(d) { return x(d[1]) - x(d[0]); });

	    xAxis.tickFormat(formatNumber)
	    svg.selectAll(".x.axis").transition()
	        .delay(500)
	        .duration(500)
	        .call(xAxis)
	}

	function transitionStacked() {
	    x.domain([0, xStackMax]);

	    rect.transition()
	        .duration(500)
	        .delay(function(d, i) { return i * 10; })
	        .attr("x", function(d) { return x(d[0]); })
	        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
	    .transition()
	        .attr("y", function(d, i) { return y(d.data["Undergraduate Major"]); })
	        .attr("height", y.bandwidth());

	    xAxis.tickFormat(formatNumber)
	    svg.selectAll(".x.axis").transition()
	        .delay(500)
	        .duration(500)
	        .call(xAxis)

	}

});