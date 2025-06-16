const needle = require('needle');

const fetchMyIP = function(callback) {
  const url = 'https://api.ipify.org?format=json';
  needle.get(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }

    const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    callback(null, parsedBody.ip);
  });
};

const fetchCoordsByIP = function(ip, callback) {
  const url = `https://ipwho.is/${ip}`;
  needle.get(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;

    if (!parsedBody.success) {
      callback(Error(`Success status was ${parsedBody.success}. Server message: ${parsedBody.message}`), null);
      return;
    }

    const coords = {
      latitude: parsedBody.latitude,
      longitude: parsedBody.longitude
    };

    callback(null, coords);
  });
};

const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  needle.get(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    callback(null, parsedBody.response);
  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, coords) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(coords, (error, passes) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, passes);
      });
    });
  });
};

module.exports = {

  fetchCoordsByIP,
  fetchISSFlyOverTimes,
  nextISSTimesForMyLocation
};
