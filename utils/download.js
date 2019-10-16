const fs = require('fs');
const asyncPool = require('./asyncPool');
const npm = require('./npm');
const packagesList = require('./packageList');
const configUtil = require('./config');

module.exports = async packages => {
  if (!fs.existsSync('./download')) {
    fs.mkdirSync('./download');
  }
  const diffVersions = packagesList.diffVersions(
    configUtil.get().packages,
    packages,
  );
  const diffTags = packagesList.diffTags(configUtil.get().packages, packages);
  process.chdir('./download');
  await asyncPool(diffVersions, pkg => npm.pack(pkg), 100);
  fs.writeFileSync('./tags.json', JSON.stringify(diffTags, undefined, 4));
};
