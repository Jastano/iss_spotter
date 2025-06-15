const needle = require('needle');

const fetchCoordsByIP = function(ip, callback) {
  const url = `https://ipwho.is/${ip}`;

  needle.get(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    const parsedBody = JSON.parse(body);

    if (!parsedBody.success) {
      const message = `Success status was ${parsedBody.success}. Server message says: ${parsedBody.message} when fetching for IP ${parsedBody.ip}`;
      callback(Error(message), null);
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
      const msg = `Status Code ${response.statusCode} when fetching ISS pass times. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const parsedBody = JSON.parse(body);
    callback(null, parsedBody.response);
  });
};

module.exports = {
  fetchCoordsByIP,
  fetchISSFlyOverTimes
};
