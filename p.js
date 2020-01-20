const path = require('path');
const pacote = require('pacote');
const cacache = require('cacache');
const fs = require('fs');

var cacheExtra = process.platform === 'win32' ? 'npm-cache' : '.npm';
var cacheRoot = (process.platform === 'win32' && process.env.APPDATA) || home;
var cache = path.resolve(cacheRoot, cacheExtra, '_cacache');

const package = 'cesium';

// pacote.tarball.file('cesium',path.resolve(__dirname, './cesium.tgz'))
process.on('log', (level, content) => console.log(level, content));
pacote.manifest(package, { cache }).then(data => {
  // console.log(data);
  pacote.tarball.stream(
    package,
    str =>
      new Promise((res, rej) => {
        const writer = fs.createWriteStream(
          path.resolve(__dirname, './cesium.tgz'),
        );
        str.on('error', er => writer.emit('error', er));
        writer.on('error', er => rej(er));
        writer.on('close', () => res({}));
        str.pipe(writer);
      }),
    {
      resolved: data._resolved,
      integrity: data._integrity,
      cache,
    },
  );
});
