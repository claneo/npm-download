const semver = require('semver');
const packageString = require('./packageString');

module.exports = list => {
  const latest = {};
  list.forEach(item => {
    const { name, version } = packageString(item);

    if (!latest[name] || semver.gt(version, latest[name]))
      latest[name] = version;
  });
  return latest;
};
