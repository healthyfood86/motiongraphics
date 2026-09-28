// Deterministic PRNG — renders happen across parallel headless-Chrome
// workers, so anything randomized (particle fields, sparkle positions)
// must be seeded, never Math.random(), or frames won't match between workers.
export function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededArray<T>(seed: number, count: number, fn: (rand: () => number, i: number) => T): T[] {
  const rand = mulberry32(seed);
  const out: T[] = [];
  for (let i = 0; i < count; i++) out.push(fn(rand, i));
  return out;
}
