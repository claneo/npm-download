const rwFile = require('./rwFile');

module.exports.get = () => {
  return (
    rwFile.get('./nexusRepo.json') || {
      nexusUrl: '',
      repoName: '',
      packages: {},
    }
  );
};
module.exports.set = changed => {
  const config = module.exports.get();
  Object.assign(config, changed);
  rwFile.set('./nexusRepo.json', config);
};
