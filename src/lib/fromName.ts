import resolveDependencies from '../utils/resolveDependencies';
import download from '../utils/download';

export default async function fromName(packages: string[], withDeps?: boolean) {
  const r = await resolveDependencies(packages, withDeps);
  download(r);
}
