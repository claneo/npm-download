const fs = require('fs');
const asyncPool = require('./asyncPool');
const npm = require('./npm');
const packagesList = require('./packageList');
const configUtil = require('./config');

const checkFile = pkg =>
  new Promise((resolve, reject) => {
    fs.stat(
      pkg
        .replace(/^@/, '')
        .replace('/', '-')
        .replace('@', '-') + '.tgz',
      (err, stat) => {
        if (err) reject(err);
        else {
          if (stat.size === 0) reject();
          else resolve();
        }
      }
    );
  });

const downloadSingle = pkg =>
  npm
    .pack(pkg)
    .then(() => checkFile(pkg))
    .catch(() => {
      console.log(`download ${pkg} failed, retry...`);
      return downloadSingle(pkg);
    });

module.exports = async packages => {
  if (!fs.existsSync('./download')) {
    fs.mkdirSync('./download');
  }
  const diffVersions = packagesList.diffVersions(
    configUtil.get().packages,
    packages
  );

  console.log(`${diffVersions.length} packages to download`);
  process.chdir('./download');
  await asyncPool(
    diffVersions,
    pkg => {
      console.log(`downloading ${pkg}`);
      return downloadSingle(pkg);
    },
    100
  );
  process.chdir('..');

  packagesList.saveDiffFile(packages);
};
