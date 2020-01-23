export default async function asyncQueue<T, U = unknown>(
  arr: T[],
  iterator: (item: T) => Promise<U>,
  limit = 10,
) {
  const queue: Promise<U>[] = [];
  const results: U[] = [];
  while (arr.length || queue.length) {
    for (let i = queue.length; i < limit && arr.length; i += 1) {
      const promise = Promise.resolve<U>(iterator(arr.shift() as T));
      promise.then(result => {
        results.push(result);
        const index = queue.indexOf(promise);
        queue.splice(index, 1);
      });
      queue.push(promise);
    }
    await Promise.race(queue);
  }
  return results;
}
