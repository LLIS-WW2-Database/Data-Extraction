async function mapWithConcurrency(items, concurrency, iterator) {
  const values = Array.isArray(items) ? items : [];
  const workerCount = Math.max(1, Number.parseInt(concurrency, 10) || 1);
  const results = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= values.length) {
        return;
      }

      results[currentIndex] = await iterator(values[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(workerCount, values.length) }, () => worker()),
  );

  return results;
}

module.exports = {
  mapWithConcurrency,
};
