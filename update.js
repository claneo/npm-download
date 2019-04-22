const path = require('path');
const fs = require('fs');
const { pack, publish, view } = require('./npmApi');
const updateList = require('./update.json');

// (function update(i = 0) {
//   if (i < updateList.length)
//     pack(updateList[i], path.resolve(__dirname, './tmp')).then(() =>
//       update(i + 1)
//     );
// })();

fs.readdir(path.resolve(__dirname, './tmp'), (err, files) => {
  if (!err) {
    (function upload(i = 0) {
      if (i < files.length) {
        publish(path.resolve(__dirname, './tmp', files[i])).then(() =>
          upload(i + 1)
        );
      }
    })();
  }
});
