const npmApi = require('./npmApi');
const asyncPool = require('./asyncPool');

module.exports = async packages => {
  const result = [];
  const todo = [...packages];

  return asyncPool(todo, item =>
    npmApi
      .view(item)
      .then(packageInfo =>
        packageInfo instanceof Array ? packageInfo[0] : packageInfo
      )
      .then(packageInfo => {
        const package = packageInfo.name + '@' + packageInfo.version;
        if (!result.includes(package)) result.push(package);
        if (packageInfo.dependencies)
          Object.entries(packageInfo.dependencies).forEach(
            ([depName, depVersion]) => {
              const dep = depName + '@' + depVersion;
              if (!result.includes(dep) && !todo.includes(dep)) todo.push(dep);
            }
          );
        console.log('resolved: ' + result.length + '/' + todo.length);
      })
  ).then(() => result);
};
