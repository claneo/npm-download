const npm = require('./npm');
const asyncPool = require('./asyncPool');
const packageList = require('./packageList');

module.exports = packageNames =>
  npm
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

// const npm = require('./npm');

// const asyncPool = require('./asyncPool');

// module.exports = async packages => {
//   const result = {};
//   const todo = [...packages];

//   return asyncPool(todo, item =>
//     npm
//       .view(item)
//       // .then(packageInfo =>
//       //   packageInfo instanceof Array ? packageInfo[0] : packageInfo,
//       // )
//       .then(packageInfo => {
//         // const package = packageInfo.name + '@' + packageInfo.version;
//         if (!result[packageInfo.name])
//           result[packageInfo.name] = {
//             versions: [],
//             tags: packageInfo['dist-tags'],
//           };
//         if (!result[packageInfo.name].versions.includes(packageInfo.version))
//           result[packageInfo.name].versions.push(packageInfo.version);
//         if (packageInfo.dependencies)
//           Object.entries(packageInfo.dependencies).forEach(
//             ([depName, depVersion]) => {
//               const dep = depName + '@' + depVersion;
//               if (
//                 (!result[depName] ||
//                   !result[depName].versions.includes(depVersion)) &&
//                 !todo.includes(dep)
//               )
//                 todo.push(dep);
//             },
//           );
//         // console.log('resolved: ' + result.length + '/' + todo.length);
//       }),
//   ).then(() => result);
// };
