// To-do: task 2
let histogram = new Histogram({ parentElement: '#flights' });

// Promise.all([
//     d3.csv('data/Flights-Database.csv'),
//     d3.csv('data/Dogs-Database.csv')
// ]).then(files => {
//     let flights = files[0];
//     let dogs = files[1];
// })

d3.csv('data/Flights-Database.csv').then(data => {
    // console.log(data);
    let parser = d3.timeParse("%Y-%m-%d");
    data.forEach(d => {
        d.Date = parser(d.Date);
        d.Outcome = processResult(d.Result);
        d.Altitude = processAltitude(d['Altitude (km)']);
    })

    console.log(data);

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

let processAltitude = (str) => {
    if(str == 'was to be orbital') return 'unknown'
    else return str
}