module.exports = (arr, iterator, limit = 10) =>
  new Promise(resolve => {
    let step = 0;
    let doing = 0;
    function exec(i) {
      if (step < arr.length) {
        step += 1;
        doing += 1;
        iterator(arr[i]).then(() => {
          doing -= 1;
          exec(step);
        });
      } else if (doing === 0) {
        resolve();
      }
    }
    for (let i = 0; i < arr.length && i < limit; i += 1) {
      exec(i);
    }
  });
