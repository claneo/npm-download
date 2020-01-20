import path from 'path';
import fromName from './fromName';

type LockJson = { dependencies: Record<string, LockJson>; version: string };
export default function fromLock(dir: string) {
  const packageLockJson = require(path.join(dir, 'package-lock.json'));
  const packages: string[] = [];
  function handleDependencies(pkg: LockJson) {
    if (pkg.dependencies) {
      Object.entries(pkg.dependencies).forEach(
        ([subPackageName, subPackageInfo]) => {
          const subPackage = subPackageName + '@' + subPackageInfo.version;
          if (!packages.includes(subPackage)) packages.push(subPackage);
          handleDependencies(subPackageInfo);
        },
      );
    }
  }
  handleDependencies(packageLockJson);
  return fromName(packages, false);
}
