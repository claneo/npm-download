const fs = require('fs');
const Promise = require('bluebird');
const npm = require('./npm');
const packagesList = require('./packageList');
const configUtil = require('./config');
const downloadedFilename = require('./downloadedFilename');

const checkFile = pkg =>
  new Promise((resolve, reject) => {
    fs.stat(downloadedFilename(pkg), (err, stat) => {
      if (!err && stat.size !== 0) resolve();
      else {
        reject(
          new Error(
            `downloaded file ${downloadedFilename(pkg)} invalid, retry`,
          ),
        );
      }
    });
  });

const downloadSingle = pkg =>
  npm
    .pack(pkg)
    .timeout(30000, `download ${pkg} timeout after 30s, retry`)
    .then(() => checkFile(pkg))
    .catch(e => {
      console.error(e.message);
      return downloadSingle(pkg);
    });

module.exports = async packages => {
  if (!fs.existsSync('./download')) {
    fs.mkdirSync('./download');
  }
  const diffVersions = packagesList.diffVersions(
    configUtil.get().packages,
    packages,
  );

  console.log(`${diffVersions.length} packages to download`);
  process.chdir('./download');
  await Promise.map(
    diffVersions.reverse(),
    pkg => {
      console.log(`downloading ${pkg}`);
      return downloadSingle(pkg);
    },
    { concurrency: 100 },
  );
  process.chdir('..');

  packagesList.saveDiffFile(packages);
};
