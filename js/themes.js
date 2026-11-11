/* Scene themes + the procedural background painter. */
(function (HO) {
  const T = (HO.THEMES = {});
  T.kitchen = {
    bands: [
      { to: 0.72, c0: '#f6e8c8', c1: '#eed9ab', pat: 'lines', pc: '#e6cf9c' },
      { to: 1, c0: '#d3ab72', c1: '#c8a066', pat: 'checker', pc: '#e9dcc2' }],
    plank: '#9a6a35', decor: ['window', 'window'], windowSky: '#a8dcff',
    muted: ['#bda98a', '#a9a58f', '#c7b99c', '#9f9c8e', '#b99f82', '#aaa89f'],
  };
  T.attic = {
    bands: [{ to: 1, c0: '#76879b', c1: '#4d5a6c', pat: 'lines', pc: '#6a7a8e' }],
    plank: '#6d4b30', decor: ['bulb', 'window'], windowSky: '#cfe6ff',
    muted: ['#8d97a6', '#a39a8c', '#7e8795', '#b0a79a', '#6f7a89', '#98907f'],
  };
  T.boardwalk = {
    bands: [
      { to: 0.38, c0: '#78c8ff', c1: '#cdeeff' },
      { to: 0.62, c0: '#2f86c9', c1: '#58b0e8', pat: 'waves', pc: '#8fd0f5' },
      { to: 1, c0: '#f0dba4', c1: '#e3c98a', pat: 'dots', pc: '#d6b97a' }],
    plank: '#a27040', decor: ['cloud', 'cloud', 'cloud'],
    muted: ['#d9c7a2', '#c5bcae', '#b6c2c8', '#cdb9ae', '#b2c0b4', '#c9bbc6'],
  };
  T.study = {
    bands: [{ to: 1, c0: '#1d1a40', c1: '#2e2766', pat: 'brick', pc: '#272257' }],
    plank: '#5c3c28', decor: ['star', 'window', 'window', 'star'], windowSky: '#101a4a', dark: true,
    muted: ['#5b5190', '#6a6196', '#514886', '#7a6fa0', '#463d78', '#65598c'],
  };
  T.market = {
    bands: [{ to: 1, c0: '#15122b', c1: '#2e1c3e', pat: 'lines', pc: '#1d1836' }],
    plank: '#523426', decor: ['lanternstring', 'star'], dark: true,
    muted: ['#6e4a60', '#7a5a50', '#5a4a6a', '#80605a', '#665068', '#705860'],
  };
  T.greenhouse = {
    bands: [{ to: 1, c0: '#3b7f58', c1: '#4f9a6a', pat: 'panes', pc: '#7fd0a4' }],
    plank: '#e4e0cf', decor: ['window'], windowSky: '#bfeede',
    muted: ['#7ea890', '#8fb8a0', '#6f9a82', '#9cbcae', '#7da28a', '#88aa8a'],
  };
  T.workshop = {
    bands: [{ to: 1, c0: '#85541f', c1: '#613616', pat: 'lines', pc: '#74461a' }],
    plank: '#3c220e', decor: ['bulb', 'clockface', 'clockface'],
    muted: ['#b8905a', '#a07a48', '#c9a06a', '#8e6c40', '#b09068', '#9a7850'],
  };
  T.station = {
    bands: [
      { to: 0.7, c0: '#98958f', c1: '#77746f', pat: 'brick', pc: '#85827c' },
      { to: 1, c0: '#605e60', c1: '#4e4c50', pat: 'checker', pc: '#6a686c' }],
    plank: '#3e3e46', decor: ['arch', 'arch', 'window'], windowSky: '#d8e4ec',
    muted: ['#a8a49c', '#8f8c88', '#b8b0a0', '#7e7c80', '#9c9488', '#aaa5a8'],
  };
  T.sea = {
    bands: [
      { to: 0.88, c0: '#2a86a8', c1: '#0c3a5a', pat: 'dots', pc: '#3a9ab8' },
      { to: 1, c0: '#b2a070', c1: '#8e7e56', pat: 'dots', pc: '#a08e62' }],
    plank: '#5e4636', decor: ['ray', 'ray', 'bubble', 'bubble', 'bubble'], dark: true,
    hueOverride: { red: { main: '#ff5a28', light: '#ffa27a', dark: '#a82a10' } },
    muted: ['#4f8a9c', '#5f98a6', '#437a8c', '#6aa0a8', '#52869a', '#5f8a94'],
  };
  T.library = {
    bands: [{ to: 1, c0: '#704826', c1: '#4e2e16', pat: 'lines', pc: '#5e3a1c' }],
    plank: '#2f1b0c', decor: ['window', 'window', 'window'], windowSky: '#7ac0d8', stained: true,
    muted: ['#9a6a42', '#a87850', '#8a5c38', '#b08058', '#7c5232', '#946848'],
  };

  function disc(g, cx, cy, r, color) {
    g.fillStyle = color;
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + 1) g.fillRect(cx + x, cy + y, 1, 1);
  }

  function pattern(g, b, y0, h, W, r) {
    if (!b.pat) return;
    g.save();
    g.fillStyle = b.pc;
    g.globalAlpha = 0.7;
    if (b.pat === 'lines') {
      for (let x = 3; x < W; x += 8) g.fillRect(x, y0, 1, h);
    } else if (b.pat === 'brick') {
      for (let y = 0; y < h; y += 6) {
        g.fillRect(0, y0 + y, W, 1);
        for (let x = (y / 6) % 2 ? 0 : 6; x < W; x += 12) g.fillRect(x, y0 + y, 1, 6);
      }
    } else if (b.pat === 'checker') {
      for (let y = 0; y < h; y += 8) for (let x = 0; x < W; x += 8) if (((x + y) / 8) % 2 === 0) g.fillRect(x, y0 + y, 8, Math.min(8, h - y));
    } else if (b.pat === 'panes') {
      for (let x = 0; x < W; x += 24) g.fillRect(x, y0, 1, h);
      for (let y = 0; y < h; y += 24) g.fillRect(0, y0 + y, W, 1);
    } else if (b.pat === 'dots') {
      for (let i = 0; i < (W * h) / 38; i++) g.fillRect(r.int(0, W - 1), y0 + r.int(0, h - 1), 1, 1);
    } else if (b.pat === 'waves') {
      for (let y = 3; y < h; y += 6) for (let x = r.int(0, 8); x < W; x += 14) g.fillRect(x, y0 + y, 5, 1);
    }
    g.restore();
  }

  const DECOR = {
    window(g, x, y, theme, r) {
      const w = 22, h = 26;
      g.fillStyle = '#4e3220'; g.fillRect(x - 2, y - 2, w + 4, h + 4);
      if (theme.stained) {
        const cols = ['#d94f4f', '#4f8fd9', '#e0c040', '#4fb070'];
        for (let i = 0; i < 4; i++) { g.fillStyle = HO.mix(cols[(i + r.int(0, 3)) % 4], '#4e2e16', 0.5); g.fillRect(x + (i % 2) * 11, y + Math.floor(i / 2) * 13, 11, 13); }
      } else {
        g.fillStyle = theme.windowSky || '#bde'; g.fillRect(x, y, w, h);
        g.fillStyle = '#ffffff'; g.globalAlpha = 0.35; g.fillRect(x + 2, y + 2, 4, 10); g.globalAlpha = 1;
      }
      g.fillStyle = '#4e3220'; g.fillRect(x + 10, y, 2, h); g.fillRect(x, y + 12, w, 2);
    },
    bulb(g, x, y) {
      g.fillStyle = '#222'; g.fillRect(x, 0, 1, y);
      g.globalAlpha = 0.18; disc(g, x, y + 2, 11, '#fff0a0'); g.globalAlpha = 0.3; disc(g, x, y + 2, 7, '#fff0a0'); g.globalAlpha = 1;
      disc(g, x, y + 2, 3, '#fff6c0');
    },
    cloud(g, x, y) {
      g.fillStyle = '#ffffff'; g.globalAlpha = 0.85;
      g.fillRect(x, y + 4, 26, 5); g.fillRect(x + 4, y + 1, 12, 4); g.fillRect(x + 12, y, 8, 3); g.globalAlpha = 1;
    },
    star(g, x, y, theme, r) {
      for (let i = 0; i < 9; i++) { g.fillStyle = r.chance(0.5) ? '#ffffff' : '#b9c4ff'; g.fillRect(x + r.int(-40, 40), y + r.int(-12, 30), 1, 1); }
    },
    lanternstring(g, x, y, theme, r, W) {
      g.fillStyle = '#3a2a30'; g.fillRect(0, y, W, 1);
      for (let lx = r.int(2, 10); lx < W; lx += 18) { g.fillStyle = '#7a4430'; g.fillRect(lx, y + 1, 1, 3); disc(g, lx, y + 6, 3, '#8a4f36'); }
    },
    clockface(g, x, y) {
      disc(g, x, y, 9, '#4a2c12'); disc(g, x, y, 8, '#c8aa78'); g.fillStyle = '#4a2c12';
      g.fillRect(x, y - 6, 1, 6); g.fillRect(x, y, 4, 1);
    },
    arch(g, x, y, theme) {
      g.fillStyle = HO.mix(theme.bands[0].c0, '#000', 0.25); g.fillRect(x, y + 6, 30, 70);
      disc(g, x + 15, y + 6, 15, HO.mix(theme.bands[0].c0, '#000', 0.25));
      g.fillStyle = '#c6d6e0'; g.fillRect(x + 5, y + 8, 20, 70); disc(g, x + 15, y + 8, 10, '#c6d6e0');
    },
    ray(g, x, y, theme, r, W, H) {
      g.save(); g.globalAlpha = 0.08; g.fillStyle = '#ffffff';
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 14, 0); g.lineTo(x + 50, H); g.lineTo(x + 18, H); g.closePath(); g.fill(); g.restore();
    },
    bubble(g, x, y, theme, r) {
      g.fillStyle = '#9adbe8'; g.globalAlpha = 0.55;
      for (let i = 0; i < 4; i++) { const bx = x + r.int(-14, 14), by = y + r.int(-10, 24), s = r.int(2, 4); g.fillRect(bx, by, s, 1); g.fillRect(bx, by + s, s, 1); g.fillRect(bx - 1, by + 1, 1, s - 1); g.fillRect(bx + s, by + 1, 1, s - 1); }
      g.globalAlpha = 1;
    },
  };

  HO.renderBackground = function (theme, W, H, rows, seed) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const r = HO.makeRand(seed);
    let y0 = 0;
    theme.bands.forEach((b) => {
      const y1 = Math.round(H * b.to);
      for (let y = y0; y < y1; y++) {
        const t = (y - y0) / Math.max(1, y1 - y0 - 1);
        g.fillStyle = HO.mix(b.c0, b.c1, Math.round(t * 4) / 4);
        g.fillRect(0, y, W, 1);
      }
      pattern(g, b, y0, y1 - y0, W, r);
      y0 = y1;
    });
    // Scenery, scattered across the whole (possibly scrolling) world.
    const n = Math.max(theme.decor.length, Math.round(W / 110));
    for (let i = 0; i < n; i++) {
      const kind = theme.decor[i % theme.decor.length];
      const x = Math.floor(((i + 0.5) / n) * (W - 40)) + r.int(0, 20);
      const y = kind === 'bulb' ? r.int(10, 24) : kind === 'lanternstring' ? r.int(4, 10) : r.int(4, Math.max(5, Math.floor(H * 0.35)));
      DECOR[kind](g, x, y, theme, r, W, H);
    }
    // Ledges the objects sit on.
    rows.forEach((y) => {
      g.fillStyle = theme.plank; g.fillRect(0, y, W, 2);
      g.fillStyle = HO.mix(theme.plank, '#ffffff', 0.25); g.fillRect(0, y, W, 1);
      g.fillStyle = '#000'; g.globalAlpha = 0.3; g.fillRect(0, y + 2, W, 1); g.globalAlpha = 1;
    });
    return c;
  };
})(window.HO);
