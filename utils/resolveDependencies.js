const npmApi = require('./npmApi');

module.exports = async packages => {
  const result = [];
  const todo = [...packages];

  while (todo.length > 0) {
    const item = todo.pop();
    let packageInfo = await npmApi.view(item);
    if (packageInfo instanceof Array) {
      packageInfo = packageInfo[0];
    }
    const package = packageInfo.name + '@' + packageInfo.version;
    if (!result.includes(package)) result.push(package);
    if (packageInfo.dependencies)
      Object.entries(packageInfo.dependencies).forEach(
        ([depName, depVersion]) => {
          const dep = depName + '@' + depVersion;
          if (!result.includes(dep) && !todo.includes(dep)) todo.push(dep);
        }
      );
  }
  return result;
};
