const download = require('./utils/download');

module.exports = path => {
  const packageLockJson = require(path);
  const packages = [];
  function handleDependencies(package) {
    if (package.dependencies) {
      Object.entries(package.dependencies).forEach(
        ([subPackageName, subPackageInfo]) => {
          const subPackage = subPackageName + '@' + subPackageInfo.version;
          packages.push(subPackage);
          handleDependencies(subPackageInfo);
        }
      );
    }
  }
  handleDependencies(packageLockJson);
  return download(packages);
};
