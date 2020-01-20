import { set } from '../utils/config';

export function configUrl(url: string) {
  set({ nexusUrl: url });
}

export function configRepo(repo: string) {
  set({ repoName: repo });
}
