const pacote = require('pacote');
const npa = require('npm-package-arg');
const pickManifest = require('npm-pick-manifest');
const path = require('path');
const ssri = require('ssri');
const getRegistry = require('./registry');

const cacheDir = path.join(require('pacote/lib/util/cache-dir')(), '_cacache');

const resolvePackage = async pkg => {
  const packument = await pacote.packument(pkg, {
    cache: cacheDir,
    registry: getRegistry(),
  });
  const manifest = pickManifest(packument, npa(pkg).fetchSpec);
  if (!manifest.dist.integrity && manifest.dist.shasum)
    manifest.dist.integrity = ssri
      .fromHex(manifest.dist.shasum, 'sha1')
      .toString();

  return { ...manifest, 'dist-tags': packument['dist-tags'] };
};
module.exports = resolvePackage;
