const spawn = require('cross-spawn');

exports.pack = (package, path) =>
  new Promise((resolve, reject) => {
    const pack = spawn('npm', ['-s', 'pack', package], {
      cwd: path,
    });
    pack.on('close', resolve);
    pack.on('error', reject);
  });

exports.publish = package =>
  new Promise((resolve, reject) => {
    const publish = spawn('npm', ['-s', 'publish', package]);
    publish.on('close', resolve);
    publish.on('error', reject);
  });

exports.view = package =>
  new Promise((resolve, reject) => {
    const view = spawn('npm', ['--json', 'view', package]);
    view.stdout.on('data', data => {
      resolve(JSON.parse(data.toString()));
    });
    view.on('error', reject);
  });
