const fs = require('fs').promises;
const path = require('path');
const npmApi = require('./utils/npmApi');
const asyncPool = require('./utils/asyncPool');

Promise.all([
  fs.readdir(path.resolve(__dirname, './download/old')),
  fs.readdir(path.resolve(__dirname, './download/latest')),
])
  .then(([old, latest]) =>
    asyncPool(
      old
        .map(item => path.resolve(__dirname, './download/old', item))
        .concat(
          latest.map(item => path.resolve(__dirname, './download/latest', item))
        ),
      npmApi.publish
    )
  )
  .then(() =>
    asyncPool(require('./download/oldList.json'), item =>
      npmApi.pack(item, path.resolve(__dirname, './download/tmp'))
    )
  )
  .then(() => fs.readdir(path.resolve(__dirname, './download/tmp')))
  .then(files =>
    asyncPool(
      files.map(file => path.resolve(__dirname, './download/tmp', file)),
      npmApi.publish
    )
  );
