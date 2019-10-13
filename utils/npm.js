const path = require('path');

let npmPath;

if (process.platform === 'win32') {
  dirname = path.join(process.env.APPDATA, 'npm');
  try {
    npmPath = require.resolve(
      path.join(process.env.APPDATA, 'npm/node_modules/npm')
    );
  } catch (error) {
    npmPath = require.resolve(
      path.join(path.dirname(process.execPath), 'node_modules/npm')
    );
  }
} else {
  npmPath = require.resolve(
    path.join(path.dirname(process.execPath), '../lib/node_modules/npm')
  );
}

const npm = require(npmPath);

module.exports = npm;
