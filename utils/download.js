const fs = require('fs');
const Promise = require('bluebird');
const npm = require('./npm');
const packagesList = require('./packageList');
const configUtil = require('./config');
const downloadedFilename = require('./downloadedFilename');
const program = require('commander');

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
    // .timeout(60000, `download ${pkg} timeout after 30s, retry`)
    .then(() => checkFile(pkg))
    .catch(e => {
      console.error(e.message);
      return downloadSingle(pkg);
    });

module.exports = async packages => {
  const diffVersions = packagesList.diffVersions(
    configUtil.get().packages,
    packages,
  );

  console.log(`${diffVersions.length} packages to download`);
  if (program.dryRun) {
    console.log(diffVersions);
    console.log(`dry-run enabled, no package was downloaded`);
  } else {
    if (!fs.existsSync('./download')) {
      fs.mkdirSync('./download');
    }
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
  }
};
