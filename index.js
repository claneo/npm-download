const path = require('path');

const fromInput = require('./fromInput');
const fromPackageJson = require('./fromPackageJson');
const fromPackageLockJson = require('./fromPackageLockJson');
const fromTop = require('./fromTop');

// fromInput(['cross-spawn@^6.0.5', 'semver@^4.0.0']);
fromTop(1000);
// fromPackageJson(path.resolve(__dirname, './package.json'));
// fromPackageLockJson(path.resolve(__dirname, '../annotator/package-lock.json'));
