// To-do: task 2
let histogram = new Histogram({ parentElement: '#flights' });

Promise.all([
    d3.csv('data/Flights-Database.csv'),
    d3.csv('data/Dogs-Database.csv')
]).then(files => {
    let flightsRaw = files[0];
    let dogsRaw = files[1];

    let parser = d3.timeParse("%Y-%m-%d");

    let dogs = {};
    dogsRaw.forEach(d => {
        dogs[d["Name (Latin)"]] = {
            name: d["Name (Latin)"],
            gender: d["Gender"]
        }
    });

    let flights = flightsRaw.map(f => {
        let dogsOnFlight = f["Dogs"].split(",");
        let dogsResult = dogsOnFlight.map(str => dogs[str]);
        return {
            date: parser(f.Date),
            outcome: processResult(f.Result),
            altitude: processAltitude(f['Altitude (km)']),
            result: f.Result,
            rocket: f.Rocket,
            dogsArr: dogsResult,
            dogs: f.Dogs
        };
    })
    histogram.data = flights;
    console.log(flights);
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