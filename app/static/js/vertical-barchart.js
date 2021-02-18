var count = 0;

var colors = d3.scaleQuantize()
  .domain([0.0, 100.0])
  .range(["blue", "lightblue", "lightgreen", "green"]);

function get_info_on_var(variable) {
  var rel_meta = meta_data.find(function(d) {
    return d.Variable == variable;
  })

  var label = rel_meta['Label_1'];
  var definition = rel_meta['Definition'];

  return [label, definition]
}

function updateArea(selectObject) {
  selected_area = selectObject.value;
  updatePlot();
};

function updatePlot() {
  var fetch_url = "/d3_plot_data?area_name=" + selected_area;
  fetch(fetch_url)
    .then(function(response) { return response.json(); })
    .then((data) => {
      plot_data = data;
      if (count == 0) {
        removeOldChart();
        createNewChart();
        count = 1;
      } else {
        var map = d3.map(plot_data[0]);

        var u = d3.select("#chart_group").selectAll("rect")
          .data(map.entries())

        u
          .enter()
          .append("rect")
          .merge(u)
          .transition()
          .duration(1000)
            .attr("x", function(d) { return x(d.key) })
            .attr("y", function(d) { return y(d.value) })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.value) })
            .attr("fill", function(d) { return colors(d.value) })

          d3.select("#chart-title")
            .text("Rental statistics of " + selected_area)
      }
    });
}

function removeOldChart() {
  d3.select("#chart_group")
    .remove();
}

function createNewChart() {
  var chart_group = svgContainer.append("g")
    .attr("id", "chart_group")
    .attr("transform", "translate(" + 100 + "," + 50 + ")");

  chart_group.append("g")
    .attr("transform", "translate(" + 0 + "," + chart_height + ")")
    .call(d3.axisBottom(x));

  chart_group.selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start");

  chart_group.append("g")
    .call(d3.axisLeft(y));

  var map = d3.map(plot_data[0]);

  chart_group.selectAll(".bar")
      .data(map.entries())
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function (d) { return x(d.key)})
      .attr("y", function (d) { return y(d.value) })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return chart_height - y(d.value) })
      .attr("fill", function(d) { return colors(d.value) })
      .on("mouseover", function(d, i) {
          var x_var = d.key;
          var value = d.value;
          var info = get_info_on_var(x_var);
          var label = info[0]
          var definition = info[1];

          displayTooltip("<b>Variable: </b>" + label + "<br /><b>Percentage: </b>" +
              value + "%<br /><b>Explanation: </b>" + definition)

          //d3.select(this).attr("fill", "DarkOrange");
      })
      .on("mousemove", function(d, i) {
          var x_var = d.key;
          var value = d.value;
          var info = get_info_on_var(x_var);
          var label = info[0]
          var definition = info[1];

          displayTooltip("<b>Variable: </b>" + label + "<br /><b>Percentage: </b>" +
              value + "%<br /><b>Explanation: </b>" + definition)

          //d3.select(this).attr("fill", "DarkOrange");
      })
      .on("mouseout", function(d) {
          hideTooltip();
          //d3.select(this).attr("fill", "steelblue");
      });

      // svgContainer.append("text")
      //   .attr("transform", "translate(" + (width/2 - (100/2)) + " ," + (chart_height + 100) + ")")
      //   .style("text-anchor", "middle")
      //   .style("font-size", "13px")
      //   .text("Percentage");

      chart_group.append("text")
        .attr("class", "title")
        .attr("id", "chart-title")
        .attr("y", -25)
        .attr("x", chart_width / 2)
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .text("Rental statistics of " + selected_area);
};
