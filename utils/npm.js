const path = require('path');
const pirates = require('pirates');
const spawn = require('cross-spawn');
const Promise = require('bluebird');
const {
  Worker,
  isMainThread,
  workerData,
  parentPort,
} = require('worker_threads');
const chalk = require('chalk');

process.env['FORCE_COLOR'] = chalk.level.toString();

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

const load = extraConfig =>
  new Promise(resolve =>
    npm.load(
      {
        silent: true,
        json: true,
        loglevel: 'silent',
        audit: false,
        ...extraConfig,
      },
      resolve,
    ),
  );

// module.exports.load = (config = {}) =>
//   new Promise(resolve => npm.load(config, resolve));
module.exports.view = package =>
  load().then(
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
    load().then(
      () =>
        new Promise(resolve =>
          npm.commands.distTag(['ls', pkg], (err, data) => {
            if (err) reject(err);
            else resolve(data);
          }),
        ),
    ),
  add: (pkg, tag, version) =>
    load().then(
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
    load().then(
      () =>
        new Promise((resolve, reject) =>
          npm.commands.distTag(['rm', pkg, tag], (err, data) => {
            if (
              !err ||
              (typeof err.message === 'string' &&
                err.message.includes('is not a dist-tag on'))
            )
              resolve(data);
            else reject(err);
          }),
        ),
    ),
};
if (isMainThread) {
  module.exports.publish = (packages, isLatest) =>
    new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { packages, isLatest, action: 'publish' },
      });
      worker.addListener('message', resolve);
    });
} else {
  const { packages, isLatest, action } = workerData;
  const publishOnce = pkg =>
    new Promise((resolve, reject) =>
      npm.commands.publish(['./download/' + pkg], v => {
        if (v instanceof Error) reject(v);
        else resolve(v);
      }),
    );
  const publish = pkg => {
    if (isLatest) console.log(`uploading latest package: ${pkg}`);
    else console.log(`uploading non-latest package: ${pkg}`);
    return publishOnce(pkg).catch(() => {
      console.log(chalk.red(`upload ${pkg} failed, retry`));
      return publish(pkg);
    });
  };
  if (action === 'publish')
    load({ tag: isLatest ? 'latest' : 'false' })
      .then(() =>
        Promise.map(packages, pkg => publish(pkg, isLatest), {
          concurrency: 10,
        }),
      )
      .then(() => {
        parentPort.postMessage('ok');
        // process.exit();
      });
}
module.exports.pack = (pkg, dir) =>
  load().then(
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
