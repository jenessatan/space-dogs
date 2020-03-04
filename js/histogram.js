class Histogram {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1200,
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

    vis.drawLegend();
  }

  drawLegend() {
    let vis = this;
    let legend = d3.select("#legend").append("g");
    let altLegend = legend.append("g").attr("class", "altitude-legend");
    let outcomeLegend = legend.append("g").attr("class", "outcome-legend");
    let altitudes = ["unknown", "100", "212", "451", "orbital"];
    let outcomes = ["safe", "part-safe", "died"];
    legend.attr("font-family", "Quicksand");

    vis.drawAltitudeLegend(altLegend, altitudes, vis);
    vis.drawOutcomeLegend(outcomeLegend, outcomes);
  }

  drawOutcomeLegend(outcomeLegend, outcomes) {
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

  drawAltitudeLegend(altLegend, altitudes, vis) {
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
  }

  update() {
    let vis = this;
    let yearExtent = d3.extent(vis.data, d => d.Date);

    let yearBins = d3.timeYears(
      d3.timeYear.offset(yearExtent[0], -1),
      d3.timeYear.offset(yearExtent[1]),
      1
    );

    let binByYear = d3
      .histogram()
      .value(d => d.Date)
      .thresholds(yearBins);

    vis.histData = binByYear(vis.data);
    vis.histData[0].x0 = new Date("Jan 01, 1951");
    vis.xScale.domain(d3.extent(yearBins));
    vis.render();
  }

  render() {
    let vis = this;

    vis.chart
      .append("g")
      .attr("transform", "translate(0," + vis.height + ")")
      .call(d3.axisBottom(vis.xScale).ticks(17));

    vis.binContainer = vis.chart.selectAll(".bin-container").data(vis.histData);
    vis.binContainerEnter = vis.binContainer
      .enter()
      .append("g")
      .attr("class", "bin-container");

    vis.binContainer
      .merge(vis.binContainerEnter)
      .attr("transform", function(d) {
        return "translate(" + vis.xScale(d.x0) + "," + (vis.height - 45) + ")";
      });

    vis.drawBackgroundCircles();

    vis.drawIcons();

    vis.drawOutlines();
  }

  drawOutlines() {
    let vis = this;
    let outlines = vis.binContainer
      .merge(vis.binContainerEnter)
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
      .attr("cy", d => -d.idx * 2 * d.radius + 23)
      .attr("r", d => d.radius)
      .attr("fill", "white")
      .attr("fill-opacity", "0")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .on("mouseover", vis.mouseover)
      .on("mouseout", vis.mouseout)
      .on("mousemove", vis.mousemove);
  }

  drawIcons() {
    let vis = this;
    let icons = vis.binContainer
      .merge(vis.binContainerEnter)
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
      .attr("width", "61px");
  }

  drawBackgroundCircles() {
    let vis = this;
    let circles = vis.binContainer
      .merge(vis.binContainerEnter)
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
      .attr("cy", d => -d.idx * 2 * d.radius + 23)
      .attr("r", d => d.radius)
      .attr("fill", d => {
        return vis.colour(d.data.Altitude);
      });
  }

  mouseover(d) {
    let circle = d3.select(this);
    circle.attr("stroke", "tomato").attr("stroke-width", 3);
    let tooltip = d3.select(".tooltip");
    tooltip
      .style("visibility", "visible")
      .html(
        `<p><span style='font-weight: bold; color: teal'>Onboard: </span>${d.data.Dogs}</p>
        <p><span style='font-weight: bold; color: teal'>Rocket: </span> ${d.data.Rocket}</p>
        <p><span style='font-weight: bold; color: teal'>Outcome: </span> ${d.data.Result}</p>`
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
    circle.attr("stroke", "black").attr("stroke-width", 2);
    let tooltip = d3.select(".tooltip");
    tooltip.style("visibility", "hidden");
  }
}
