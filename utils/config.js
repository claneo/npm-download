const fs = require('fs');

module.exports.get = () => {
  let config = { nexusUrl: '', repoName: '', packages: {} };
  try {
    const configFileData = fs.readFileSync('./nexusRepo.json', 'utf8');
    config = JSON.parse(configFileData);
  } catch (e) {}
  return config;
};
module.exports.set = changed => {
  const config = module.exports.get();
  Object.assign(config, changed);
  fs.writeFileSync('./nexusRepo.json', JSON.stringify(config, undefined, 4));
};
