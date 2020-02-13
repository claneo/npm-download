import { get } from '../utils/config';
import fromName from './fromName';

export default function starUpdate() {
  const stars: string[] = get().stars || [];
  return fromName(stars);
}
