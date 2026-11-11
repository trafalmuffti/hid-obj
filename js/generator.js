/* Procedural scene layout. Pure data (no canvas): given a level, returns every item's position.
 *
 * Roles:  target  - on the list, always findable
 *         herring - a deliberate decoy: same shape/other hue OR same hue/other shape as a target
 *         clutter - muted background props
 * Rules enforced while placing:
 *  - targets are spread evenly across the screen-width sections of the world
 *  - anything may cover at most `occ` of a target's bounding box
 *  - no herring is ever identical (shape + hue family) to any target
 *  - clutter is drawn from muted colours so it never competes with saturated targets/decoys
 */
(function (HO) {
  HO.layout = function (L) {
    const rnd = HO.makeRand(L.id * 7919 + 13);
    const W = L.world[0], H = L.world[1], VW = L.view[0];
    const rows = [];
    for (let y = 20; y <= H - 4; y += L.rowGap) rows.push(y);

    const boxes = [];
    const items = [];
    let nextId = 0;
    const area = (b) => b.w * b.h;
    const inter = (a, b) => {
      const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      return w > 0 && h > 0 ? w * h : 0;
    };

    function canPlace(b) {
      if (b.x < 2 || b.y < 2 || b.x + b.w > W - 2 || b.y + b.h > H - 2) return false;
      for (const e of boxes) {
        const i = inter(b, e);
        if (b.role === 'lane' || e.role === 'lane') { if (i > 0) return false; continue; }
        const bt = b.role === 'target', et = e.role === 'target';
        if (bt && et) {
          if (i > 0) return false;
          if (Math.hypot(b.x + b.w / 2 - e.x - e.w / 2, b.y + b.h / 2 - e.y - e.h / 2) < 28) return false;
          continue;
        }
        if (!i) continue;
        if (bt || et) { if (i / area(bt ? b : e) > L.occ) return false; }
        else if (i / Math.min(area(b), area(e)) > L.overlap) return false;
      }
      return true;
    }

    function add(role, shape, x, y, extra) {
      const d = HO.shapeDims(shape);
      const it = Object.assign({ id: nextId++, role, shape, x, y, w: d.w, h: d.h }, extra || {});
      items.push(it);
      return it;
    }

    // ---- 1. targets --------------------------------------------------------
    const T = L.targets.map((t, i) => ({ shape: t[0], hue: t[1], label: t[2] || HO.defaultLabel(t[0], t[1]), flags: t[3] || {}, idx: i }));
    const sections = Math.max(1, Math.ceil(W / VW));
    const secW = W / sections;
    const targetItems = [];
    rnd.shuffle(T).forEach((t, k) => {
      const d = HO.shapeDims(t.shape);
      const lane = t.flags.moving ? 56 : 0;
      const sec = k % sections;
      for (let a = 0; a < 3000; a++) {
        const wide = a > 800; // fall back to anywhere in the world
        const row = rnd.pick(rows);
        const lo = wide ? 4 : Math.floor(secW * sec) + 4;
        const hi = wide ? W - d.w - lane - 4 : Math.floor(secW * (sec + 1)) - d.w - lane - 4;
        if (hi <= lo) continue;
        const x = rnd.int(lo, hi);
        const y = row - d.h;
        const box = { x, y, w: d.w + lane, h: d.h, role: lane ? 'lane' : 'target' };
        if (!canPlace(box)) continue;
        boxes.push(box);
        const it = add('target', t.shape, x, y, {
          hue: t.hue, label: t.label, flags: t.flags, order: t.idx, row,
          lane: lane ? { x0: x, x1: x + lane } : null, phase: rnd.next() * 2,
        });
        targetItems.push(it);
        return;
      }
      throw new Error('Could not place target ' + t.label + ' on level ' + L.id);
    });
    targetItems.sort((a, b) => a.order - b.order);

    // ---- 2. red herrings ---------------------------------------------------
    const pairs = T.map((t) => ({ s: t.shape, g: HO.hueGroup(t.hue) }));
    const isTargetPair = (s, h) => pairs.some((p) => p.s === s && p.g === HO.hueGroup(h));
    const hueKeys = Object.keys(HO.HUES);
    const shapeKeys = Object.keys(HO.SHAPES);
    targetItems.forEach((t) => {
      for (let k = 0; k < L.herrings; k++) {
        let shape = t.shape, hue = t.hue;
        if (k % 2 === 0) { // same shape, different hue
          const c = hueKeys.filter((h) => HO.hueGroup(h) !== HO.hueGroup(t.hue) && !isTargetPair(t.shape, h));
          hue = rnd.pick(c);
        } else {          // same hue, different shape
          const c = shapeKeys.filter((s) => !HO.similarShapes(s, t.shape) && !isTargetPair(s, t.hue));
          shape = rnd.pick(c);
        }
        const d = HO.shapeDims(shape);
        const near = rnd.chance(0.65);
        for (let a = 0; a < 300; a++) {
          const row = near ? rnd.pick(rows.filter((r) => Math.abs(r - t.row) <= L.rowGap * 2)) : rnd.pick(rows);
          const cx = t.x + t.w / 2;
          const x = near ? Math.round(cx + rnd.int(-70, 70) - d.w / 2) : rnd.int(2, W - d.w - 2);
          const box = { x, y: row - d.h, w: d.w, h: d.h, role: 'herring' };
          if (!canPlace(box)) continue;
          boxes.push(box);
          add('herring', shape, x, box.y, { hue, row });
          break;
        }
      }
    });

    // ---- 3. muted clutter fills the ledges --------------------------------
    rows.forEach((row) => {
      let x = rnd.int(2, 8);
      while (x < W - 10) {
        const shape = rnd.pick(shapeKeys);
        const d = HO.shapeDims(shape);
        const box = { x, y: row - d.h, w: d.w, h: d.h, role: 'clutter' };
        if (canPlace(box)) {
          boxes.push(box);
          add('clutter', shape, x, box.y, { mute: rnd.int(0, 5), row });
          x += d.w + rnd.int(L.gap[0], L.gap[1]);
        } else x += 3;
      }
    });

    // Painter's order: lower on screen is in front; targets win ties.
    const rank = { clutter: 0, herring: 1, target: 2 };
    items.sort((a, b) => (a.y + a.h) - (b.y + b.h) || rank[a.role] - rank[b.role] || a.id - b.id);
    return { items, targets: targetItems, rows, W, H };
  };
})(window.HO);
