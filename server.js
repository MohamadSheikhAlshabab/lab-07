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

app.get('/weather', weatherHandler)

app.use('*', notFoundHandler);
app.use(errorHandler);

function locationHandler(request, response) {
    const city = request.query.city;
    superagent(
        `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`
    ).then((res) => {
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

    this.forecast = weatherData.data[0].weather.description;
    this.time = new Date(weatherData.data[0].valid_date).toDateString();
}

function notFoundHandler(request, response) {
    response.status(404).send('PAGE NOT FOUND');
}


function errorHandler(error, request, response) {
    response.status(500).send(error);
}

app.listen(PORT, () => console.log(`Server is Running well on PORT ${PORT}`));
