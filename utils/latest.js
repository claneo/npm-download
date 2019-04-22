const semver = require('semver');
const packageString = require('./packageString');

const list = require('../list.json');

const latest = {};
list.forEach(item => {
  const { name, version } = packageString(item);

  if (!latest[name] || semver.gt(version, latest[name])) latest[name] = version;
});
module.exports = latest;
