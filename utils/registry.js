const spawn = require('cross-spawn');

let resolved = '';

let registry = '';

const getRegistry = () => {
  if (resolved) return registry;
  const { output } = spawn.sync('npm', ['--json', 'config', 'ls'], {
    encoding: 'utf8',
  });
  // console.log(output);
  registry = JSON.parse(output[1]).registry;
  resolved = true;
  return registry;
};
module.exports = getRegistry;
