import program from 'commander';
import fs from 'fs';
import asyncQueue from './asyncQueue';
import * as configUtil from './config';
import downloadedFilename from './downloadedFilename';
import * as npm from './npm';
import * as packagesList from './packageList';

const checkFile = async (pkg: string) => {
  const stat = await fs.promises.stat(downloadedFilename(pkg));
  if (stat.size === 0)
    throw new Error(`downloaded file ${downloadedFilename(pkg)} invalid`);
};

const downloadSingle = (pkg: string): Promise<unknown> =>
  npm
    .pack(pkg)
    // .timeout(60000, `download ${pkg} timeout after 30s, retry`)
    .then(() => checkFile(pkg));
// .catch(e => {
//   console.error((e as Error).stack);
//   process.exit();
//   return downloadSingle(pkg);
// });

export default async (packages: packagesList.PackageList) => {
  const diffVersions = packagesList.diffVersions(
    configUtil.get().packages,
    packages,
  );

  console.log(`${diffVersions.length} packages to download`);
  if (program.opts().dryRun) {
    console.log(diffVersions);
    console.log(`dry-run enabled, no package was downloaded`);
  } else {
    if (!fs.existsSync('./download')) {
      fs.mkdirSync('./download');
    }
    process.chdir('./download');
    await asyncQueue(
      diffVersions.reverse(),
      pkg => {
        console.log(`downloading ${pkg}`);
        return downloadSingle(pkg);
      },
      20,
    );
    process.chdir('..');

    if (program.opts().diff) packagesList.saveDiffFile(packages);
  }
};
