const axios = require('axios').default;
const npm = require('./npm');

const request = (baseUrl, repoName, start) =>
  axios.post(baseUrl, {
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
  const {
    data: {
      result: { unlimitedTotal },
    },
  } = await request(baseUrl, repoName);
  const starts = [...Array(Math.ceil(unlimitedTotal / 1000)).keys()].map(
    v => v * 1000,
  );
  const lists = await Promise.all(
    starts.map(start => request(baseUrl, repoName, start)),
  );
  const list = lists.reduce(
    (prev, cur) => prev.concat(cur.data.result.data),
    [],
  );
  const packages = {};
  list.forEach(item => {
    let packageName = `${item.name}@${item.version}`;
    if (item.group) packageName = `@${item.group}/${item.name}@${item.version}`;
    if (!packages[packageName])
      packages[packageName] = { versions: [], tags: {} };
    if (!packages[packageName].versions.includes(item.version))
      packages[packageName].versions.push(item.version);
  });
  await Promise.all(
    Object.keys(packages).map(package =>
      npm.view(package).then(info => {
        Object.entries(info['dist-tags']).forEach(([tag, ver]) => {
          packages[package].tags[tag] = ver;
        });
      }),
    ),
  );
  return packages;
};

module.exports = nexusList;
