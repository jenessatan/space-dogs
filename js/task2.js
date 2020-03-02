// To-do: task 2
let histogram = new Histogram({ parentElement: '#flights' });

d3.csv('data/Flights-Database.csv').then(data => {
    // console.log(data);
    let parser = d3.timeParse("%Y-%m-%d");
    data.forEach(d => {
        d.Date = parser(d.Date);
        d.Result = processResult(d.Result);
    })
    let altitudes = d3.nest()
        .key(d => d["Altitude (km)"])
        .entries(data);

     console.log(altitudes);

    histogram.data = data;
    histogram.update();
})

let processResult = (str) => {
    if(str.includes('recovered safely') && str.includes('died')) {
        return 'part-safe'
    } else if (str.includes('recovered safely')) {
        return 'safe'
    } else {
        return 'died'
    }
}