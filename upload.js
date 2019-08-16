const fs = require('fs').promises;
const path = require('path');
const npmApi = require('./utils/npmApi');
const asyncPool = require('./utils/asyncPool');

fs.readdir(path.resolve(__dirname, './download/old'))
  .then(files =>
    asyncPool(
      files.map(item => path.resolve(__dirname, './download/old', item)),
      item => {
        console.log('uploading old package: ' + item);
        return npmApi.publish(item, true);
      }
    )
  )
  .then(() => fs.readdir(path.resolve(__dirname, './download/latest')))
  .then(files =>
    asyncPool(
      files.map(item => path.resolve(__dirname, './download/latest', item)),
      item => {
        console.log('uploading latest package: ' + item);
        return npmApi.publish(item);
      }
    )
  );
