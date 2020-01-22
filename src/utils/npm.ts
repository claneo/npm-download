import cacache from 'cacache';
import chalk from 'chalk';
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

process.env['FORCE_COLOR'] = chalk.level.toString();

export const config = libNpmConfig
  .read({
    tmp: osenv.tmpdir(),
    cache: path.join(require('pacote/lib/util/cache-dir')(), '_cacache'),
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
  return (
    pacote.tarball
      // @ts-ignore
      .file(pkg, path.join(dir, downloadedFilename(pkg)), {
        ...config,
        registry,
        cache,
        resolved: packageManifest.dist.tarball,
        integrity: packageManifest.dist.integrity,
      })
      .catch((e: any) => {
        console.log(packageManifest, e);
        process.exit();
      })
  );
};
