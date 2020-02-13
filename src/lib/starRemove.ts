import { set, get } from '../utils/config';

export default function starRemove(packages: string[]) {
  const stars: string[] = get().stars || [];
  packages.forEach(pkg => {
    const index = stars.indexOf(pkg);
    if (index !== -1) stars.splice(index, 1);
  });
  set({ stars });
}
