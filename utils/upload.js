const fs = require('fs');
const npm = require('./npm');
const asyncPool = require('./asyncPool');
const rwFile = require('./rwFile');

module.exports = () =>
  fs.readdir('./download', async (err, files) => {
    await asyncPool(files, file => {
      console.log(`uploading ${file}`);
      return npm.publish('./download/' + file);
    });
    const diff = rwFile.get('./diff.json');
    const tagActions = [];
    Object.entries(diff).forEach(([pkg, { tags }]) => {
      Object.entries(tags).forEach(([tag, version]) => {
        tagActions.push({ pkg, version, tag });
      });
    });
    await asyncPool(tagActions, ({ pkg, version, tag }) => {
      console.log(`adding tag ${pkg}@${version} ${tag}`);
      return npm.distTag.add(pkg, tag, version);
    });
  });
