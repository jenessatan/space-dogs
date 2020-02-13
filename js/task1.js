
// Initialize chart
let choroplethMap = new ChoroplethMap({ parentElement: '#map' });

// Load data
Promise.all([
  d3.json('data/canada_provinces.topo.json'),
  d3.csv('data/canada_historical_population.csv')
]).then(files => {
  let population = files[1];

  // Change all values to numbers
  population.forEach(d => {
    const columns = Object.keys(d)
    for (const col of columns) {
      d[col] = +d[col];
    }
  });

  choroplethMap.canada_geo = files[0];
  choroplethMap.population = population;
  choroplethMap.update();
});


// To-do: Listen to UI events