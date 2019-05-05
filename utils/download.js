const fs = require('fs');
const path = require('path');
const semver = require('semver');
const packageString = require('./packageString');
const computeLatests = require('./latests');
const npmApi = require('./npmApi');
const downloaded = require('../list.json');
const asyncPool = require('./asyncPool');

module.exports = async packages => {
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

  if (!fs.existsSync(path.resolve(__dirname, '../download/tmp'))) {
    fs.mkdirSync(path.resolve(__dirname, '../download/tmp'));
  }

  const existLatests = computeLatests(downloaded.concat(packages));

  const old = [];
  let oldList = [];
  const latest = [];
  packages.forEach(package => {
    if (!downloaded.includes(package)) {
      const packageObj = packageString(package);
      downloaded.push(package);
      if (
        existLatests[packageObj.name] &&
        semver.gt(existLatests[packageObj.name], packageObj.version)
      ) {
        old.push(package);
        oldList.push(packageObj.name + '@' + existLatests[packageObj.name]);
      } else {
        latest.push(package);
      }
    }
  });
  let step = 0;
  asyncPool(
    old,
    item =>
      npmApi
        .pack(item, path.resolve(__dirname, '../download/old'))
        .then(() =>
          console.log(
            'downloaded: ' + ++step + '/' + (old.length + latest.length)
          )
        ),
    5
  );
  asyncPool(
    latest,
    item =>
      npmApi
        .pack(item, path.resolve(__dirname, '../download/latest'))
        .then(() =>
          console.log(
            'downloaded: ' + ++step + '/' + (old.length + latest.length)
          )
        ),
    5
  );
  if (fs.existsSync(path.resolve(__dirname, '../download/oldList.json')))
    oldList = oldList
      .concat(require('../download/oldList.json'))
      .sort()
      .filter((item, i, arr) => arr.indexOf(item) === i);
  fs.writeFileSync(
    path.resolve(__dirname, '../download/oldList.json'),
    JSON.stringify(oldList, undefined, 4)
  );
  fs.writeFileSync(
    path.resolve(__dirname, '../list.json'),
    JSON.stringify(downloaded.sort(), undefined, 4)
  );
};
