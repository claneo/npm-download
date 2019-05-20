const nexusList = require('./utils/nexusList');
const fs = require('fs');
const path = require('path');

nexusList(
  'http://192.168.10.200:8081/service/rest/v1/components?repository=npm-hosted'
).then(list => {
  fs.writeFileSync(
    path.resolve(__dirname, './list.json'),
    JSON.stringify(
      list
        .map(item => {
          if (item.group)
            return '@' + item.group + '/' + item.name + '@' + item.version;
          return item.name + '@' + item.version;
        })
        .sort(),
      undefined,
      4
    )
  );
});
