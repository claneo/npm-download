module.exports = (arr, iterator, limit = 10) =>
  new Promise(resolve => {
    let step = 0;
    function exec(i) {
      if (step < arr.length) {
        step += 1;
        iterator(arr[i]).then(() => {
          exec(step);
        });
      } else resolve();
    }
    for (let i = 0; i < arr.length && i < limit; i += 1) {
      exec(i);
    }
  });
