module.exports = pkg =>
  pkg
    .replace(/^@/, '')
    .replace('/', '-')
    .replace('@', '-') + '.tgz';
