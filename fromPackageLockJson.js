const fs = require('fs');
const path = require('path');
const download = require('./utils/download');

const files = [];
const downloaded = require('./list.json');

function handleDependencies(package) {
  if (package.dependencies) {
    Object.entries(package.dependencies).forEach(
      ([subPackageName, subPackage]) => {
        const file = subPackageName + '@' + subPackage.version;
        if (
          subPackage.resolved &&
          !files.includes(file) &&
          !downloaded.includes(file)
        )
          files.push(file);
        handleDependencies(subPackage);
      }
    );
  }
}

fs.readFile(
  path.resolve(__dirname, '../markdown-website/package-lock.json'),
  'utf8',
  (err, data) => {
    if (!err) {
      const rootPackage = JSON.parse(data);
      handleDependencies(rootPackage);
      console.log('file to download: ' + files.length);
      download(files);
    }
  }
);
