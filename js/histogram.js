class Histogram {

    constructor(_config) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 800,
        containerHeight: _config.containerHeight || 300,
      }
      this.config.margin = _config.margin || { top: 10, bottom: 25, right: 10, left: 30 }      
      this.initVis();
    }

    initVis() {
        let vis = this;
        
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom; 
    
        vis.svg = d3.select(vis.config.parentElement);
    
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);
        
        // initialize x axis
        vis.xScale = d3.scaleTime()
            .range([0, vis.width]);
        
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.colour = d3.scaleOrdinal()
            .domain(['safe','part-safe', 'died'])
            .range(['#34344A','#80475E' ,'#CC5A71']);

        vis.tooltip = d3.select('#container').append('div')
            .attr('class', 'tooltip')
            .style('visibility', 'hidden')
            .style("position", "absolute")
      }

      update() {
          let vis = this;
          console.log("update");
          console.log(vis.data);
          let yearExtent = d3.extent(vis.data, d => d.Date);
          
          let yearBins = d3.timeYears(d3.timeYear.offset(yearExtent[0], -1), d3.timeYear.offset(yearExtent[1]), 1);
          console.log(yearBins);
          let binByYear = d3.histogram()
            .value(d => d.Date)
            .thresholds(yearBins);
        
         vis.histData = binByYear(vis.data);
         vis.histData[0].x0 = new Date("Jan 01, 1951");
         console.log(vis.histData);
         vis.xScale.domain(d3.extent(yearBins));
        //  vis.yScale.domain([0, d3.max(vis.histData, d => d.length)]);
        //  console.log(vis.yScale.domain());
         vis.render();
      }

      render() {
          let vis = this;
          console.log(vis.tooltip);

        // vis.chart.append('g')
        //     .call(d3.axisLeft(vis.yScale));
        
        vis.chart.append('g')
            .attr("transform", "translate(0," + vis.height + ")")
            .call(d3.axisBottom(vis.xScale).ticks(17))

        vis.chart.selectAll('.bin-container')
            .data(vis.histData)
            .enter().append('g')
            .attr('class', 'bin-container')
            .attr("transform", function(d) { return "translate(" + vis.xScale(d.x0) + "," + vis.height + ")"; })
            .selectAll('circle')
                .data(d => d.map((val, i) => {
                    return {
                        idx: i,
                        data: val,
                        radius: 12
                    }
                }))
                .enter().append('circle')
                .attr('cx', 0)
                .attr('cy', d => -d.idx * 2 * d.radius - d.radius)
                .attr('r', d => d.radius)
                .attr('fill', d => vis.colour(d.data.Outcome))
                .on('mouseover', vis.mouseover)
                .on('mouseout', vis.mouseout)
                .on('mousemove', vis.mousemove)
      }

      mouseover(d) {
          let circle = d3.select(this);
          circle.attr('stroke', 'teal')
            .attr('stroke-width', 3);
          let tooltip = d3.select('.tooltip');
          tooltip
            .style('visibility', 'visible')
            .html(`<p><span style='font-weight: bold; color: teal'>Onboard: </span>${d.data.Dogs}</p><p><span style='font-weight: bold; color: teal'>Outcome: </span> ${d.data.Result}</p>`)
      }

      mousemove(d) {
          let tooltip = d3.select('.tooltip');
          tooltip
            .style("top", (d3.event.pageY-15)+"px")
            .style("left",(d3.event.pageX+5)+"px")
      }

      mouseout(d) {
          let circle = d3.select(this);
          circle.attr('stroke', 'none');
          let tooltip = d3.select('.tooltip');
          tooltip.style('visibility', 'hidden');
      }
}