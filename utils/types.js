const https = require('https');

module.exports = () =>
  new Promise((resolve, reject) => {
    https.get(
      'https://cdn.jsdelivr.net/npm/types-registry@latest/index.json',
      res => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      }
    );
  }).then(data => {
    const packages = {};
    Object.entries(data.entries).forEach(([pkg, tags]) => {
      const versions = [];
      Object.values(tags).forEach(version => {
        if (!versions.includes(version)) versions.push(version);
      });
      packages[`@types/${pkg}`] = { versions, tags };
    });
    return packages;
  });
