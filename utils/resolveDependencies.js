const npmApi = require('./npmApi');

module.exports = packages =>
  npmApi
    .install(packages)
    .then(data => data.added.map(item => item.name + '@' + item.version));
