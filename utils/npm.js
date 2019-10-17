const path = require('path');
const pirates = require('pirates');
const spawn = require('cross-spawn');

let npmPath;

try {
  npmPath = require.resolve('npm');
} catch (error) {
  if (process.platform === 'win32') {
    dirname = path.join(process.env.APPDATA, 'npm');
    try {
      npmPath = require.resolve(
        path.join(process.env.APPDATA, 'npm/node_modules/npm'),
      );
    } catch (error) {
      npmPath = require.resolve(
        path.join(path.dirname(process.execPath), 'node_modules/npm'),
      );
    }
  } else {
    npmPath = require.resolve(
      path.join(path.dirname(process.execPath), '../lib/node_modules/npm'),
    );
  }
}

const npm = require(npmPath);

const load = new Promise(resolve =>
  npm.load(
    { silent: true, json: true, loglevel: 'silent', audit: false },
    resolve,
  ),
);

// module.exports.load = (config = {}) =>
//   new Promise(resolve => npm.load(config, resolve));
module.exports.view = package =>
  load.then(
    () =>
      new Promise((resolve, reject) =>
        npm.commands.view([package], true, (_, result) => {
          const values = Object.values(result);
          if (!values) reject();
          else resolve(values[0]);
        }),
      ),
  );
module.exports.distTag = {
  ls: pkg =>
    load.then(() => new Promise(resolve => npm.commands.distTag(['ls', pkg]))),
  add: (pkg, tag, version) =>
    load.then(
      () =>
        new Promise((resolve, reject) =>
          npm.commands.distTag(
            ['add', `${pkg}@${version}`, tag],
            (err, data) => {
              if (err) reject(err);
              else resolve(data);
            },
          ),
        ),
    ),
  rm: (pkg, tag) =>
    load.then(
      () => new Promise(resolve => npm.commands.distTag(['rm', pkg, tag])),
    ),
};
module.exports.publish = pkg =>
  new Promise((resolve, reject) =>
    load.then(() =>
      npm.commands.publish([pkg], v => {
        if (v instanceof Error) reject(v);
        else resolve(v);
      }),
    ),
  );
module.exports.pack = (pkg, dir) =>
  load.then(
    () =>
      new Promise((resolve, reject) =>
        npm.commands.pack([pkg], true, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }),
      ),
  );
// module.exports.install = packages =>
//   load.then(() => {
//     if (!Array.isArray(packages)) packages = [packages];
//     return new Promise((resolve, reject) => {
//       const log = console.log;
//       console.log = () => {};
//       new npm.commands.install.Installer(
//         path.join(__dirname, '../temp'),
//         true,
//         packages
//       ).run((err, installed) => {
//         console.log = log;
//         if (err) reject(err);
//         resolve(installed.map(item => item[0]));
//       });
//     });
//   });
module.exports.install = packages =>
  new Promise((resolve, reject) => {
    if (!Array.isArray(packages)) packages = [packages];
    const install = spawn('npm', [
      '--json',
      '-s',
      'install',
      '--prefix',
      path.join(__dirname, '../temp'),
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

pirates.addHook(
  code => {
    return code.replace(
      `BB.promisify(require('read-package-json'))`,
      `BB.promisify((...params) => {
        const cb = params.pop();
        require('read-package-json')(...params, (err, json) => {
          delete json.publishConfig;
          cb(err, json);
        });
      })`,
    );
  },
  {
    ignoreNodeModules: false,
    matcher: filename =>
      filename === path.join(path.dirname(npmPath), 'publish.js'),
  },
);

pirates.addHook(
  code => {
    return code.replace(`npmConfig()`, `require('./config/figgy-config.js')()`);
  },
  {
    ignoreNodeModules: false,
    matcher: filename =>
      filename === path.join(path.dirname(npmPath), 'pack.js'),
  },
);
