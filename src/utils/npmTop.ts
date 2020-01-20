import https from 'https';
import asyncQueue from './asyncQueue';

type SearchResult = {
  package: {
    name: string;
    version: string;
  };
}[];

const search = (size: number, from: number) =>
  new Promise<SearchResult>(resolve => {
    https.get(
      `https://registry.npmjs.com/-/v1/search?text=boost-exact:false&popularity=1.0&quality=1.0&maintenance=1.0&size=${size}&from=${from}`,
      res => {
        let result = '';
        res.on('data', data => {
          result += data.toString();
        });
        res.on('close', () => {
          resolve(JSON.parse(result).objects);
        });
      },
    );
  });

export default (top = 250) => {
  const requests = [];
  for (let i = 0; i < top; i += 250) {
    if (top - i < 250) requests.push({ size: top - i, from: i });
    else requests.push({ size: 250, from: i });
  }
  const result: string[] = [];
  return asyncQueue(requests, ({ size, from }) =>
    search(size, from).then(packages =>
      result.push(
        ...packages.map(item => `${item.package.name}@${item.package.version}`),
      ),
    ),
  ).then(() => result);
};
