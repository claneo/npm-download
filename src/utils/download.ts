import fs from 'fs';
import BB from 'bluebird';
import * as npm from './npm';
import * as packagesList from './packageList';
import * as configUtil from './config';
import downloadedFilename from './downloadedFilename';
import program from 'commander';

const checkFile = (pkg: string) =>
  new BB((resolve, reject) => {
    fs.stat(downloadedFilename(pkg), (err, stat) => {
      if (!err && stat.size !== 0) resolve();
      else {
        reject(
          new Error(
            `downloaded file ${downloadedFilename(pkg)} invalid, retry`,
          ),
        );
      }
    });
  });

const downloadSingle = (pkg: string): Promise<unknown> =>
  npm
    .pack(pkg)
    // .timeout(60000, `download ${pkg} timeout after 30s, retry`)
    .then(() => checkFile(pkg))
    .catch(e => {
      console.error(e.message);
      return downloadSingle(pkg);
    });

export default async (packages: packagesList.PackageList) => {
  const diffVersions = packagesList.diffVersions(
    configUtil.get().packages,
    packages,
  );

  console.log(`${diffVersions.length} packages to download`);
  if (program.dryRun) {
    console.log(diffVersions);
    console.log(`dry-run enabled, no package was downloaded`);
  } else {
    if (!fs.existsSync('./download')) {
      fs.mkdirSync('./download');
    }
    process.chdir('./download');
    await BB.map(
      diffVersions.reverse(),
      pkg => {
        console.log(`downloading ${pkg}`);
        return downloadSingle(pkg);
      },
      { concurrency: 100 },
    );
    process.chdir('..');

    packagesList.saveDiffFile(packages);
  }
};
