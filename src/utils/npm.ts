import cacache from 'cacache';
import fs from 'fs';
import libNpmConfig from 'libnpmconfig';
import { publish as libNpmPublish } from 'libnpmpublish';
import npa from 'npm-package-arg';
import pickManifest from 'npm-pick-manifest';
import regFetch from 'npm-registry-fetch';
import osenv from 'osenv';
import pacote from 'pacote';
import path from 'path';
import ssri from 'ssri';
import downloadedFilename from './downloadedFilename';

const temp = osenv.tmpdir();
let home = osenv.home();

const uidOrPid = process.getuid ? process.getuid() : process.pid;

if (home) process.env.HOME = home;
else home = path.resolve(temp, 'npm-' + uidOrPid);

const cacheExtra = process.platform === 'win32' ? 'npm-cache' : '.npm';
const cacheRoot = (process.platform === 'win32' && process.env.APPDATA) || home;
const cache = path.resolve(cacheRoot, cacheExtra, '_cacache');

export const config = libNpmConfig
  .read({
    tmp: temp,
    cache,
  })
  .toJSON();

export const setRegistry = (registry: 'npm' | 'taobao' | string) => {
  if (registry === 'npm') registry = 'https://registry.npmjs.org/';
  if (registry === 'taobao') registry = 'https://registry.npm.taobao.org/';
  config.registry = registry;
};

export const distTag = {
  ls: (pkg: string) =>
    regFetch.json(
      `/-/package/${encodeURIComponent(pkg)}/dist-tags`,
      config,
    ) as Promise<Record<string, string>>,
  add: (pkg: string, tag: string, version: string) =>
    regFetch.json(
      `/-/package/${encodeURIComponent(pkg)}/dist-tags/${encodeURIComponent(
        tag,
      )}`,
      {
        ...config,
        method: 'PUT',
        body: JSON.stringify(version),
        headers: {
          'content-type': 'application/json',
        },
      },
    ) as Promise<Record<string, string>>,
  rm: (pkg: string, tag: string) =>
    regFetch.json(
      `/-/package/${encodeURIComponent(pkg)}/dist-tags/${encodeURIComponent(
        tag,
      )}`,
      {
        ...config,
        method: 'DELETE',
      },
    ) as Promise<Record<string, string>>,
};

export const publish = (pkg: string, tag = 'latest') =>
  new Promise(resolve =>
    cacache.tmp.withTmp(config.tmp, { tmpPrefix: 'fromPackage' }, tmp => {
      const cb = (async () => {
        const extracted = path.join(tmp, 'package');
        const target = path.join(extracted, 'package.json');
        await pacote.extract(pkg, extracted);
        const packageJsonString = await fs.promises.readFile(target, 'utf8');
        const packageJson = JSON.parse(packageJsonString);
        delete packageJson.publishConfig;
        return libNpmPublish(packageJson, fs.createReadStream(pkg), {
          ...config,
          tag,
        });
      })();
      resolve(cb);
      return cb;
    }),
  );

export const view = async (pkg: string) => {
  const packument = await pacote.packument(pkg, {
    cache: config.cache,
    registry: config.registry,
  });
  const manifest = pickManifest(packument, npa(pkg).fetchSpec);
  if (!manifest.dist.integrity && manifest.dist.shasum)
    manifest.dist.integrity = ssri
      .fromHex(manifest.dist.shasum, 'sha1')
      .toString();

  return { ...manifest, 'dist-tags': packument['dist-tags'] };
};

export const pack = async (pkg: string, dir: string = process.cwd()) => {
  const { registry, cache } = config;
  const packageManifest = await view(pkg);
  const stream = pacote.tarball.stream(pkg, {
    ...config,
    registry,
    cache,
    resolved: packageManifest.dist.tarball,
    integrity: packageManifest.dist.integrity,
  });
  const fileName = path.join(dir, downloadedFilename(pkg));
  await fs.promises.unlink(fileName).catch(() => {});
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(fileName);
    stream.on('error', reject);
    writer.on('error', reject);
    writer.on('close', resolve);
    stream.pipe(writer);
  });
};
