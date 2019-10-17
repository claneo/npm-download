const fs = require('fs');

module.exports.get = file => {
  try {
    const configFileData = fs.readFileSync(file, 'utf8');
    return JSON.parse(configFileData);
  } catch (e) {
    return undefined;
  }
};
module.exports.set = (file, content) => {
  fs.writeFileSync(file, JSON.stringify(content, undefined, 4));
};
