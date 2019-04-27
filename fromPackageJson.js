const path = require('path');

const fromInput = require('./fromInput');

module.exports = path => {
  const packageJson = require(path);
  let packages = [];
  if (packageJson.dependencies)
    Object.entries(packageJson.dependencies).forEach(([name, version]) => {
      packages.push(name + '@' + version);
    });
  if (packageJson.devDependencies)
    Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
      packages.push(name + '@' + version);
    });
  return fromInput(packages);
};
