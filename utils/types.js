const https = require('https');
const npm = require('./npm');

module.exports = async () => {
  const latestTsVersion = (await npm.view('typescript')).version;
  const [majorVer, minorVer] = latestTsVersion.split('.').map(item => +item);
  const allTsVersions = [];
  for (let i = 2; i <= majorVer; i++) {
    for (let j = 0; j <= (i === majorVer ? minorVer : 9); j++) {
      allTsVersions.push(`ts${i}.${j}`);
    }
  }
  const typesRegistry = await new Promise((resolve, reject) => {
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
  const packages = {};
  Object.entries(typesRegistry.entries).forEach(([pkg, tags]) => {
    const versions = [];
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
