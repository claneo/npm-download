const path = require('path');
const npm = require('./utils/npm');

const resolveDependencies = require('./utils/resolveDependencies');
const packagesList = require('./utils/packageList');
// const fromInput = require('./fromInput');
// const fromPackageJson = require('./fromPackageJson');
// const fromPackageLockJson = require('./fromPackageLockJson');
// const fromTop = require('./fromTop');

const program = require('commander');
const configUtil = require('./utils/config');
const nexusList = require('./utils/nexusList');

program.version(require('./package.json').version);

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
    fromPackageJson(path.join(dir, 'package.json'));
  });

program
  .command('lock <dir>')
  .description('read from package-lock.json in dir')
  .action(dir => {
    fromPackageLockJson(path.resolve(dir, 'package-lock.json'));
  });

program
  .command('name <packages...>')
  .description('read from package names')
  .action(packages => {
    // fromInput(packages);
    resolveDependencies(packages).then(r => {
      console.log(packagesList.diffVersions(configUtil.get().packages, r));
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
  .command('type')
  .description('read from type-registry')
  .action(() => {});

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
  .command('upload')
  .description('upload packages in current dir')
  .action(() => {});

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.outputHelp();
}
