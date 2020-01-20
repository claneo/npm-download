export default <T = unknown>(p: Promise<T>, timeout = 120_000) =>
  Promise.race<Promise<T>>([
    p,
    new Promise((_, reject) =>
      setTimeout(() => reject, timeout, [`time out after ${timeout / 1000}s`]),
    ),
  ]);
