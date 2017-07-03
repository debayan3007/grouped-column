function jsonCrunch (json) {
  var data = [],
    keys = Object.keys(json),
    series = Object.keys(json[keys[0]]);
  for (var i = 0; i < series.length; i++) {
    data[i] = {};
    data[i].name = series[i];
    for (var j = 0; j < keys.length; j++) {
      data[i][keys[j]] = json[keys[j]][series[i]];
    }
  }
  return data;
}

var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 100, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x0 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

var x1 = d3.scaleBand()
    .padding(0.05);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888"]);

d3.json("data.json", function(error, json) {
  if (error) return coonsole.warn(error);

  var data = jsonCrunch(json);

  var series = data.map((elem) => {
    return elem.name;
  });
  var keys = Object.keys(data[0]).filter((elem) => {
    return elem !== 'name';
  });


  // defining the scales
  x0.domain(series);
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);
  y.domain([0, d3.max(data, function (elem) {
    return d3.max(keys, function (key) {
      if (typeof elem[key] === 'string') {
        return Number((elem[key]).replace('$', ''));
      } else {
        return elem[key];
      }
    });
  })]).nice();

  // drawing the columns
  g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
      .attr("transform", function(d, i) {  return "translate(" + x0(d.name) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
      .attr("x", function(d) { return x1(d.key); })
      .attr("y", function(d) {
        var value = d.value;
        if (typeof d.value === 'string') {
          value = Number(value.replace('$', ''));
        }
        return y(value);
      })
      .attr("width", x1.bandwidth())
      .attr("height", function(d) {
        var value = d.value;
        if (typeof d.value === 'string') {
          value = Number(value.replace('$', ''));
        }
        return height - y(value);
      })
      .attr("fill", function(d) { return z(d.key); });


  // drawing x-axis
  g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x0));

  // drawing x-axis
  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y));

  // drawing legend
  var legend = g.append("g")
    .attr("font-size", 10)
    // .attr("text-anchor", "end")
  .selectAll("g")
  .data(keys.slice())
  .enter().append("g")
    .attr("transform", function(d, i) { return "translate(" + i * 100 + ", 0)"; });


  legend.append("rect")
    .attr("y", height + 40)
    .attr("x", (width / 2 - (keys.length * 100 / 2)))
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", z);

  legend.append("text")
    .attr("x", 20 + (width / 2 - (keys.length * 100 / 2)))
    .attr("y", height + 50)
    .attr("dy", "0.32em")
    .text(function(d) { return d; });

});