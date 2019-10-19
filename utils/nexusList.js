const axios = require('axios').default;
const npm = require('./npm');
const Promise = require('bluebird');

const request = (baseUrl, repoName, start) =>
  axios.post(baseUrl + '/service/extdirect', {
    action: 'coreui_Search',
    method: 'read',
    data: [
      {
        page: 1,
        start: start || 0,
        limit: start === undefined ? 0 : 1000,
        filter: [{ property: 'repository_name', value: repoName }],
      },
    ],
    type: 'rpc',
    tid: 0,
  });

const nexusList = async function(baseUrl, repoName) {
  console.log('fetching package list...');
  const {
    data: {
      result: { unlimitedTotal },
    },
  } = await request(baseUrl, repoName);
  console.log(`total: ${unlimitedTotal}`);
  const starts = [...Array(Math.ceil(unlimitedTotal / 1000)).keys()].map(
    v => v * 1000,
  );
  const lists = await Promise.map(
    starts,
    start =>
      request(baseUrl, repoName, start).then(data => {
        console.log(start, data.data.result.data.length);
        return data;
      }),
    { concurrency: 20 },
  );
  console.log('finished');
  const list = lists.reduce(
    (prev, cur) => prev.concat(cur.data.result.data),
    [],
  );
  console.log(list.length);
  let packages = {};
  list.forEach(item => {
    let packageName = item.name;
    if (item.group) packageName = `@${item.group}/${item.name}`;
    if (!packages[packageName])
      packages[packageName] = { versions: [], tags: {} };
    if (!packages[packageName].versions.includes(item.version))
      packages[packageName].versions.push(item.version);
    else console.log('!');
  });
  await Promise.map(
    Object.keys(packages),
    package => {
      console.log(`resolving dist-tag for package: ${package}`);
      return npm.distTag.ls(package).then(tags => {
        Object.entries(tags).forEach(([tag, ver]) => {
          packages[package].tags[tag] = ver;
        });
      });
    },
    { concurrency: 20 },
  );
  packages = Object.fromEntries(
    Object.entries(packages).sort(([a], [b]) => {
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    }),
  );
  return packages;
};

module.exports = nexusList;
