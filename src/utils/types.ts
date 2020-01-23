import cacache from 'cacache';
import fs from 'fs';
import pacote from 'pacote';
import path from 'path';
import { config, view } from './npm';

export default async () => {
  const latestTsVersion = (await view('typescript')).version;
  const [majorVer, minorVer] = latestTsVersion.split('.').map(item => +item);
  const allTsVersions: string[] = [];
  for (let i = 2; i <= majorVer; i++) {
    for (let j = 0; j <= (i === majorVer ? minorVer : 9); j++) {
      allTsVersions.push(`ts${i}.${j}`);
    }
  }
  const typesRegistry = await new Promise<{
    entries: Record<string, Record<string, string>>;
  }>(resolve =>
    cacache.tmp.withTmp(config.tmp, { tmpPrefix: 'fromPackage' }, tmp => {
      const cb = (async () => {
        const extracted = path.join(tmp, 'package');
        const target = path.join(extracted, 'index.json');
        await pacote.extract('types-registry', extracted);
        const indexJsonString = await fs.promises.readFile(target, 'utf8');
        const indexJson = JSON.parse(indexJsonString);
        return indexJson;
      })();
      resolve(cb);
      return cb;
    }),
  );
  const packages: Record<
    string,
    { versions: string[]; tags: Record<string, string> }
  > = {};
  Object.entries(typesRegistry.entries).forEach(([pkg, tags]) => {
    const versions: string[] = [];
    Object.values(tags).forEach(version => {
      if (!versions.includes(version)) versions.push(version);
    });
    packages[`@types/${pkg}`] = { versions, tags };
    allTsVersions.forEach(tsVer => {
      if (!tags[tsVer]) tags[tsVer] = tags.latest;
    });
  });
  return packages;
};
