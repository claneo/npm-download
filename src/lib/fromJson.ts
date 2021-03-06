import path from 'path';
import { get } from '../utils/rwFile';
import fromName from './fromName';

export default function fromJson(dir: string) {
  const packageJson = get(path.join(dir, 'package.json'));
  let packages: string[] = [];
  if (packageJson.dependencies)
    Object.entries(packageJson.dependencies).forEach(([name, version]) => {
      packages.push(name + '@' + version);
    });
  if (packageJson.devDependencies)
    Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
      packages.push(name + '@' + version);
    });
  console.log(packages);
  return fromName(packages);
}
