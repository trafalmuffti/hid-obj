/* Pixel-art sprite library.
 *
 * Every object is a small ASCII grid. Letters map to colours:
 *   a = main hue   A = light shade   d = dark shade   (recoloured per use)
 *   w white  k black  e eye  y yellow  r red  n green  b brown  g grey  q orange  p pink
 * A 1px outline is added automatically. One grid therefore yields every colour variant,
 * which is how red herrings (same shape / other hue, same hue / other shape) are made.
 */
(function (HO) {
  const SHAPES = (HO.SHAPES = {});
  const def = (key, name, rows) => { SHAPES[key] = { key, name, rows }; };

  def('teapot', 'teapot', [
    '.....dd......',
    '....aaaa.....',
    '..aaaaaaaa...',
    'a.aAAaaaaaaaa',
    'aaaAaaaaaa..a',
    '.aaaaaaaaa..a',
    '..aaaaaaaaaa.',
    '..dddddddd...']);
  def('duck', 'rubber duck', [
    '....aaa...',
    '...aaaaa..',
    '...aeaaqq.',
    '...aaaaa..',
    'a..aaaa...',
    'aa.aaaaaa.',
    'aaaaaAAaaa',
    '.aaaaaaaa.',
    '..aaaaaa..']);
  def('key', 'key', [
    '.aaa........',
    'aaAaa.......',
    'aa.aaaaaaaaa',
    'aaAaa..a.a.a',
    '.aaa...a.a.a']);
  def('apple', 'apple', [
    '.....b.nn',
    '.....bnn.',
    '..aaabaa.',
    '.aAAaaaaa',
    '.aAaaaaaa',
    '.aaaaaaaa',
    '.aaaaaaaa',
    '..aaaaaa.',
    '...a..a..']);
  def('cat', 'cat figurine', [
    '.a....a....',
    '.aa..aa....',
    '.aaaaaa....',
    '.aeaaea....',
    '.aapaaa....',
    '..aaaa.....',
    '.aaaaaa....',
    '.aaAAaaa...',
    '.aaAAaaa.aa',
    '.aaaaaaa.a.',
    '.dddddddaa.']);
  def('cupcake', 'cupcake', [
    '....r.....',
    '...aaa....',
    '..aAaaa...',
    '.aaaaaaa..',
    'aaaAaaaaa.',
    '.bwbwbwb..',
    '.bwbwbwb..',
    '..bwbwb...']);
  def('egg', 'egg', [
    '...aa...',
    '..aAaa..',
    '.aAaaaa.',
    '.aaaaaa.',
    'aaaaaaaa',
    'aaaaaaaa',
    '.aaaaaa.',
    '..dddd..']);
  def('mug', 'mug', [
    'aaaaaaaa..',
    'aAaaaaaaaa',
    'aAaaaaa..a',
    'aaaaaaa..a',
    'aaaaaaaaaa',
    'aaaaaaaa..',
    'dddddddd..']);
  def('bell', 'bell', [
    '....aa....',
    '...aaaa...',
    '..aAaaaa..',
    '..aAaaaa..',
    '.aAaaaaaa.',
    '.aaaaaaaa.',
    'aaaaaaaaaa',
    'dddddddddd',
    '....yy....']);
  def('glove', 'mitten', [
    '...aaaa...',
    '..aAaaaa..',
    '..aAaaaa..',
    'a.aaaaaa..',
    'aaaaaaaaa.',
    '.aaaaaaa..',
    '..aaaaa...',
    '..wwwww...',
    '..wwwww...']);
  def('lantern', 'lantern', [
    '...dddd...',
    '..d....d..',
    '..dddddd..',
    '.daaaaaad.',
    '.daAaaaad.',
    '.daaaaaad.',
    '.daaaaaad.',
    '.dddddddd.',
    '...dddd...']);
  def('bottle', 'bottle', [
    '...bb...',
    '...dd...',
    '...aa...',
    '..aAaa..',
    '.aAaaaa.',
    '.aAaaaa.',
    '.aaaaaa.',
    '.aaaaaa.',
    '.aaaaaa.',
    '..dddd..']);
  def('watch', 'clock', [
    '....aa....',
    '...aaaa...',
    '..aaaaaa..',
    '.aawwkwaa.',
    '.aawwkwaa.',
    '.aawkkwaa.',
    '.aawwwwaa.',
    '..aaaaaa..',
    '...aaaa...']);
  def('boot', 'boot', [
    '..aaaa....',
    '..aAaa....',
    '..aaaa....',
    '..aaaa....',
    '..aaaaa...',
    '.aaaaaaaaa',
    'aaaaaaaaaa',
    'dddddddddd']);
  def('umbrella', 'umbrella', [
    '....aa....',
    '..aaaaaa..',
    '.aaAaaaaa.',
    'aaAaaaaaaa',
    'aaaAaaAaaa',
    'aAaaaaaaAa',
    '....b.....',
    '....b.....',
    '....b.....',
    '...bb.....']);
  def('heart', 'heart', [
    '.aa..aa.',
    'aaAaaaaa',
    'aAaaaaaa',
    'aaaaaaaa',
    '.aaaaaa.',
    '..aaaa..',
    '...aa...']);
  def('book', 'book', [
    '.aaaaaaaa.',
    'daaaaaaaa.',
    'daAAaaaaw.',
    'daaayyaaw.',
    'daaaaaaaw.',
    'daaaaaaaw.',
    '.wwwwwwww.']);
  def('crab', 'crab', [
    'a........a',
    'aa......aa',
    'a.aaaaaa.a',
    '..aeaaea..',
    '.aaaaaaaa.',
    'aaAaaaaaaa',
    '.aaaaaaaa.',
    '.a.a..a.a.']);
  def('balloon', 'balloon', [
    '..aaaa..',
    '.aAAaaa.',
    '.aAaaaaa',
    '.aaaaaaa',
    '.aaaaaaa',
    '..aaaaa.',
    '...aaa..',
    '....d...',
    '....g...',
    '...g....',
    '....g...']);
  def('coin', 'coin', [
    '..dddd..',
    '.daaaad.',
    'daAAaaad',
    'daAaddad',
    'daaaaaad',
    '.daaaad.',
    '..dddd..']);
  def('shell', 'seashell', [
    '...aaaa...',
    '.aaAaAaaa.',
    'aaAaaaAaaa',
    'aaAaaaaAaa',
    '.aaaaaaaa.',
    '..aadaad..',
    '...dddd...']);
  def('bird', 'bird', [
    '..aaa.....',
    '.aaaaa....',
    '.aeaaqq...',
    '.aaaaa....',
    'aaaaaaaa..',
    'aaAAaaaaaa',
    '.aaaaaaaa.',
    '..aaaaaa..',
    '...q..q...']);
  def('banana', 'banana', [
    '.........aa',
    '........aaa',
    '.......aaa.',
    '......aaaa.',
    '.....aaaa..',
    '..aaaaaa...',
    'aaaaaaa....',
    '.aaaa......']);
  def('tophat', 'top hat', [
    '..dddddd..',
    '..aaaaaa..',
    '..aAaaaa..',
    '..aaaaaa..',
    '..rrrrrr..',
    '..aaaaaa..',
    'aaaaaaaaaa',
    'dddddddddd']);
  def('star', 'starfish', [
    '....aa....',
    '....aa....',
    'aaaaaaaaaa',
    '.aaAAaaaa.',
    '..aaaaaa..',
    '..aaaaaa..',
    '.aaa..aaa.',
    '.aa....aa.']);
  def('anchor', 'anchor', [
    '...aaaa...',
    '...a..a...',
    '...aaaa...',
    '....aa....',
    'aaaaaaaaaa',
    '....aa....',
    '....aa....',
    'a...aa...a',
    'aa..aa..aa',
    '.aaaaaaaa.']);
  def('fish', 'fish', [
    '..aaaa.....a',
    '.aaAaaaa..aa',
    'aaeaaaaaaaaa',
    'aaaaaaaaaaaa',
    '.aaaaaaa..aa',
    '..aaaa.....a']);
  def('wand', 'wand', [
    '.........yy.',
    '........yAy.',
    '.......aaa..',
    '......aaa...',
    '.....aaa....',
    '....aaa.....',
    '...aaa......',
    '..aaa.......',
    '.bbb........',
    'bbb.........']);
  def('flask', 'flask', [
    '...ww...',
    '...aa...',
    '...aa...',
    '..aAaa..',
    '.aAaaaa.',
    'aaaaaaaa',
    'aaaaaaaa',
    '.dddddd.']);
  def('feather', 'feather', [
    '........aa',
    '.......aaa',
    '......aaaA',
    '.....aaaa.',
    '....aaaa..',
    '...aaaa...',
    '..aaaa....',
    '.aaaa.....',
    'bb........']);
  def('mushroom', 'mushroom', [
    '..aaaaaa..',
    '.aaAAaaaa.',
    'aaAwaawaaa',
    'aaaaaaaaaa',
    '...wwww...',
    '...wwww...',
    '...wwww...']);
  def('wizhat', 'wizard hat', [
    '.....a....',
    '....aa....',
    '....aA....',
    '...aaaa...',
    '...aAaa...',
    '..aaaaaa..',
    '..rrrrrr..',
    'aaaaaaaaaa']);
  def('hourglass', 'hourglass', [
    '.bbbbbbbb.',
    '..wwwwww..',
    '...wwww...',
    '....aa....',
    '....aa....',
    '...aaaa...',
    '..aaaaaa..',
    '.bbbbbbbb.']);
  def('ring', 'ring', [
    '...ww...',
    '..wwww..',
    '...aa...',
    '.aa..aa.',
    'aa....aa',
    'a......a',
    'aa....aa',
    '.aa..aa.',
    '..aaaa..']);
  def('butterfly', 'butterfly', [
    'aa..k.k..aa',
    'aaaa.k.aaaa',
    'aAaaakaaaaA',
    'aaaaakaaaaa',
    '.aaakkkaaa.',
    '.aaaakaaaa.',
    '..aa.k.aa..']);
  def('gem', 'gem', [
    '..AAAA..',
    '.AaaaAa.',
    'AaaAaaaa',
    '.aaaaaa.',
    '..aaaa..',
    '...aa...']);
  def('kite', 'kite', [
    '....a....',
    '...aAa...',
    '..aAaaa..',
    '.aAaaaaa.',
    '..aaaaa..',
    '...aaa...',
    '....a....',
    '....g....',
    '...g.....',
    '....g....']);
  def('bear', 'teddy bear', [
    'aa....aa',
    'aaa..aaa',
    '.aaaaaa.',
    '.aeaaea.',
    '.aaqqaa.',
    '..aaaa..',
    '.aaaaaa.',
    'aaAaaaaa',
    'aaaaaaaa',
    '.aa..aa.']);
  def('flower', 'flower', [
    '..aaa...',
    '.aaAaa..',
    'aaayaaa.',
    '.aaaaa..',
    '..aaa...',
    '...n....',
    '..nn....',
    '...n.n..',
    '...nn...']);
  def('sword', 'sword', [
    '.........aa',
    '........aaa',
    '.......aaa.',
    '......aaa..',
    '.....aaa...',
    '.y..aaa....',
    '..yaaa.....',
    '...yy......',
    '..b.yy.....',
    '.b.........']);
  def('envelope', 'envelope', [
    'aaaaaaaaaa',
    'aAaaaaaaAa',
    'aaAaaaaAaa',
    'aaaAaaAaaa',
    'aaaaAAaaaa',
    'aaaaaaaaaa',
    'aaaaaaaaaa']);
  def('candle', 'candle', [
    '....y...',
    '...yq...',
    '....w...',
    '...aaa..',
    '...aAa..',
    '...aaa..',
    '...aaa..',
    '..aaaaa.']);
  def('box', 'gift box', [
    '..ww.ww...',
    '...www....',
    'aaaawwaaaa',
    'aAaawwaaaa',
    'wwwwwwwwww',
    'aaaawwaaaa',
    'aaaawwaaaa',
    'dddddddddd']);
  def('mouse', 'mouse', [
    '.aa..aa...',
    'aaaa.aaa..',
    'aaaaaaaaa.',
    'aeaaaaaaaa',
    'aaaaaaaaa.',
    '.aaaaaaa.p',
    '..dd.dd.pp']);
  def('suitcase', 'suitcase', [
    '...bbbb...',
    '..b....b..',
    'aaaaaaaaaa',
    'aAaaaaaaaa',
    'aaayyayyaa',
    'aaaaaaaaaa',
    'aaaaaaaaaa',
    'dddddddddd']);
  def('crown', 'crown', [
    'a....a....a',
    'aa..aaa..aa',
    'aaaaaaaaaaa',
    'aAaaaaaaaaa',
    'aaawawawaaa',
    'aaaaaaaaaaa',
    'ddddddddddd']);
  def('goblet', 'goblet', [
    'aaaaaaaa',
    'aAaaaaaa',
    'aAaaaaaa',
    '.aaaaaa.',
    '..aaaa..',
    '...aa...',
    '...aa...',
    '.aaaaaa.']);

  // ---- colours -------------------------------------------------------------
  HO.HUES = {
    red:    { name: 'Red',    main: '#e8353b', light: '#ff8f8f', dark: '#9c1c2a' },
    orange: { name: 'Orange', main: '#ff8a1c', light: '#ffc266', dark: '#b34d00' },
    yellow: { name: 'Yellow', main: '#ffe033', light: '#fff7a8', dark: '#c49a0a' },
    gold:   { name: 'Gold',   main: '#e6b422', light: '#fbe38a', dark: '#8f6a0c' },
    green:  { name: 'Green',  main: '#34c24a', light: '#9bf08f', dark: '#1b7a30' },
    teal:   { name: 'Teal',   main: '#12bdb0', light: '#8ff2e8', dark: '#0a7476' },
    blue:   { name: 'Blue',   main: '#2d6cff', light: '#94b8ff', dark: '#1a3f9e' },
    purple: { name: 'Purple', main: '#9a4dff', light: '#d2a6ff', dark: '#5a22aa' },
    pink:   { name: 'Pink',   main: '#ff6cb4', light: '#ffb8de', dark: '#b02f70' },
    white:  { name: 'White',  main: '#f7f7fb', light: '#ffffff', dark: '#a9abc2' },
    black:  { name: 'Black',  main: '#3b3b4d', light: '#6c6c82', dark: '#15151f' },
    brown:  { name: 'Brown',  main: '#a5662c', light: '#d9a066', dark: '#5b3210' },
    silver: { name: 'Silver', main: '#b9c6d3', light: '#f0f6fb', dark: '#6f7d8f' },
  };
  // Hues in the same group are too close to be told apart, so a herring never uses one.
  const GROUP = { gold: 'yellow', silver: 'white' };
  HO.hueGroup = (h) => GROUP[h] || h;
  // Shapes in the same family have similar silhouettes, so same-hue herrings avoid them.
  HO.SIMILAR = [
    ['bird', 'fish', 'duck'], ['mug', 'goblet', 'teapot', 'flask', 'bottle'],
    ['coin', 'watch', 'egg', 'ring'], ['sword', 'wand', 'feather', 'candle'],
    ['mushroom', 'umbrella'], ['crab', 'star', 'butterfly'], ['heart', 'apple', 'gem'],
    ['book', 'envelope', 'box', 'suitcase'], ['bell', 'tophat', 'wizhat', 'crown'],
  ];
  HO.similarShapes = (a, b) => a === b || HO.SIMILAR.some((g) => g.includes(a) && g.includes(b));

  const FIXED = { w: '#fdfdfd', k: '#1b1b26', e: '#1b1b26', y: '#ffd92e', r: '#e23b3b', n: '#3faa4a',
                  b: '#8a5528', g: '#9aa0ac', q: '#ff8c1a', p: '#ff8fc0' };

  HO.huePalette = (hue, theme) => {
    const base = (theme && theme.hueOverride && theme.hueOverride[hue]) || HO.HUES[hue];
    return { main: base.main, light: base.light, dark: base.dark, fixed: FIXED };
  };
  // Muted palette for background clutter: low saturation, tinted toward the scene.
  HO.mutedPalette = (base) => {
    const fixed = {};
    Object.keys(FIXED).forEach((k) => { fixed[k] = HO.mix(FIXED[k], base, 0.65); });
    return { main: base, light: HO.mix(base, '#ffffff', 0.22), dark: HO.mix(base, '#000000', 0.3), fixed };
  };

  HO.defaultLabel = (shape, hue) => HO.HUES[hue].name + ' ' + SHAPES[shape].name;
  HO.shapeDims = (shape) => {
    const rows = SHAPES[shape].rows;
    return { w: Math.max.apply(null, rows.map((r) => r.length)) + 2, h: rows.length + 2 };
  };

  // ---- rendering -----------------------------------------------------------
  const cache = new Map();
  HO.sprite = function (shape, pal, outline) {
    const key = [shape, pal.main, pal.fixed.w, outline].join('|');
    if (cache.has(key)) return cache.get(key);
    const rows = SHAPES[shape].rows;
    const { w, h } = HO.shapeDims(shape);
    const grid = [];
    for (let y = 0; y < h; y++) grid.push(new Array(w).fill(null));
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.') continue;
        grid[y + 1][x + 1] = ch === 'a' ? pal.main : ch === 'A' ? pal.light : ch === 'd' ? pal.dark : pal.fixed[ch];
      }
    });
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d');
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let c = grid[y][x];
        if (!c) {
          const n = (grid[y - 1] && grid[y - 1][x]) || (grid[y + 1] && grid[y + 1][x]) || grid[y][x - 1] || grid[y][x + 1];
          if (n) c = outline;
        }
        if (c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); }
      }
    }
    const out = { canvas: cv, w, h };
    cache.set(key, out);
    return out;
  };
})(window.HO);
