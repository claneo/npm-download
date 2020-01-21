import BB from 'bluebird';
import fs from 'fs';
import downloadedFilename from '../utils/downloadedFilename';
import * as npm from '../utils/npm';
import * as rwFile from '../utils/rwFile';

export default () =>
  fs.readdir('./download', async (err, files) => {
    const diff: Record<
      string,
      { tags: Record<string, string>; versions: string[] }
    > = rwFile.get('./diff.json');
    const tagActions: { pkg: string; version: string; tag: string }[] = [];
    const falsePackages: string[] = [];
    const latests: string[] = [];
    Object.entries(diff).forEach(([pkg, { tags, versions }]) => {
      if (versions && versions.some(item => item !== tags.latest)) {
        falsePackages.push(pkg);
      }
      Object.entries(tags).forEach(([tag, version]) => {
        if (tag === 'latest') latests.push(`${pkg}@${version}`);
        else tagActions.push({ pkg, version, tag });
      });
    });
    const latestFiles: string[] = [];
    const nonLatestFiles: string[] = [];
    files.forEach(file => {
      if (latests.some(item => downloadedFilename(item) === file))
        latestFiles.push(file);
      else nonLatestFiles.push(file);
    });

    await npm.publish(nonLatestFiles, false);
    await npm.publish(latestFiles, true);
    await BB.map(
      tagActions,
      function tag({ pkg, version, tag }) {
        // console.log(`adding tag ${pkg}@${version} ${tag}`);
        return npm.distTag.add(pkg, tag, version).catch(e => {
          console.log(e);
        });
      },
      { concurrency: 10 },
    );
    await BB.map(falsePackages, pkg => npm.distTag.rm(pkg, 'false'), {
      concurrency: 10,
    });
  });
