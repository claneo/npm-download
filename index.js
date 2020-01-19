const path = require('path');
const program = require('commander');

const resolveDependencies = require('./utils/resolveDependencies');
const packagesList = require('./utils/packageList');
const configUtil = require('./utils/config');
const nexusList = require('./utils/nexusList');
const download = require('./utils/download');
const getTypesRegistry = require('./utils/types');
const upload = require('./utils/upload');

program.version(require('./package.json').version);

program.option('-d, --dry-run', 'run without install');

program
  .command('config-nexus <url>')
  .description('config nexus url')
  .action(url => {
    configUtil.set({ nexusUrl: url });
  });

program
  .command('config-repo <repo>')
  .description('config nexus repo name')
  .action(repo => {
    configUtil.set({ repoName: repo });
  });

program
  .command('json <dir>')
  .description('read from package.json in dir')
  .action(dir => {
    const packageJson = require(path.join(dir, 'package.json'));
    let packages = [];
    if (packageJson.dependencies)
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        packages.push(name + '@' + version);
      });
    if (packageJson.devDependencies)
      Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
        packages.push(name + '@' + version);
      });
    console.log(packages);
    resolveDependencies(packages).then(r => {
      download(r);
    });
  });

program
  .command('lock <dir>')
  .description('read from package-lock.json in dir')
  .action(dir => {
    const packageLockJson = require(path.join(dir, 'package-lock.json'));
    const packages = [];
    function handleDependencies(package) {
      if (package.dependencies) {
        Object.entries(package.dependencies).forEach(
          ([subPackageName, subPackageInfo]) => {
            const subPackage = subPackageName + '@' + subPackageInfo.version;
            if (!packages.includes(subPackage)) packages.push(subPackage);
            handleDependencies(subPackageInfo);
          },
        );
      }
    }
    handleDependencies(packageLockJson);
    resolveDependencies(packages, false);
  });

program
  .command('name <packages...>')
  .description('read from package names')
  .action(packages => {
    resolveDependencies(packages).then(r => {
      download(r);
    });
  });

const defaultTop = 200;
program
  .command('top [n]')
  .description(`read from top (default top ${defaultTop})`)
  .action((n = defaultTop) => {
    fromTop(n);
  });

program
  .command('types')
  .description('read from types-registry')
  .action(async () => {
    const typesPackages = await getTypesRegistry();
    const typesRegistry = await resolveDependencies(['types-registry']);
    download(packagesList.merge(typesPackages, typesRegistry));
  });

program
  .command('list')
  .description('list existing package and save to nexusRepo.json')
  .action(() => {
    const { nexusUrl, repoName } = configUtil.get();
    if (typeof nexusUrl !== 'string' || typeof repoName !== 'string') {
      console.log('config first');
    } else
      nexusList(nexusUrl, repoName).then(packages => {
        configUtil.set({ packages });
      });
  });

program
  .command('add')
  .description('read from types-registry')
  .action(async () => {
    //
  });

program
  .command('upgrade')
  .description('read from types-registry')
  .action(async () => {
    //
  });

program
  .command('upload')
  .description('upload packages in current dir')
  .action(() => {
    upload();
  });

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.outputHelp();
}
