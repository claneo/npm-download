import * as rwFile from './rwFile';

export const get = () => {
  return (
    rwFile.get('./nexusRepo.json') || {
      nexusUrl: '',
      repoName: '',
      packages: {},
    }
  );
};
export const set = (changed: any) => {
  const config = get();
  Object.assign(config, changed);
  rwFile.set('./nexusRepo.json', config);
};
