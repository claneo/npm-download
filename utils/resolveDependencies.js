const npm = require('./npm');
const asyncPool = require('./asyncPool');
const packageList = require('./packageList');

module.exports = packageNames => {
  console.log('resolving dependencies...');
  return npm
    .install(packageNames)
    .then(data => data.added)
    .then(async list => {
      const packages = {};
      list.forEach(({ name, version }) => {
        packageList.addVersion(packages, name, version);
      });
      await asyncPool(Object.keys(packages), pkg =>
        npm.view(pkg).then(info => {
          packageList.addTag(packages, pkg, info['dist-tags']);
        }),
      );
      return packages;
    });
};
