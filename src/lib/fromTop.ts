import npmTop from '../utils/npmTop';
import fromName from './fromName';

export default async function fromTop(n: number) {
  const packages = await npmTop(n);
  return fromName(packages);
}
