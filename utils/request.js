const https = require('https');

module.exports = url =>
  new Promise((resolve, reject) => {
    https.get(url, res => {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', chunk => (rawData += chunk));
      res.on('end', () => {
        const parsedData = JSON.parse(rawData);
        resolve(parsedData);
      });
    });
  });
