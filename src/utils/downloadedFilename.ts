export default function downloadedFilename(pkg: string) {
  return (
    pkg
      .replace(/^@/, '')
      .replace('/', '-')
      .replace('@', '-') + '.tgz'
  );
}
