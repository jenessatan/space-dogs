class Histogram {

    constructor(_config) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 1000,
        containerHeight: _config.containerHeight || 600,
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
            .attr('transform', `translate(${vis.config.margin.left}, -200)`);
        
        // initialize x axis
        vis.xScale = d3.scaleTime()
            .range([0, vis.width]);
        
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.colour = d3.scaleOrdinal()
            .domain(['safe','part-safe', 'died'])
            .range(['#34344A','#80475E' ,'#CC5A71'])
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
        console.log("render")
        let vis = this;

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
                        radius: 15
                    }
                }))
                .enter().append('circle')
                .attr('cx', 0)
                .attr('cy', d => -d.idx * 2 * d.radius - d.radius)
                .attr('r', d => d.radius)
                .attr('fill', d => vis.colour(d.data.Result))
      }
}