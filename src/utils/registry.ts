import libnpmconfig from 'libnpmconfig';

let resolved = false;

let config: Record<string, string> = {};

const getRegistry = (): string => {
  if (resolved) return config.registry;
  config = libnpmconfig.read();
  resolved = true;
  return getRegistry();
};
export default getRegistry;
