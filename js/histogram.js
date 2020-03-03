class Histogram {

    constructor(_config) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 800,
        containerHeight: _config.containerHeight || 400,
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
        
        vis.drawLegend();
      }

      drawLegend() {
          let vis = this;
        vis.chart.append("circle").attr("cx",200).attr("cy",130).attr("r", 6).style("fill", "steelblue").attr('transform', `translate(${vis.width - 160}, -100)`)
        vis.chart.append("circle").attr("cx",200).attr("cy",160).attr("r", 6).style("fill", "tomato").attr('transform', `translate(${vis.width - 160}, -110)`)
        vis.chart.append("text").attr("x", 220).attr("y", 130).text("male").style("font-size", "15px").attr("alignment-baseline","middle").attr('transform', `translate(${vis.width - 160}, -100)`)
        vis.chart.append("text").attr("x", 220).attr("y", 160).text("female").style("font-size", "15px").attr("alignment-baseline","middle").attr('transform', `translate(${vis.width - 160}, -110)`)
        vis.chart.append("circle").attr("cx",200).attr("cy",160).attr("r", 6).style("fill", "tomato").attr('transform', `translate(${vis.width - 160}, -110)`)
        vis.chart.append("text").attr("x", 220).attr("y", 130).text("male").style("font-size", "15px").attr("alignment-baseline","middle").attr('transform', `translate(${vis.width - 160}, -100)`) 
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

        let binContainer = vis.chart.selectAll('.bin-container')
            .data(vis.histData);
        let binContainerEnter = binContainer
            .enter().append('g')
            .attr('class', 'bin-container');

        binContainer.merge(binContainerEnter)
            .attr("transform", function(d) { return "translate(" + vis.xScale(d.x0) + "," + (vis.height - 45) + ")"; });
                            
            let circles = binContainer.merge(binContainerEnter)
            .selectAll('circle')
                .data(d => d.map((val, i) => {
                    return {
                        idx: i,
                        data: val,
                        radius: 22.5
                    }
                }));
        let circlesEnter = circles
                .enter().append('circle');
        
        circles.merge(circlesEnter)
                .attr('cx', 0)
                .attr('cy', d => -d.idx * 2 * d.radius + 26)
                .attr('r', d => d.radius)
                .attr('fill', d => vis.colour(d.data.Outcome))

        let icons = binContainer.merge(binContainerEnter)
            .selectAll('.icon')
                .data(d => d.map((val, i) => {
                    return {
                        idx: i, 
                        data: val
                    }
                }))
        let iconsEnter = icons
                .enter().append('image')
        icons.merge(iconsEnter)
                .attr('class', 'icon')
                .attr('xlink:href', d => {
                    if(d.data.Outcome == 'safe') return 'img/spaceship.svg'
                    else if (d.data.Outcome == 'part-safe') return 'img/spaceship-part-safe.svg'
                    else return 'img/spaceship-crash.svg'
                })
                .attr('x', -25)
                .attr('y', d => -d.idx * 45)
                .attr('height', "50px")
                .attr('width', '50px')
                .attr('fill', function (d){
                    d3.select(this).select('path')
                        .style('fill', d => vis.colour(d.data.Outcome))
                })
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