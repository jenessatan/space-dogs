class Histogram {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1500,
      containerHeight: _config.containerHeight || 400
    };
    this.config.margin = _config.margin || {
      top: 10,
      bottom: 25,
      right: 10,
      left: 30
    };
    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    vis.svg = d3.select(vis.config.parentElement);

    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left}, ${vis.config.margin.top})`
      );

    // initialize x axis
    vis.xScale = d3.scaleTime().range([0, vis.width]);

    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    vis.colour = d3
      .scaleOrdinal()
      .domain(["unknown", "100", "212", "451", "orbital"])
      .range(d3.schemePuBu[7]);

    vis.tooltip = d3
      .select("#container")
      .append("div")
      .attr("class", "tooltip")
      .style("visibility", "hidden")
      .style("position", "absolute");

    // vis.maleDog = `M190.498,241.04c0.239-2.159,0.447-4.32,0.696-6.482c0.272-2.383,0.547-4.772,0.227-7.165
    //         c-0.112-0.824-0.41-1.666-0.802-2.4c-0.6-1.143-1.341-2.205-2.036-3.289c-0.193-0.294-0.445-0.308-0.79-0.138
    //         c-2.474,1.187-5.087,1.905-7.814,2.17c-1.434,0.136-2.803-0.146-4.087-0.845c-1.556-0.843-3.018-1.791-4.072-3.255
    //         c-0.555-0.768-0.443-1.134,0.393-1.553c0.409-0.201,0.782-0.476,1.183-0.694c1.637-0.899,3.259-1.831,4.927-2.671
    //         c0.839-0.421,1.445-0.972,1.781-1.851c0.444-1.163,0.914-2.302,2.012-3.063c1.387-0.968,2.824-1.849,4.394-2.469
    //         c0.814-0.319,1.145-0.932,1.125-1.643c-0.042-1.386-0.215-2.771-0.405-4.148c-0.052-0.375-0.362-0.71-0.54-1.072
    //         c-0.07-0.144-0.094-0.308-0.134-0.464c0.141-0.039,0.294-0.136,0.415-0.104c0.456,0.122,0.971,0.185,1.333,0.449
    //         c2.525,1.84,4.52,4.175,6.058,6.879c0.491,0.864,1.211,1.449,1.947,1.982c1.849,1.343,3.157,3.136,4.406,4.987
    //         c1.552,2.314,3.078,4.649,4.569,7.008c0.4,0.642,0.651,1.379,0.932,2.092c0.441,1.108,0.295,2.187-0.205,3.248
    //         c-0.961,2.049-2.58,3.482-4.363,4.778c-1.523,1.104-3.02,2.257-4.52,3.396c-0.239,0.187-0.444,0.432-0.615,0.676
    //         c-1.502,2.194-2.973,4.401-4.471,6.597c-0.21,0.307-0.422,0.615-0.688,0.883c-0.104,0.11-0.354,0.204-0.479,0.152
    //         c-0.131-0.045-0.239-0.283-0.239-0.448c-0.034-0.508-0.016-1.02-0.016-1.529C190.581,241.047,190.538,241.042,190.498,241.04z`;
    
    // vis.femaleDog = `M187.453,241.041c-0.229-2.16-0.447-4.323-0.693-6.483c-0.272-2.383-0.547-4.772-0.222-7.165
    //         c0.111-0.824,0.411-1.662,0.799-2.399c0.598-1.139,1.338-2.203,2.036-3.287c0.191-0.298,0.444-0.308,0.788-0.145
    //         c2.477,1.188,5.09,1.911,7.819,2.172c1.432,0.137,2.803-0.144,4.085-0.843c1.558-0.842,3.018-1.792,4.072-3.253
    //         c0.556-0.768,0.443-1.137-0.396-1.553c-0.408-0.203-0.78-0.477-1.181-0.696c-1.638-0.9-3.261-1.831-4.929-2.67
    //         c-0.838-0.423-1.444-0.973-1.783-1.854c-0.442-1.162-0.91-2.3-2.007-3.062c-1.389-0.967-2.826-1.849-4.396-2.468
    //         c-0.81-0.32-1.143-0.932-1.12-1.643c0.038-1.385,0.209-2.772,0.4-4.148c0.049-0.375,0.364-0.71,0.54-1.072
    //         c0.07-0.143,0.091-0.308,0.136-0.464c-0.141-0.039-0.295-0.136-0.42-0.104c-0.451,0.121-0.965,0.185-1.329,0.448
    //         c-2.524,1.841-4.522,4.176-6.06,6.88c-0.49,0.863-1.209,1.45-1.944,1.981c-1.853,1.342-3.159,3.135-4.404,4.987
    //         c-1.556,2.314-3.081,4.651-4.57,7.009c-0.403,0.639-0.651,1.38-0.932,2.091c-0.441,1.108-0.296,2.185,0.206,3.252
    //         c0.961,2.047,2.576,3.479,4.358,4.773c1.526,1.107,3.026,2.256,4.525,3.399c0.239,0.184,0.445,0.429,0.615,0.677
    //         c1.493,2.194,2.974,4.398,4.465,6.593c0.208,0.309,0.428,0.616,0.685,0.886c0.11,0.111,0.359,0.203,0.49,0.152
    //         c0.123-0.047,0.229-0.286,0.24-0.449c0.029-0.508,0.01-1.02,0.01-1.529C187.375,241.048,187.416,241.044,187.453,241.041z`;

    vis.drawLegend();
  }

  drawLegend() {
    let vis = this;
    let legend = d3.select("#legend").append("g");
    let altLegend = legend.append("g").attr('class', 'altitude-legend');
    let outcomeLegend = legend.append("g").attr('class', 'outcome-legend');
    let altitudes = ["unknown", "100", "212", "451", "orbital"];
    let outcomes = ["safe", "part-safe", "died"];

    altLegend
      .selectAll("alt")
      .data(altitudes)
      .enter()
      .append("circle")
      .attr("cx", 100)
      .attr("cy", (d, i) => 70 + i * 40) 
      .attr("r", 10)
      .style("fill", d => vis.colour(d))
      .style("stroke", "black");

    altLegend
      .selectAll("altlabels")
      .data(altitudes)
      .enter()
      .append("text")
      .attr("x", 120)
      .attr("y", (d, i) => 70 + i * 40)
      .style("fill", "black")
      .text(d => {
        if (d == "unknown" || d == "orbital") return d;
        else return d + " km";
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");
    
    altLegend
      .append("text")
      .attr("x", 90)
      .attr("y", 30)
      .text("Altitude")
      .style("font-size", "25px")
      .style("font-weight", "bold")
      .attr("alignment-baseline", "middle");

    outcomeLegend
      .selectAll("icons")
      .data(outcomes)
      .enter()
      .append("image")
      .attr("xlink:href", d => {
        if (d == "safe") return "img/spaceship.svg";
        else if (d == "part-safe") return "img/spaceship-part-safe.svg";
        else return "img/spaceship-crash.svg";
      })
      .attr("x", 500)
      .attr("y", (d, i) => 40 + i * 60)
      .attr("height", "60px")
      .attr("width", "60px");
    
    outcomeLegend
      .selectAll("iconLabel")
      .data(outcomes)
      .enter()
      .append("text")
      .attr("x", 560)
      .attr("y", (d, i) => 70 + i * 60)
      .text(d => {
        if (d == "safe") return "recovered safely";
        else if (d == "part-safe") return "recovered but with fatality";
        else return "failed with fatality";
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");

    outcomeLegend
      .append("text")
      .attr("x", 500)
      .attr("y", 30)
      .text("Mission Outcome")
      .style("font-size", "25px")
      .style("font-weight", "bold")
      .attr("alignment-baseline", "middle");
  }

  update() {
    let vis = this;
    let yearExtent = d3.extent(vis.data, d => d.Date);

    let yearBins = d3.timeYears(
      d3.timeYear.offset(yearExtent[0], -1),
      d3.timeYear.offset(yearExtent[1]),
      1
    );
    //   console.log(yearBins);
    let binByYear = d3
      .histogram()
      .value(d => d.Date)
      .thresholds(yearBins);

    vis.histData = binByYear(vis.data);
    vis.histData[0].x0 = new Date("Jan 01, 1951");
    //  console.log(vis.histData);
    vis.xScale.domain(d3.extent(yearBins));
    vis.render();
  }

  render() {
    let vis = this;

    vis.chart
      .append("g")
      .attr("transform", "translate(0," + vis.height + ")")
      .call(d3.axisBottom(vis.xScale).ticks(17));

    let binContainer = vis.chart.selectAll(".bin-container").data(vis.histData);
    let binContainerEnter = binContainer
      .enter()
      .append("g")
      .attr("class", "bin-container");

    binContainer.merge(binContainerEnter).attr("transform", function(d) {
      return "translate(" + vis.xScale(d.x0) + "," + (vis.height - 45) + ")";
    });

    let circles = binContainer
      .merge(binContainerEnter)
      .selectAll("circle")
      .data(d =>
        d.map((val, i) => {
          return {
            idx: i,
            data: val,
            radius: 22.5
          };
        })
      );
    let circlesEnter = circles.enter().append("circle");

    circles
      .merge(circlesEnter)
      .attr("cx", 0)
      .attr("cy", d => (-d.idx * 2 * d.radius) + 23)
      .attr("r", d => d.radius)
      .attr("fill", d => {
        return vis.colour(d.data.Altitude);
      })

    let icons = binContainer
      .merge(binContainerEnter)
      .selectAll(".icon")
      .data(d =>
        d.map((val, i) => {
          return {
            idx: i,
            data: val
          };
        })
      );
    let iconsEnter = icons.enter().append("image");
    icons
      .merge(iconsEnter)
      .attr("class", "icon")
      .attr("xlink:href", d => {
        if (d.data.Outcome == "safe") return "img/spaceship.svg";
        else if (d.data.Outcome == "part-safe")
          return "img/spaceship-part-safe.svg";
        else return "img/spaceship-crash.svg";
      })
      .attr("x", -30)
      .attr("y", d => -d.idx * 45 - 8)
      .attr("height", "61px")
      .attr("width", "61px")
    
    let outlines = binContainer
      .merge(binContainerEnter)
      .selectAll(".outlines")
      .data(d =>
        d.map((val, i) => {
          return {
            idx: i,
            data: val,
            radius: 22.5
          };
        })
      );
    let outlinesEnter = outlines.enter().append("circle");

    outlines
      .merge(outlinesEnter)
      .attr("class", "outlines")
      .attr("cx", 0)
      .attr("cy", d => (-d.idx * 2 * d.radius) + 23)
      .attr("r", d => d.radius)
      .attr("fill", "white")
      .attr("fill-opacity", "0")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .on("mouseover", vis.mouseover)
      .on("mouseout", vis.mouseout)
      .on("mousemove", vis.mousemove);
  }

  mouseover(d) {
    let circle = d3.select(this);
    circle.attr("stroke", "tomato").attr("stroke-width", 3);
    let tooltip = d3.select(".tooltip");
    tooltip
      .style("visibility", "visible")
      .html(
        `<p><span style='font-weight: bold; color: teal'>Onboard: </span>${d.data.Dogs}</p><p><span style='font-weight: bold; color: teal'>Outcome: </span> ${d.data.Result}</p>`
      );
  }

  mousemove(d) {
    let tooltip = d3.select(".tooltip");
    tooltip
      .style("top", d3.event.pageY - 15 + "px")
      .style("left", d3.event.pageX + 5 + "px");
  }

  mouseout(d) {
    let circle = d3.select(this);
    circle.attr("stroke", "black").attr('stroke-width', 2);
    let tooltip = d3.select(".tooltip");
    tooltip.style("visibility", "hidden");
  }
}
