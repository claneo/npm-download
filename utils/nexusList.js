const http = require('http');

module.exports = function(url) {
  return new Promise(resolve => {
    let list = [];

    function load(continuationToken) {
      http.get(url + '&continuationToken=' + continuationToken, res => {
        let result = '';
        res.on('data', chunk => {
          result += chunk.toString();
        });
        res.on('close', () => {
          const data = JSON.parse(result);
          list = list.concat(data.items);
          if (data.continuationToken) load(data.continuationToken);
          else resolve(list);
        });
      });
    }

    http.get(url, res => {
      let result = '';
      res.on('data', chunk => {
        result += chunk.toString();
      });
      res.on('close', () => {
        const data = JSON.parse(result);
        list = list.concat(data.items);
        if (data.continuationToken) load(data.continuationToken);
        else resolve(list);
      });
    });
  });
};
