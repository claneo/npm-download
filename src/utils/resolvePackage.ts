import pacote from 'pacote';
import npa from 'npm-package-arg';
import pickManifest from 'npm-pick-manifest';
import path from 'path';
import ssri from 'ssri';
import getRegistry from './registry';

const cacheDir = path.join(require('pacote/lib/util/cache-dir')(), '_cacache');

const resolvePackage = async (pkg: string) => {
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
export default resolvePackage;
