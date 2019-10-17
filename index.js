const path = require('path');
const npm = require('./utils/npm');
const rwFile = require('./utils/rwFile');

const resolveDependencies = require('./utils/resolveDependencies');
const packagesList = require('./utils/packageList');
// const fromInput = require('./fromInput');
// const fromPackageJson = require('./fromPackageJson');
// const fromPackageLockJson = require('./fromPackageLockJson');
// const fromTop = require('./fromTop');

const program = require('commander');
const configUtil = require('./utils/config');
const nexusList = require('./utils/nexusList');
const download = require('./utils/download');
const getTypesRegistry = require('./utils/types');
const upload = require('./utils/upload');

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
  .command('upload')
  .description('upload packages in current dir')
  .action(() => {
    upload();
  });

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.outputHelp();
}
