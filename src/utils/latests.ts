import semver from 'semver';
import packageString from './packageString';

export default (list: string[]) => {
  const latest: Record<string, string> = {};
  list.forEach(item => {
    const { name, version } = packageString(item);

    if (!latest[name] || semver.gt(version, latest[name]))
      latest[name] = version;
  });
  return latest;
};
