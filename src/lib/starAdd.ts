import { set, get } from '../utils/config';

export default function starAdd(packages: string[]) {
  const stars: string[] = get().stars || [];
  packages.forEach(pkg => {
    if (!stars.includes(pkg)) stars.push(pkg);
  });
  set({ stars });
}
