import program from 'commander';
import {
  configRepo,
  configUrl,
  fromJson,
  fromLock,
  fromName,
  fromTop,
  fromTypes,
  list,
  upload,
  starList,
  starAdd,
  starRemove,
  starUpdate,
} from './';
import { setRegistry } from './utils/npm';

export default function cli() {
  program.version(require('../package.json').version);

  program.option('-d, --dry-run', 'run without install');

  program.option('-r, --registry <url>', 'set registry');

  program.option('--no-diff', 'run without diff.json');

  program
    .command('config-nexus <url>')
    .description('config nexus url')
    .action(configUrl);

  program
    .command('config-repo <repo>')
    .description('config nexus repo name')
    .action(configRepo);

  program
    .command('json <dir>')
    .description('read from package.json in dir')
    .action(fromJson);

  program
    .command('lock <dir>')
    .description('read from package-lock.json in dir')
    .action(fromLock);

  program
    .command('name <packages...>')
    .description('read from package names')
    .action(fromName);

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
    .action(fromTypes);

  program
    .command('list')
    .description('list existing package and save to nexusRepo.json')
    .action(list);

  const starCommand = program
    .command('star')
    .description('manage star packages');

  starCommand
    .command('list')
    .description('list')
    .action(starList);

  starCommand
    .command('add <packages...>')
    .description('add')
    .action(starAdd);

  starCommand
    .command('remove <packages...>')
    .description('remove')
    .action(starRemove);

  starCommand
    .command('update')
    .description('update')
    .action(starUpdate);

  program
    .command('upload')
    .description('upload packages in current dir')
    .action(upload);

  program.parse(process.argv);

  if (program.opts().registry) setRegistry(program.opts().registry);
}
