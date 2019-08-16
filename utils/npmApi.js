const spawn = require('cross-spawn');

exports.pack = (package, path) =>
  new Promise((resolve, reject) => {
    const pack = spawn('npm', ['-s', 'pack', package], {
      cwd: path,
    });
    pack.on('close', resolve);
    pack.on('error', reject);
  });

exports.publish = (package, noTag) =>
  new Promise((resolve, reject) => {
    const args = ['-s', 'publish', package];
    if (noTag) args.push('--no-tag');
    const publish = spawn('npm', args);
    publish.on('close', resolve);
    publish.stderr.on('data', data => {
      console.log(data.toString());
      reject();
    });
  });

exports.view = package =>
  new Promise((resolve, reject) => {
    const view = spawn('npm', ['--json', 'view', package]);
    let result = '';
    view.stdout.on('data', data => {
      result += data.toString();
    });
    view.stdout.on('close', () => {
      resolve(JSON.parse(result));
    });
    view.on('error', reject);
  });

exports.install = packages =>
  new Promise((resolve, reject) => {
    const install = spawn('npm', [
      '--json',
      '-s',
      'install',
      '-g',
      '--dry-run',
      ...packages,
    ]);
    let result = '';
    install.stdout.on('data', data => {
      result += data.toString();
    });
    install.stdout.on('close', () => {
      resolve(JSON.parse(result));
    });
    install.stderr.on('data', data => {
      console.log(data.toString());
      reject();
    });
  });
