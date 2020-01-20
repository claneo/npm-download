export default (pkg: string) =>
  pkg
    .replace(/^@/, '')
    .replace('/', '-')
    .replace('@', '-') + '.tgz';
