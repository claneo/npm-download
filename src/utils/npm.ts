import path from 'path';
import * as pirates from 'pirates';
import spawn from 'cross-spawn';
import Promise from 'bluebird';
import { Worker, isMainThread, workerData, parentPort } from 'worker_threads';
import chalk from 'chalk';

process.env['FORCE_COLOR'] = chalk.level.toString();

let npmPath: string;

try {
  npmPath = require.resolve('npm');
} catch (error) {
  if (process.platform === 'win32') {
    // const dirname = path.join(process.env.APPDATA as string, 'npm');
    try {
      npmPath = require.resolve(
        path.join(process.env.APPDATA as string, 'npm/node_modules/npm'),
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

const load = (extraConfig?: any) =>
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
export const distTag = {
  ls: (pkg: string): Promise<Record<string, string>> =>
    load().then(
      () =>
        new Promise((resolve, reject) =>
          npm.commands.distTag(['ls', pkg], (err: Error | null, data: any) => {
            if (err && err.message.includes('No dist-tags found for'))
              resolve({});
            else if (err) reject(err);
            else resolve(data);
          }),
        ),
    ),
  add: (pkg: string, tag: string, version: string) =>
    load().then(
      () =>
        new Promise((resolve, reject) =>
          npm.commands.distTag(
            ['add', `${pkg}@${version}`, tag],
            (err: Error | null, data: any) => {
              if (err) reject(err);
              else resolve(data);
            },
          ),
        ),
    ),
  rm: (pkg: string, tag: string) =>
    load().then(
      () =>
        new Promise((resolve, reject) =>
          npm.commands.distTag(
            ['rm', pkg, tag],
            (err: Error | null, data: any) => {
              if (
                !err ||
                (typeof err.message === 'string' &&
                  err.message.includes('is not a dist-tag on'))
              )
                resolve(data);
              else reject(err);
            },
          ),
        ),
    ),
};
export const publish = (packages: string[], isLatest: boolean) =>
  new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: { packages, isLatest, action: 'publish' },
    });
    worker.addListener('message', resolve);
  });
if (!isMainThread) {
  const { packages, isLatest, action } = workerData;
  const publishOnce = (pkg: string) =>
    new Promise((resolve, reject) =>
      npm.commands.publish(['./download/' + pkg], (v: any) => {
        if (v instanceof Error) reject(v);
        else resolve(v);
      }),
    );
  const publish = (pkg: string): ReturnType<typeof publishOnce> => {
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
        Promise.map(packages as string[], pkg => publish(pkg), {
          concurrency: 10,
        }),
      )
      .then(() => {
        parentPort!.postMessage('ok');
        // process.exit();
      });
}
export const pack = (pkg: string, dir?: string) =>
  load().then(
    () =>
      new Promise((resolve, reject) =>
        npm.commands.pack([pkg], true, (err: Error | null, data: any) => {
          if (err) reject(err);
          else resolve(data);
        }),
      ),
  );

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
