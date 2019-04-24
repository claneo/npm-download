const fs = require('fs');
const path = require('path');
const semver = require('semver');
const packageString = require('./packageString');
const existLatests = require('./latests');
const npmApi = require('./npmApi');

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

module.exports = files => {
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
  // old.forEach(item =>
  //   npmApi.pack(item, path.resolve(__dirname, '../download/old'))
  // );
  latest.forEach(item => {
    npmApi.pack(item, path.resolve(__dirname, '../download/latest'));
  });
};
