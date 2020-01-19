const asyncQueue = (arr, iterator, limit = 10) => {
  const queue = [];
  const exec = () => {
    for (let i = queue.length; i < limit && arr.length; i += 1) {
      const promise = Promise.resolve(iterator(arr.shift()));
      promise.then(() => {
        const index = queue.indexOf(promise);
        queue.splice(index, 1);
      });
      queue.push(promise);
    }
    if (arr.length || queue.length) return Promise.race(queue).then(exec);
    return Promise.resolve();
  };
  return exec();
};
module.exports = asyncQueue;
