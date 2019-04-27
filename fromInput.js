const resolveDependencies = require('./utils/resolveDependencies');
const download = require('./utils/download');

module.exports = packages =>
  resolveDependencies(packages).then(result => download(result));
