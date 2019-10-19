const fs = require('fs');
const npm = require('./npm');
const rwFile = require('./rwFile');
const Promise = require('bluebird');
const downloadedFilename = require('./downloadedFilename');

module.exports = () =>
  fs.readdir('./download', async (err, files) => {
    const diff = rwFile.get('./diff.json');
    const tagActions = [];
    const falsePackages = [];
    const latests = [];
    Object.entries(diff).forEach(([pkg, { tags, versions }]) => {
      if (versions && versions.some(item => item !== tags.latest)) {
        falsePackages.push(pkg);
      }
      Object.entries(tags).forEach(([tag, version]) => {
        if (tag === 'latest') latests.push(`${pkg}@${version}`);
        else tagActions.push({ pkg, version, tag });
      });
    });
    const latestFiles = [];
    const nonLatestFiles = [];
    files.forEach(file => {
      if (latests.some(item => downloadedFilename(item) === file))
        latestFiles.push(file);
      else nonLatestFiles.push(file);
    });

    await npm.publish(nonLatestFiles, false);
    await npm.publish(latestFiles, true);
    await Promise.map(
      tagActions,
      function tag({ pkg, version, tag }) {
        // console.log(`adding tag ${pkg}@${version} ${tag}`);
        return npm.distTag.add(pkg, tag, version).catch(e => {
          console.log(e);
        });
      },
      { concurrency: 10 },
    );
    await Promise.map(falsePackages, pkg => npm.distTag.rm(pkg, 'false'), {
      concurrency: 10,
    });
  });
