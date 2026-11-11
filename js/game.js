/* Game runtime: UI, input, rendering loop, hints, progression.
 * The ONLY thing persisted in the browser is the current level number (localStorage key below). */
(function (HO) {
  const KEY = 'hiddenObjectsLevel';
  const $ = (id) => document.getElementById(id);
  const cv = $('scene'), ctx = cv.getContext('2d');
  const viewport = $('viewport'), stage = $('stage');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const S = {
    level: 1, L: null, theme: null, layout: null, items: [], targets: [], dynamic: [],
    found: new Set(), running: false, elapsed: 0, hints: 0, hintTimer: 0, hintFx: null,
    ripples: [], misses: 0, scale: 1, unlocked: false, staticCv: null, clock: 0,
  };

  // ---- persistence (level number only) ------------------------------------
  function loadLevel() {
    try {
      const v = parseInt(localStorage.getItem(KEY), 10);
      if (v >= 1 && v <= HO.LEVELS.length) return v;
    } catch (e) { /* storage unavailable */ }
    return 1;
  }
  function saveLevel(n) { try { localStorage.setItem(KEY, String(n)); } catch (e) { /* ignore */ } }

  // ---- overlay cards -------------------------------------------------------
  function showCard(html, buttons) {
    const card = $('card');
    card.innerHTML = html;
    const box = document.createElement('div');
    box.className = 'btns';
    buttons.forEach((b) => {
      const el = document.createElement('button');
      el.className = 'btn' + (b.primary ? ' primary' : '');
      el.textContent = b.label;
      el.addEventListener('click', () => { hideCard(); b.onClick(); });
      box.appendChild(el);
    });
    card.appendChild(box);
    $('overlay').hidden = false;
    const first = box.querySelector('button');
    if (first) first.focus();
  }
  function hideCard() { $('overlay').hidden = true; }

  // ---- sprites -------------------------------------------------------------
  function spriteFor(it) {
    const th = S.theme;
    if (it.role === 'clutter') {
      return HO.sprite(it.shape, HO.mutedPalette(th.muted[it.mute]), th.dark ? '#0b0a1a' : '#2b2118');
    }
    const light = it.hue === 'black' || th.dark;
    const pal = HO.huePalette(it.hue, th);
    const outline = light ? HO.mix(pal.light, '#ffffff', 0.55) : '#1b1320';
    return HO.sprite(it.shape, pal, outline);
  }

  function posOf(it) {
    if (!it.lane) return { x: it.x, y: it.y, flip: false };
    const travel = it.lane.x1 - it.lane.x0;
    if (reduceMotion) return { x: it.lane.x0 + travel / 2, y: it.y, flip: false };
    const u = ((S.clock * 14) / travel + it.phase) % 2;
    const f = u < 1 ? u : 2 - u;
    return { x: Math.round(it.lane.x0 + f * travel), y: it.y, flip: u >= 1 };
  }

  // ---- level setup -----------------------------------------------------------
  function startLevel(n) {
    S.level = n;
    S.L = HO.LEVELS[n - 1];
    S.theme = HO.THEMES[S.L.theme];
    S.layout = HO.layout(S.L);
    S.items = S.layout.items;
    S.targets = S.layout.targets;
    S.found = new Set();
    S.unlocked = false;
    S.running = false;
    S.elapsed = 0;
    S.clock = 0;
    S.misses = 0;
    S.ripples = [];
    S.hintFx = null;
    S.hintMax = S.L.hints;
    S.hints = S.L.hints;
    S.hintTimer = 0;
    S.items.forEach((it) => { it.sprite = spriteFor(it); });

    const W = S.layout.W, H = S.layout.H;
    cv.width = W; cv.height = H;
    S.dynamic = S.items.filter((it) => it.lane || (it.flags && it.flags.gated));
    const bg = HO.renderBackground(S.theme, W, H, S.layout.rows, S.L.id * 31 + 5);
    const sc = document.createElement('canvas');
    sc.width = W; sc.height = H;
    const g = sc.getContext('2d');
    g.drawImage(bg, 0, 0);
    S.items.forEach((it) => { if (!S.dynamic.includes(it)) g.drawImage(it.sprite.canvas, it.x, it.y); });
    S.staticCv = sc;

    $('lvlNum').textContent = 'LEVEL ' + n + ' / ' + HO.LEVELS.length;
    $('lvlName').textContent = S.L.name;
    $('timer').classList.remove('over');
    buildList();
    updateHud();
    fitView();
    viewport.scrollLeft = 0; viewport.scrollTop = 0;
    setStatus('');

    const hintTxt = S.L.hints === Infinity ? 'Unlimited hints.' : S.L.hints + ' hints, one recharges every ' + S.L.recharge + 's.';
    const parTxt = S.L.par ? 'Par time ' + HO.fmtTime(S.L.par) + ' (just a goal, nothing bad happens).' : 'No timer pressure.';
    showCard('<h2>Level ' + n + '</h2><h1 style="font-size:22px">' + S.L.name + '</h1><p>' + S.L.blurb + '</p>' +
      '<p class="small">Find ' + S.targets.length + ' objects. ' + hintTxt + ' ' + parTxt + '</p>',
      [{ label: 'Start', primary: true, onClick: () => { S.running = true; } }]);
  }

  function buildList() {
    const list = $('list');
    list.innerHTML = '';
    list.classList.toggle('compact', S.targets.length > 12);
    S.targets.forEach((t) => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.dataset.id = t.id;
      const ic = document.createElement('canvas');
      ic.width = t.sprite.w; ic.height = t.sprite.h;
      ic.getContext('2d').drawImage(t.sprite.canvas, 0, 0);
      const k = S.targets.length > 12 ? 2 : Math.max(2, Math.min(4, Math.floor(30 / Math.max(t.sprite.w, t.sprite.h)) + 1));
      ic.style.width = t.sprite.w * k + 'px'; ic.style.height = t.sprite.h * k + 'px';
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = t.label;
      chip.append(ic, label);
      if (t.flags.moving) { const m = document.createElement('span'); m.className = 'tag'; m.textContent = '↔'; m.title = 'This one moves'; chip.append(m); }
      if (t.flags.gated) chip.classList.add('locked');
      list.appendChild(chip);
    });
  }
  function refreshChips() {
    S.targets.forEach((t) => {
      const chip = document.querySelector('.chip[data-id="' + t.id + '"]');
      if (!chip) return;
      chip.classList.toggle('found', S.found.has(t.id));
      chip.classList.toggle('locked', !!(t.flags.gated && !S.unlocked && !S.found.has(t.id)));
    });
  }

  // ---- sizing ----------------------------------------------------------------
  function fitView() {
    const vw = S.L.view[0], vh = S.L.view[1];
    const aw = Math.max(120, stage.clientWidth - 22), ah = Math.max(100, stage.clientHeight - 22);
    // Integer scale keeps pixels crisp; on small screens never go below 2x (the scene scrolls instead).
    S.scale = Math.max(2, Math.floor(Math.min(aw / vw, ah / vh)));
    cv.style.width = cv.width * S.scale + 'px';
    cv.style.height = cv.height * S.scale + 'px';
    viewport.style.width = Math.min(vw * S.scale, cv.width * S.scale) + 'px';
    viewport.style.height = Math.min(vh * S.scale, cv.height * S.scale) + 'px';
  }
  window.addEventListener('resize', () => { if (S.L) fitView(); });

  // ---- status / HUD ------------------------------------------------------------
  let statusTimer = 0;
  function setStatus(msg, cls) {
    const el = $('status');
    el.textContent = msg || ' ';
    el.className = cls || '';
    clearTimeout(statusTimer);
    if (msg) statusTimer = setTimeout(() => setStatus(''), 2600);
  }
  function updateHud() {
    $('count').textContent = S.found.size + '/' + S.targets.length;
    const t = $('timer');
    t.textContent = HO.fmtTime(S.elapsed) + (S.L.par ? ' / ' + HO.fmtTime(S.L.par) : '');
    t.classList.toggle('over', !!S.L.par && S.elapsed > S.L.par);
    const b = $('hintBtn');
    if (S.hintMax === Infinity) { b.textContent = 'Hint ∞'; b.disabled = !S.running; }
    else {
      const next = S.hints < S.hintMax ? ' (' + Math.ceil(S.L.recharge - S.hintTimer) + 's)' : '';
      b.textContent = 'Hint ' + S.hints + '/' + S.hintMax + next;
      b.disabled = !S.running || S.hints <= 0;
    }
    b.classList.toggle('pulse', S.running && S.misses >= 8 && !b.disabled);
  }

  // ---- input -------------------------------------------------------------------
  function toWorld(e) {
    const r = cv.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * cv.width, y: ((e.clientY - r.top) / r.height) * cv.height };
  }
  const inside = (b, x, y, pad) => x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - pad && y <= b.y + b.h + pad;
  const boxOf = (it) => { const p = posOf(it); return { x: p.x, y: p.y, w: it.w, h: it.h }; };
  const locked = (it) => it.flags && it.flags.gated && !S.unlocked;

  function hitTest(x, y) {
    for (const t of S.targets) {
      if (S.found.has(t.id) || locked(t)) continue;
      if (inside(boxOf(t), x, y, 1)) return { kind: 'target', it: t };
    }
    for (let i = S.items.length - 1; i >= 0; i--) {
      const it = S.items[i];
      if (it.role === 'herring' && inside(it, x, y, 0)) return { kind: 'herring', it };
    }
    return { kind: 'miss' };
  }

  cv.addEventListener('click', (e) => {
    if (suppressClick || !S.running) return;
    const p = toWorld(e);
    const h = hitTest(p.x, p.y);
    if (h.kind === 'target') return found(h.it);
    S.misses++;
    S.ripples.push({ x: p.x, y: p.y, t: S.clock, bad: h.kind === 'herring' });
    if (h.kind === 'herring') { HO.audio.decoy(); setStatus('Not quite - that one is a decoy!', 'bad'); }
    else { HO.audio.miss(); setStatus(S.misses >= 8 ? 'Stuck? Try a hint.' : 'Nothing there.', ''); }
  });

  // Mouse drag-to-pan (touch uses native scrolling).
  let drag = null, suppressClick = false;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, sl: viewport.scrollLeft, st: viewport.scrollTop, moved: false };
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 6) { drag.moved = true; viewport.classList.add('dragging'); }
    if (drag.moved) { viewport.scrollLeft = drag.sl - dx; viewport.scrollTop = drag.st - dy; }
  });
  window.addEventListener('pointerup', () => {
    if (drag && drag.moved) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); }
    drag = null; viewport.classList.remove('dragging');
  });

  // ---- finding -----------------------------------------------------------------
  function found(t) {
    S.found.add(t.id);
    S.misses = 0;
    HO.audio.found();
    setStatus('Found: ' + t.label + '!', 'good');
    if (S.hintFx && S.hintFx.it === t) S.hintFx = null;
    const gated = S.targets.find((x) => x.flags.gated);
    const remaining = S.targets.length - S.found.size;
    if (gated && !S.unlocked && remaining === 1 && !S.found.has(gated.id)) {
      S.unlocked = true;
      HO.audio.unlock();
      setTimeout(() => setStatus('Something glows among the shelves... ✨', 'good'), 900);
    }
    refreshChips();
    updateHud();
    if (remaining === 0) complete();
  }

  function complete() {
    S.running = false;
    const n = S.level, last = n >= HO.LEVELS.length;
    saveLevel(last ? 1 : n + 1);
    setTimeout(() => {
      HO.audio.win();
      const time = HO.fmtTime(S.elapsed);
      if (last) {
        showCard('<h1>THE END</h1><h2>You found The Hidden Book!</h2><p>All ' + HO.LEVELS.length + ' levels cleared.</p><p class="small">Final level time: ' + time + '</p>',
          [{ label: 'Play again from Level 1', primary: true, onClick: () => startLevel(1) }, { label: 'Title screen', onClick: showTitle }]);
      } else {
        const par = S.L.par && S.elapsed <= S.L.par ? ' <br>Under par!' : '';
        showCard('<h2>Level ' + n + ' complete!</h2><p>' + S.L.name + '</p><p>Time: <b>' + time + '</b>' + par + '</p>',
          [{ label: 'Next level', primary: true, onClick: () => startLevel(n + 1) }, { label: 'Title screen', onClick: showTitle }]);
      }
    }, 700);
  }

  // ---- hints -------------------------------------------------------------------
  function useHint() {
    if (!S.running || (S.hintMax !== Infinity && S.hints <= 0)) return;
    const cand = S.targets.filter((t) => !S.found.has(t.id) && !locked(t));
    if (!cand.length) return;
    const cx = (viewport.scrollLeft + viewport.clientWidth / 2) / S.scale;
    const cy = (viewport.scrollTop + viewport.clientHeight / 2) / S.scale;
    cand.sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy));
    const t = cand[0];
    const p = posOf(t);
    viewport.scrollTo({
      left: Math.max(0, (p.x + t.w / 2) * S.scale - viewport.clientWidth / 2),
      top: Math.max(0, (p.y + t.h / 2) * S.scale - viewport.clientHeight / 2),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
    S.hintFx = { it: t, t0: S.clock };
    if (S.hintMax !== Infinity) S.hints--;
    S.misses = 0;
    HO.audio.hint();
    updateHud();
  }
  $('hintBtn').addEventListener('click', useHint);

  // ---- drawing -----------------------------------------------------------------
  function ring(cx, cy, rx, ry, color) {
    ctx.fillStyle = color;
    const seen = new Set();
    const steps = Math.ceil((rx + ry) * 5);
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const x = Math.round(cx + Math.cos(a) * rx), y = Math.round(cy + Math.sin(a) * ry);
      const k = x + ',' + y;
      if (!seen.has(k)) { seen.add(k); ctx.fillRect(x, y, 1, 1); }
    }
  }
  function drawItem(it) {
    const p = posOf(it);
    if (p.flip) {
      ctx.save(); ctx.translate(p.x + it.w, p.y); ctx.scale(-1, 1);
      ctx.drawImage(it.sprite.canvas, 0, 0); ctx.restore();
    } else ctx.drawImage(it.sprite.canvas, Math.round(p.x), Math.round(p.y));
  }
  function draw() {
    ctx.drawImage(S.staticCv, 0, 0);
    S.dynamic.forEach((it) => {
      if (locked(it)) return;
      drawItem(it);
      if (it.flags.gated && !S.found.has(it.id)) { // gentle glow so the unlocked book is noticeable
        const b = boxOf(it), pulse = 3 + Math.round(Math.sin(S.clock * 4) * 1.5);
        ring(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 + pulse, b.h / 2 + pulse, '#fff3a0');
      }
    });
    S.targets.forEach((t) => {
      if (!S.found.has(t.id)) return;
      const b = boxOf(t);
      ring(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 + 3, b.h / 2 + 3, '#0b2a14');
      ring(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 + 2, b.h / 2 + 2, '#4cff8a');
    });
    if (S.hintFx) {
      const age = S.clock - S.hintFx.t0;
      if (age > 4) S.hintFx = null;
      else {
        const b = boxOf(S.hintFx.it), r = 4 + ((age * 14) % 14);
        ring(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 + 2 + r * 0.5, b.h / 2 + 2 + r * 0.5, '#ffd23f');
        ring(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 + 2, b.h / 2 + 2, '#ffffff');
      }
    }
    S.ripples = S.ripples.filter((r) => S.clock - r.t < 0.5);
    S.ripples.forEach((r) => { const k = (S.clock - r.t) / 0.5; ring(r.x, r.y, 2 + k * 9, 2 + k * 9, r.bad ? '#ff6b6b' : '#ffffff'); });
  }

  let last = performance.now(), hudTick = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (S.L) {
      S.clock += dt;
      if (S.running) {
        S.elapsed += dt;
        if (S.hintMax !== Infinity && S.hints < S.hintMax) {
          S.hintTimer += dt;
          if (S.hintTimer >= S.L.recharge) { S.hints++; S.hintTimer = 0; }
        }
        hudTick += dt;
        if (hudTick > 0.2) { hudTick = 0; updateHud(); }
      }
      draw();
    }
    requestAnimationFrame(frame);
  }

  // ---- menus -------------------------------------------------------------------
  function showTitle() {
    S.running = false;
    const n = loadLevel();
    const btns = [{ label: n > 1 ? 'Continue - Level ' + n : 'Play', primary: true, onClick: () => startLevel(n) }];
    if (n > 1) btns.push({ label: 'Start over from Level 1', onClick: () => { saveLevel(1); startLevel(1); } });
    showCard('<h1>HIDDEN<br>OBJECTS</h1><p>Ten hand-pixeled scenes, generated fresh by code. Find everything on your list - but beware of lookalikes.</p>' +
      '<p class="small">Click an object to find it. Drag to look around. Your progress is just a level number saved in this browser.</p>', btns);
  }
  function showMenu() {
    if (!S.L) return;
    const was = S.running;
    S.running = false;
    showCard('<h2>Paused</h2><p class="small">Level ' + S.level + ': ' + S.L.name + '</p>', [
      { label: 'Resume', primary: true, onClick: () => { S.running = was; } },
      { label: 'Restart this level', onClick: () => startLevel(S.level) },
      { label: 'Title screen', onClick: showTitle },
    ]);
  }
  $('menuBtn').addEventListener('click', showMenu);
  $('muteBtn').addEventListener('click', () => {
    HO.audio.setMuted(!HO.audio.isMuted());
    $('muteBtn').textContent = 'Sound: ' + (HO.audio.isMuted() ? 'off' : 'on');
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('overlay').hidden) showMenu();
    if ((e.key === 'h' || e.key === 'H') && $('overlay').hidden) useHint();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && S.running) showMenu(); });

  HO.debug = { S, startLevel, hitTest, posOf, boxOf, loadLevel };
  showTitle();
  requestAnimationFrame(frame);
})(window.HO);
