import { get, set } from '../utils/config';
import nexusList from '../utils/nexusList';

export default async function list() {
  const { nexusUrl, repoName } = get();
  if (typeof nexusUrl !== 'string' || typeof repoName !== 'string') {
    console.log('config first');
  } else {
    const packages = await nexusList(nexusUrl, repoName);
    set({ packages });
  }
}
