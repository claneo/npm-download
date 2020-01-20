export default async function asyncQueue<T>(
  arr: T[],
  iterator: (item: T) => void | Promise<unknown>,
  limit = 10,
) {
  const queue: Promise<unknown>[] = [];
  while (arr.length || queue.length) {
    for (let i = queue.length; i < limit && arr.length; i += 1) {
      const promise = Promise.resolve(iterator(arr.shift() as T));
      promise.then(() => {
        const index = queue.indexOf(promise);
        queue.splice(index, 1);
      });
      queue.push(promise);
    }
    await Promise.race(queue);
  }
}
