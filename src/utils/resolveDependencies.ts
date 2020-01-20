import * as packageList from './packageList';
import asyncQueue from './asyncQueue';
import resolvePackage from './resolvePackage';
import readline from 'readline';

const resolveDependencies = async (packageNames: string[], withDeps = true) => {
  console.log('resolving dependencies...');

  const unresolvedSpecs = packageNames;
  const resolvedSpecs: string[] = [];
  const resolvedPackages = {};
  await asyncQueue(unresolvedSpecs, async spec => {
    if (!resolvedSpecs.includes(spec)) {
      resolvedSpecs.push(spec);
      const pkg = await resolvePackage(spec);
      packageList.addVersion(resolvedPackages, pkg.name, pkg.version);
      packageList.addTag(resolvedPackages, pkg.name, pkg['dist-tags']);

      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      const packageName = pkg.name + '@' + pkg.version;
      const info = `${unresolvedSpecs.length
        .toString()
        .padStart(4, ' ')} / ${resolvedSpecs.length
        .toString()
        .padStart(4, ' ')} ${packageName}`;
      process.stdout.write(info);
      if (pkg.dependencies && withDeps)
        Object.entries(pkg.dependencies).forEach(([dep, depVer]) => {
          const depName = dep + '@' + depVer;
          if (
            !unresolvedSpecs.includes(depName) &&
            !resolvedSpecs.includes(depName)
          )
            unresolvedSpecs.push(depName);
        });
    }
  });
  console.log('');
  return resolvedPackages;
};
export default resolveDependencies;

// resolveDependencies(["antd"]).then(console.log);
