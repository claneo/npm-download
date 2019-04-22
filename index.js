const latest = require('./utils/latest');
const npmTop = require('./utils/npmTop');
const npmApi = require('./utils/npmApi');
const exist = require('./list.json');

// console.log(latest);
npmTop(100).then(packages => {
  // const list = [...packages];
  npmApi.view(packages[0]).then(package => console.log(package.dependencies));
});
