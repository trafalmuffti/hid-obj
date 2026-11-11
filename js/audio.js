/* Tiny WebAudio blips. No audio files. */
(function (HO) {
  let ac = null;
  let muted = false;
  function ctx() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(f, d, type, v, t0, slideTo) {
    if (muted) return;
    const a = ctx();
    if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    const t = a.currentTime + (t0 || 0);
    o.type = type || 'square';
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.linearRampToValueAtTime(slideTo, t + d);
    g.gain.setValueAtTime(v || 0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(a.destination);
    o.start(t); o.stop(t + d + 0.03);
  }
  HO.audio = {
    found() { tone(660, 0.1); tone(880, 0.12, 'square', 0.06, 0.09); tone(1320, 0.18, 'square', 0.05, 0.2); },
    miss() { tone(140, 0.12, 'square', 0.07, 0, 90); },
    decoy() { tone(300, 0.08, 'triangle', 0.08); tone(220, 0.14, 'triangle', 0.08, 0.08); },
    hint() { tone(500, 0.3, 'sine', 0.09, 0, 1000); },
    unlock() { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.08, i * 0.08)); },
    win() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'square', 0.05, i * 0.12)); },
    setMuted(m) { muted = m; },
    isMuted() { return muted; },
  };
})(window.HO);
