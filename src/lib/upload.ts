import fs from 'fs';
import path from 'path';
import asyncQueue from '../utils/asyncQueue';
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

    await asyncQueue(
      nonLatestFiles,
      pkg => {
        console.log(`uploading non-latest package: ${pkg}`);
        return npm.publish(path.join('./download', pkg), 'false').catch(err => {
          console.log(err);
          throw err;
        });
      },
      // Nexus 同时上传同一个包的不同版本会出错
      // 下面上传latest的时候不会出现同一个包的不同版本
      // TODO 同一个包的不同版本分开上传
      1,
    );
    await asyncQueue(latestFiles, pkg => {
      console.log(`uploading latest package: ${pkg}`);
      return npm.publish(path.join('./download', pkg));
    });
    await asyncQueue(tagActions, function tag({ pkg, version, tag }) {
      console.log(`adding tag ${pkg}@${version} ${tag}`);
      return npm.distTag.add(pkg, tag, version).catch(e => {
        console.log(e);
      });
    });
    await asyncQueue(falsePackages, pkg => {
      console.log(`removing false tag ${pkg}`);
      return npm.distTag.rm(pkg, 'false');
    });
  });
