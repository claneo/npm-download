const axios = require('axios').default;

module.exports = () =>
  axios.get('https://cdn.jsdelivr.net/npm/types-registry@latest/index.json');
