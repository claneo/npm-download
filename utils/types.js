const request = require('./request');

module.exports = () =>
  request('https://cdn.jsdelivr.net/npm/types-registry@latest/index.json');
