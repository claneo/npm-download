import getTypesRegistry from '../utils/types';
import resolveDependencies from '../utils/resolveDependencies';
import download from '../utils/download';
import { merge } from '../utils/packageList';

export default async function fromTypes() {
  const typesPackages = await getTypesRegistry();
  const typesRegistry = await resolveDependencies(['types-registry']);
  download(merge(typesPackages, typesRegistry));
}
