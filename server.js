'use strict'

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;

let app = express();
app.use(cors());

app.get('/', (request, response) => {
    response.send('Welcome to Home Page!!');
});

app.get('/location', locationHandler);

app.get('/weather', weatherHandler);
app.get('/trails', trailHandler);

app.use('*', notFoundHandler);
app.use(errorHandler);

function locationHandler(request, response) {
    const city = request.query.city;
    superagent(
        `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`
    ).then((res) => {
        console.log(res);
        const geoData = res.body;
        const locationData = new Locations(city, geoData);
        response.status(200).json(locationData);
    }).catch((err) => errorHandler(err, request, respone));

}



function Locations(city, geoData) {
    this.search_query = city;
    this.formatted_qurey = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;

}


function weatherHandler(request, response) {
    superagent(
        `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${process.env.WEATHER_API_KEY}`
    ).then((weatherRes) => {
        console.log(weatherRes);
        const weatherSummary = weatherRes.body.data.map((weatherData) => {
            return new Weather(weatherData);
        });
        response.status(200).json(weatherSummary);
    })
        .catch((err) => errorHandler(err, request, response));

}
function Weather(weatherData) {

    this.forecast = weatherData.weather.description;
    this.time = new Date(weatherData.valid_date).toDateString();
}
function trailHandler(request, response) {
    superagent(

        // `https://www.hikingproject.com/data/get-trails?lat=40.0274&lon=-105.2519&maxDistance=10&key=200721689-7e619a9e9f5056b3876932f9a719a82f` 

        // `https://www.hikingproject.com/data/get-trails?lat=${request.query.latitude}&lon=${request.query.longitude}&maxDistance=10&key=${TRAIL_API_KEY}`
      
     
        // `https://www.hikingproject.com/data/get-trails?lat=${request.query.latitude}&lon=${request.query.longitude}&maxDistance=10&key=200721689-7e619a9e9f5056b3876932f9a719a82f`
    ).then((trailRes) => {
            console.log(trailRes);
            const trailSummary = trailRes.body.data.map((trailData) => {
                return new Trail(trailData);
            });
            response.status(200).json(trailSummary);
        })
    .catch((err) => errorHandler(err, request, response));
}

/*[
  {
    "name": "Rattlesnake Ledge",
    "location": "Riverbend, Washington",
    "length": "4.3",
    "stars": "4.4",
    "star_votes": "84",
    "summary": "An extremely popular out-and-back hike to the viewpoint on Rattlesnake Ledge.",
    "trail_url": "https://www.hikingproject.com/trail/7021679/rattlesnake-ledge",
    "conditions": "Dry: The trail is clearly marked and well maintained.",
    "condition_date": "2018-07-21",
    "condition_time": "0:00:00 "
  },
  {
    "name": "Mt. Si",
    "location": "Tanner, Washington",
    "length": "6.6",
    "stars": "4.4",
    "star_votes": "72",
    "summary": "A steep, well-maintained trail takes you atop Mt. Si with outrageous views of Puget Sound.",
    "trail_url": "https://www.hikingproject.com/trail/7001016/mt-si",
    "conditions": "Dry",
    "condition_date": "2018-07-22",
    "condition_time": "0:17:22 "
  },
  ...
]
```*/
function Trail(trailData) {

    this.name = trailData.name;
    this.location = trailData.location;
    this.length = trailData.length;
    this.stars = trailData.stars;
    this.star_votes = trailData.star_votes;
    this.summary = trailData.summary;
    this.trail_url = trailData.trail_url;
    this.conditions = trailData.conditions;
    this.condition_date = trailData.condition_date;
    this.condition_time = trailData.condition_time;
}

function notFoundHandler(request, response) {
    response.status(404).send('PAGE NOT FOUND');
}


function errorHandler(error, request, response) {
    response.status(500).send(error);
}

app.listen(PORT, () => console.log(`Server is Running well on PORT ${PORT}`));
