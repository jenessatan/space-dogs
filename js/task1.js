
// Initialize chart
let choroplethMap = new ChoroplethMap({ parentElement: '#map' });
let selectedYear = 1991;

// Load data
Promise.all([
  d3.json('data/canada_provinces.topo.json'),
  d3.csv('data/canada_historical_population.csv')
]).then(files => {
  let population = files[1];

  let allPopulation = [];
  // Change all values to numbers
  population.forEach(d => {
    const columns = Object.keys(d)
    for (const col of columns) {
      d[col] = +d[col];
      if(col != 'year') {
        allPopulation.push(d[col]);
      }
    }
  });

  choroplethMap.min = d3.min(allPopulation);
  choroplethMap.max = d3.max(allPopulation);

  choroplethMap.canada_geo = files[0];
  choroplethMap.population = population;
  choroplethMap.update();
});


// To-do: Listen to UI events
$("#year-slider").on("input", function() {
  selectedYear = $(this).val();
  let yrText = document.createTextNode(selectedYear);
  let elem = document.getElementById("year-selection");
  elem.replaceChild(yrText, elem.firstChild);
  choroplethMap.update();
});

let playBtn = document.getElementById('play-control');

let timer;
let isPlaying = false;

let controlAnimation = () => {
  let btn = document.getElementById('play-control');
  if(!isPlaying) {
    let pauseText = document.createTextNode('Pause');
    btn.replaceChild(pauseText, btn.firstChild);
    isPlaying = true;
    timer = setInterval(step, 300)
  } else {
    clearInterval(timer);
    let playText = document.createTextNode('Play');
    btn.replaceChild(playText, btn.firstChild);
    isPlaying = false;
  }
}

let step = () => {
  choroplethMap.update(selectedYear);
  selectedYear += 1;
  if (selectedYear > 2019) {
    isPlaying = false;
    selectedYear = 1991;
    clearInterval(timer);
    let btn = document.getElementById('play-control');
    let playText = document.createTextNode('Play');
    btn.replaceChild(playText, btn.firstChild);
  } else {
    let slider = document.getElementById('year-slider');
    slider.value = selectedYear;
    let yrText = document.createTextNode(selectedYear);
    let elem = document.getElementById("year-selection");
    elem.replaceChild(yrText, elem.firstChild);
  }
}
playBtn.addEventListener('click', controlAnimation);