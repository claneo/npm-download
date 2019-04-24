const fs = require('fs');
const path = require('path');
const semver = require('semver');
const packageString = require('./packageString');
const existLatests = require('./latests');
const npmApi = require('./npmApi');

module.exports = async files => {
  // fs.rmdirSync(path.resolve(__dirname, '../download'));

  if (!fs.existsSync(path.resolve(__dirname, '../download'))) {
    fs.mkdirSync(path.resolve(__dirname, '../download'));
  }

  if (!fs.existsSync(path.resolve(__dirname, '../download/latest'))) {
    fs.mkdirSync(path.resolve(__dirname, '../download/latest'));
  }

  if (!fs.existsSync(path.resolve(__dirname, '../download/old'))) {
    fs.mkdirSync(path.resolve(__dirname, '../download/old'));
  }

  const packages = files.map(packageString);
  const old = [];
  const latest = [];
  packages.forEach(package => {
    if (
      existLatests[package.name] &&
      semver.gt(existLatests[package.name], package.version)
    ) {
      old.push(package.name + '@' + package.version);
    } else {
      latest.push(package.name + '@' + package.version);
    }
  });
  for (let i = 0; i < old.length; i += 1) {
    await npmApi.pack(old[i], path.resolve(__dirname, '../download/old'));
  }
  for (let i = 0; i < latest.length; i += 1) {
    await npmApi.pack(latest[i], path.resolve(__dirname, '../download/latest'));
  }
};
