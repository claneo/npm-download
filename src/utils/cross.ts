export default function cross<T1, T2>(arr1: T1[], arr2: T2[]): [T1, T2][] {
  const result: [T1, T2][] = [];
  for (const v1 of arr1) {
    for (const v2 of arr2) {
      result.push([v1, v2]);
    }
  }
  return result;
}
