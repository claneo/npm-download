import libnpmconfig from 'libnpmconfig';
import program from 'commander';

let resolved = false;

let config: Record<string, string> = {};

const getRegistry = (): string => {
  if (program.opts().registry) return program.opts().registry;
  if (resolved) return config.registry;
  config = libnpmconfig.read();
  resolved = true;
  return getRegistry();
};
export default getRegistry;
