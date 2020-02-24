class ChoroplethMap {

  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 600,
    }
    
    this.initVis();
  }
  
  initVis() {
    let vis = this;

    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg.append('g')
        .attr('transform', 'translate(20,400), scale(0.8,0.8)');

    // We initialize a geographic path generator, that is similar to shape generators that you have used before (e.g. d3.line())
    // We define a projection: https://github.com/d3/d3-geo/blob/v1.11.9/README.md#geoAlbers
    vis.path = d3.geoPath().projection(d3.geoAlbers());
  }

  update() {
    let vis = this;

    // To-do: Add color scale
    vis.colourScale = d3.scaleQuantile()
      .domain([vis.min, vis.max])
      .range(d3.schemeBlues[9]);

    vis.colourValue = d => vis.yearPopulation[d.id];

    // To-do: Select data for specific year (could be done in task1.js too)
    vis.yearPopulation = vis.population.filter(d => d.year == selectedYear)[0];

    vis.render();
  }

  render() {
    let vis = this;

    // 
    let geoPath = vis.chart.selectAll('.geo-path')
        .data(topojson.feature(vis.canada_geo, vis.canada_geo.objects.provinces).features);
  
    let geoPathEnter = geoPath.enter().append('path')
        .attr('class', 'geo-path')
        .attr("d", vis.path);

    geoPath.merge(geoPathEnter)
      .transition()
        .attr('fill', d => {
          // To-do: Change fill to color code each province by its population
          console.log(d.id + " " + vis.yearPopulation[d.id]);

          return vis.colourScale(vis.colourValue(d));
        })
        .append('title')
          .text(d => d.id)

    // To-do: Add labels for each province with the population value
  }
}