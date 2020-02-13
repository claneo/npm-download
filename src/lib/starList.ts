import { get } from '../utils/config';

export default function starList() {
  const stars: string[] = get().stars || [];
  stars.forEach(star => console.log(star));
}
