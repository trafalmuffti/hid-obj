/* Shared helpers: seeded RNG + colour mixing. Everything hangs off window.HO. */
window.HO = window.HO || {};
(function (HO) {
  // Seeded RNG (mulberry32) so a level always generates the same scene.
  HO.makeRand = function (seed) {
    let a = seed >>> 0;
    const next = () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
      next,
      int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
      pick: (arr) => arr[Math.floor(next() * arr.length)],
      chance: (p) => next() < p,
      shuffle: (arr) => {
        const o = arr.slice();
        for (let i = o.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [o[i], o[j]] = [o[j], o[i]];
        }
        return o;
      },
    };
  };

  const h2r = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  HO.mix = (a, b, t) => {
    const A = h2r(a), B = h2r(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  };
  HO.fmtTime = (s) => {
    s = Math.max(0, Math.floor(s));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };
})(window.HO);
