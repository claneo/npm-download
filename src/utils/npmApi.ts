import spawn from 'cross-spawn';

export const pack = (pkg: string, path: string) =>
  new Promise((resolve, reject) => {
    const pack = spawn('npm', ['-s', 'pack', pkg], {
      cwd: path,
    });
    pack.on('close', resolve);
    pack.on('error', reject);
  });

export const publish = (pkg: string, noTag?: boolean) =>
  new Promise((resolve, reject) => {
    const args = ['-s', 'publish', pkg];
    if (noTag) args.push('--no-tag');
    const publish = spawn('npm', args);
    publish.on('close', resolve);
    publish.stderr!.on('data', data => {
      console.log(data.toString());
      reject();
    });
  });

export const view = (pkg: string) =>
  new Promise((resolve, reject) => {
    const view = spawn('npm', ['--json', 'view', pkg]);
    let result = '';
    view.stdout!.on('data', data => {
      result += data.toString();
    });
    view.stdout!.on('close', () => {
      resolve(JSON.parse(result));
    });
    view.on('error', reject);
  });

exports.install = (packages: string[]) =>
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
    install.stdout!.on('data', data => {
      result += data.toString();
    });
    install.stdout!.on('close', () => {
      resolve(JSON.parse(result));
    });
    install.stderr!.on('data', data => {
      console.log(data.toString());
      reject();
    });
  });
