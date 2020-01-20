import axios from 'axios';
import * as npm from './npm';
import BB from 'bluebird';

const request = (baseUrl: string, repoName: string, start?: number) =>
  axios.post<{ result: { unlimitedTotal: number; data: any[] } }>(
    baseUrl + '/service/extdirect',
    {
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
    },
  );

const nexusList = async function(baseUrl: string, repoName: string) {
  console.log('fetching package list...');
  const {
    data: {
      result: { unlimitedTotal },
    },
  } = await request(baseUrl, repoName);
  console.log(`total: ${unlimitedTotal}`);
  const starts = Array.from(Array(Math.ceil(unlimitedTotal / 1000))).map(
    v => v * 1000,
  );
  const lists = await BB.map(
    starts,
    start =>
      request(baseUrl, repoName, start).then(data => {
        console.log(start, data.data.result.data.length);
        return data;
      }),
    { concurrency: 20 },
  );
  console.log('finished');
  const list = lists.reduce<{ name: string; group: string; version: string }[]>(
    (prev, cur) => prev.concat(cur.data.result.data),
    [],
  );
  console.log(list.length);
  let packages: Record<
    string,
    { versions: string[]; tags: Record<string, string> }
  > = {};
  list.forEach(item => {
    let packageName = item.name;
    if (item.group) packageName = `@${item.group}/${item.name}`;
    if (!packages[packageName])
      packages[packageName] = { versions: [], tags: {} };
    if (!packages[packageName].versions.includes(item.version))
      packages[packageName].versions.push(item.version);
    else console.log('!');
  });
  await BB.map(
    Object.keys(packages),
    pkg => {
      console.log(`resolving dist-tag for package: ${pkg}`);
      return npm.distTag.ls(pkg).then(tags => {
        Object.entries(tags).forEach(([tag, ver]) => {
          packages[pkg].tags[tag] = ver;
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

export default nexusList;
