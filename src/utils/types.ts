import https from 'https';
import * as npm from './npm';

export default async () => {
  const latestTsVersion = (await npm.view('typescript')).version;
  const [majorVer, minorVer] = latestTsVersion.split('.').map(item => +item);
  const allTsVersions: string[] = [];
  for (let i = 2; i <= majorVer; i++) {
    for (let j = 0; j <= (i === majorVer ? minorVer : 9); j++) {
      allTsVersions.push(`ts${i}.${j}`);
    }
  }
  const typesRegistry = await new Promise<{
    entries: Record<string, Record<string, string>>;
  }>((resolve, reject) => {
    https.get(
      'https://cdn.jsdelivr.net/npm/types-registry@latest/index.json',
      res => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      },
    );
  });
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
