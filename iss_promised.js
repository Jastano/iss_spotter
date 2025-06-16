const needle = require('needle');

const fetchMyIP = function () {
  const url = 'https://api.ipify.org?format=json';

  return needle('get', url)
    .then((response) => {
      const body = response.body;
      return body.ip;
    });
};

const fetchCoordsByIP = function (ip) {
  const url = `https://ipwho.is/${ip}`;

  return needle('get', url)
    .then((response) => {
      const body = response.body;

      if (!body.success) {
        throw new Error(`Failed to get coordinates: ${body.message}`);
      }

      const latitude = body.latitude;
      const longitude = body.longitude;

      return { latitude, longitude };
    });
};

const fetchISSFlyOverTimes = function (coords) {
  const latitude = coords.latitude;
  const longitude = coords.longitude;
  const url = `https://iss-flyover.herokuapp.com/json/?lat=${latitude}&lon=${longitude}`;

  return needle('get', url)
    .then((response) => {
      const body = response.body;
      const passTimes = body.response;
      return passTimes;
    });
};

const nextISSTimesForMyLocation = function () {
  return fetchMyIP()
    .then((ip) => {
      return fetchCoordsByIP(ip);
    })
    .then((coords) => {
      return fetchISSFlyOverTimes(coords);
    });
};

module.exports = { nextISSTimesForMyLocation };
