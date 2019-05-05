const path = require('path');

const fromInput = require('./fromInput');
const fromPackageJson = require('./fromPackageJson');
const fromPackageLockJson = require('./fromPackageLockJson');
const fromTop = require('./fromTop');

switch (process.argv[2]) {
  case 'json':
    if (process.argv[3]) {
      fromPackageJson(path.resolve(process.argv[3], 'package.json'));
    }
    break;
  case 'lock':
    if (process.argv[3]) {
      fromPackageLockJson(path.resolve(process.argv[3], 'package-lock.json'));
    }
    break;
  case 'name':
    fromInput(process.argv.slice(3));
    break;
  case 'top':
    fromTop(process.argv[3]);
    break;
  default:
    console.log('err');
    break;
}
