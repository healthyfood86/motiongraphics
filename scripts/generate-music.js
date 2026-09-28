// Procedural score for the Renoworks showreel.
// 128 BPM -> beat = 60/128 = 0.46875s. 32 beats = exactly 15.000s (8 bars of 4/4).
// Fully hand-synthesized (no samples) so every hit lands on an exact, known timestamp
// that the Remotion timeline is choreographed against.

const fs = require('fs');

const SR = 44100;
const DURATION = 15.0;
const N = Math.round(SR * DURATION);
const BPM = 128;
const BEAT = 60 / BPM; // 0.46875

const L = new Float64Array(N);
const R = new Float64Array(N);

function t2i(t) { return Math.max(0, Math.round(t * SR)); }
function beat(n) { return n * BEAT; }

function addMono(startTime, samples, pan = 0.0, gain = 1.0) {
  const start = t2i(startTime);
  const lg = gain * (1 - Math.max(0, pan));
  const rg = gain * (1 + Math.min(0, pan));
  for (let i = 0; i < samples.length; i++) {
    const idx = start + i;
    if (idx >= N) break;
    L[idx] += samples[i] * lg;
    R[idx] += samples[i] * rg;
  }
}

function addStereo(startTime, sampL, sampR, gain = 1.0) {
  const start = t2i(startTime);
  for (let i = 0; i < sampL.length; i++) {
    const idx = start + i;
    if (idx >= N) break;
    L[idx] += sampL[i] * gain;
    R[idx] += sampR[i] * gain;
  }
}

// ---- primitives ----
function noiseBuf(dur) {
  const n = Math.round(dur * SR);
  const b = new Float64Array(n);
  for (let i = 0; i < n; i++) b[i] = Math.random() * 2 - 1;
  return b;
}

// one-pole lowpass
function lowpass(buf, cutoff) {
  const rc = 1 / (2 * Math.PI * cutoff);
  const a = 1 / SR / (rc + 1 / SR);
  const out = new Float64Array(buf.length);
  let y = 0;
  for (let i = 0; i < buf.length; i++) {
    y = y + a * (buf[i] - y);
    out[i] = y;
  }
  return out;
}
// one-pole highpass (complement)
function highpass(buf, cutoff) {
  const lp = lowpass(buf, cutoff);
  const out = new Float64Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = buf[i] - lp[i];
  return out;
}
function bandpass(buf, lo, hi) {
  return lowpass(highpass(buf, lo), hi);
}

function sweepFreqOsc(dur, f0, f1, shape = 'sine', curve = 'exp') {
  const n = Math.round(dur * SR);
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const x = i / n;
    const k = curve === 'exp' ? Math.pow(x, 0.35) : x;
    const f = f0 + (f1 - f0) * k;
    phase += (2 * Math.PI * f) / SR;
    let s;
    if (shape === 'sine') s = Math.sin(phase);
    else if (shape === 'saw') s = 2 * (((phase / (2 * Math.PI)) % 1)) - 1;
    else s = Math.sign(Math.sin(phase));
    out[i] = s;
  }
  return out;
}

function osc(freq, dur, shape = 'sine', detune = 0) {
  const n = Math.round(dur * SR);
  const out = new Float64Array(n);
  const f = freq * Math.pow(2, detune / 1200);
  for (let i = 0; i < n; i++) {
    const ph = (f * i) / SR;
    if (shape === 'sine') out[i] = Math.sin(2 * Math.PI * ph);
    else if (shape === 'saw') out[i] = 2 * (ph % 1) - 1;
    else if (shape === 'square') out[i] = Math.sign(Math.sin(2 * Math.PI * ph));
    else if (shape === 'tri') out[i] = 2 * Math.abs(2 * (ph % 1) - 1) - 1;
  }
  return out;
}

function envExpDecay(buf, tau, holdSamples = 0) {
  const out = new Float64Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    const t = Math.max(0, i - holdSamples) / SR;
    out[i] = buf[i] * Math.exp(-t / tau);
  }
  return out;
}

function envLinRamp(buf, attackSamples) {
  const out = new Float64Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    const a = attackSamples > 0 ? Math.min(1, i / attackSamples) : 1;
    out[i] = buf[i] * a;
  }
  return out;
}

function mulBuf(a, b) {
  const n = Math.min(a.length, b.length);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = a[i] * b[i];
  return out;
}

function scale(buf, g) {
  const out = new Float64Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = buf[i] * g;
  return out;
}

function addArr(a, b) {
  const n = Math.max(a.length, b.length);
  const out = new Float64Array(n);
  for (let i = 0; i < a.length; i++) out[i] += a[i];
  for (let i = 0; i < b.length; i++) out[i] += b[i];
  return out;
}

// ---- drum voices ----
function kick(gainMul = 1) {
  const dur = 0.28;
  const body = sweepFreqOsc(dur, 165, 48, 'sine', 'exp');
  const bodyEnv = envExpDecay(body, 0.11);
  const click = highpass(noiseBuf(0.012), 3000);
  const clickEnv = envExpDecay(click, 0.006);
  const clickPadded = new Float64Array(bodyEnv.length);
  for (let i = 0; i < clickEnv.length; i++) clickPadded[i] = clickEnv[i];
  const out = addArr(scale(bodyEnv, 1.0), scale(clickPadded, 0.6));
  return scale(out, 0.95 * gainMul);
}

function hat(open = false) {
  const dur = open ? 0.22 : 0.045;
  let n = highpass(noiseBuf(dur), 7500);
  n = lowpass(n, 14000);
  const env = envExpDecay(n, open ? 0.09 : 0.018);
  return scale(env, open ? 0.22 : 0.25);
}

function clap() {
  const dur = 0.18;
  const n = bandpass(noiseBuf(dur), 900, 3200);
  const env = envExpDecay(n, 0.05);
  const tone = osc(190, dur, 'sine');
  const toneEnv = envExpDecay(tone, 0.035);
  return scale(addArr(scale(env, 1.0), scale(toneEnv, 0.5)), 0.5);
}

function subBass(freq, dur, duckTimes) {
  const o = osc(freq, dur, 'sine');
  const o2 = osc(freq * 2, dur, 'sine');
  let mix = addArr(scale(o, 0.85), scale(o2, 0.15));
  mix = envLinRamp(mix, Math.round(0.008 * SR));
  const relStart = Math.max(0, mix.length - Math.round(0.05 * SR));
  for (let i = relStart; i < mix.length; i++) {
    const k = (mix.length - i) / (mix.length - relStart);
    mix[i] *= k;
  }
  return scale(mix, 0.55);
}

function pluck(freq, dur) {
  const o = osc(freq, dur, 'saw');
  const filtered = lowpass(o, 2600);
  const env = envExpDecay(filtered, 0.16);
  return scale(env, 0.32);
}

function padChord(freqs, dur, cutoffStart, cutoffEnd) {
  let mix = new Float64Array(Math.round(dur * SR));
  for (const f of freqs) {
    const a = osc(f, dur, 'saw', -6);
    const b = osc(f, dur, 'saw', 6);
    mix = addArr(mix, addArr(a, b));
  }
  const n = mix.length;
  const filtered = new Float64Array(n);
  // time-varying lowpass sweep via chunked filtering
  const chunks = 24;
  const chunkLen = Math.ceil(n / chunks);
  for (let c = 0; c < chunks; c++) {
    const s = c * chunkLen;
    const e = Math.min(n, s + chunkLen);
    const cutoff = cutoffStart + ((cutoffEnd - cutoffStart) * c) / (chunks - 1);
    const slice = mix.slice(s, e);
    const f = lowpass(slice, cutoff);
    for (let i = 0; i < f.length; i++) filtered[s + i] = f[i];
  }
  const env = envLinRamp(filtered, Math.round(0.35 * SR));
  return scale(env, 0.06);
}

function riser(dur, f0, f1, ampCurve = 'exp') {
  let n = bandpass(noiseBuf(dur), f0, f1);
  const withTone = addArr(scale(n, 1.0), scale(sweepFreqOsc(dur, f0, f1, 'saw'), 0.4));
  const N = withTone.length;
  const out = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const x = i / N;
    const a = ampCurve === 'exp' ? Math.pow(x, 2.2) : x;
    out[i] = withTone[i] * a;
  }
  return scale(out, 0.5);
}

function impactHit(gainMul = 1) {
  const dur = 0.9;
  const sub = sweepFreqOsc(dur, 90, 32, 'sine', 'exp');
  const subEnv = envExpDecay(sub, 0.35);
  const noise = bandpass(noiseBuf(0.35), 150, 6000);
  const noiseEnv = envExpDecay(noise, 0.09);
  const noisePadded = new Float64Array(subEnv.length);
  for (let i = 0; i < noiseEnv.length; i++) noisePadded[i] = noiseEnv[i];
  const click = highpass(noiseBuf(0.01), 4000);
  const clickEnv = envExpDecay(click, 0.004);
  const clickPadded = new Float64Array(subEnv.length);
  for (let i = 0; i < clickEnv.length; i++) clickPadded[i] = clickEnv[i];
  const out = addArr(addArr(scale(subEnv, 1.0), scale(noisePadded, 0.7)), scale(clickPadded, 0.5));
  return scale(out, 1.0 * gainMul);
}

// ---- ducking (sidechain) ----
const kickTimes = [];

function duckEnvAt(t) {
  let d = 1;
  for (const kt of kickTimes) {
    if (t >= kt) {
      const dt = t - kt;
      if (dt < 0.22) {
        d = Math.min(d, 1 - 0.65 * Math.exp(-dt * 22));
      }
    }
  }
  return d;
}
function applyDuck(buf, startTime) {
  const out = new Float64Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    out[i] = buf[i] * duckEnvAt(startTime + i / SR);
  }
  return out;
}

// =========================================================
// SCORE
// =========================================================

// Bar 1 (beats 0-3): tension riser + sparse pluck accents while logo particles swirl
addMono(0.0, riser(beat(4), 300, 5200, 'exp'), 0, 0.9);
addMono(beat(0), pluck(392.0, 0.6), -0.2, 0.7);
addMono(beat(2), pluck(466.16, 0.6), 0.2, 0.7);

// Bar 2 downbeat (t = beat(4) = 1.875): BIG IMPACT — logo snaps into place
kickTimes.push(beat(4));
addMono(beat(4) - 0.02, impactHit(1.0), 0, 1.0);
addMono(beat(4), subBass(65.41, beat(4)), 0, 0.9); // C2 hold
addMono(beat(6), impactHit(0.35), 0, 0.6); // secondary settle bounce

// Bar 3-4 (beats 8-15, t 3.75-7.5): groove kicks in, bass line, backbeat clap, kinetic type + screenshot fly-in
const grooveStartBeat = 8;
const grooveEndBeat = 32; // groove runs through end
const bassNotesByBar = {
  2: 65.41, // C2   bar3 (beats8-11)
  3: 58.27, // Bb1  bar4 (beats12-15)
  4: 51.91, // Ab1  bar5 (beats16-19)
  5: 51.91, // Ab1  bar6 (beats20-23)
  6: 58.27, // Bb1  bar7 (beats24-27)
  7: 65.41, // C2   bar8 (beats28-31) resolves home
};
const padChordsByBar = {
  2: [130.81, 155.56, 196.0], // Cm
  3: [116.54, 146.83, 174.61], // Bb
  4: [103.83, 130.81, 155.56], // Ab
  5: [103.83, 130.81, 155.56], // Ab
  6: [116.54, 146.83, 174.61], // Bb
  7: [130.81, 164.81, 196.0], // C major resolve
};

for (let bar = 2; bar <= 7; bar++) {
  const b0 = bar * 4;
  // kick on beats 0 and 2 of the bar (four on floor feel with pocket)
  for (const off of [0, 2]) {
    const bt = beat(b0 + off);
    kickTimes.push(bt);
  }
  // bass note held for the bar, sidechained against the kicks below
  const bt0 = beat(b0);
  addMono(bt0, applyDuck(subBass(bassNotesByBar[bar], beat(4)), bt0), 0, 1.0);
  // pad chord swell across the bar, filter opening up as bars progress
  const sweepStart = 500 + (bar - 2) * 250;
  const sweepEnd = sweepStart + 900;
  addMono(bt0, padChord(padChordsByBar[bar], beat(4) + 0.05, sweepStart, sweepEnd), 0, 1.0);
}

// place kick + hat + clap groove hits
for (let bar = 2; bar <= 7; bar++) {
  const b0 = bar * 4;
  for (const off of [0, 2]) {
    addMono(beat(b0 + off), kick(bar >= 6 ? 1.05 : 1.0), 0, 1.0);
  }
  // 8th-note closed hats, open hat accent on the 'and' of 4
  for (let e = 0; e < 8; e++) {
    const t = beat(b0) + e * (BEAT / 2);
    const isOpen = e === 7 && bar % 2 === 1;
    addMono(t, hat(isOpen), 0.15, 1.0);
  }
  // backbeat clap on beats 1 and 3 of the bar (off === 1, 3)
  if (bar >= 3) {
    addMono(beat(b0 + 1), clap(), -0.1, 0.9);
    addMono(beat(b0 + 3), clap(), -0.1, 0.9);
  }
}

// Bar 5-7 (beats 16-27): 16th-note arpeggio pluck melody, icons/stat-counters pop per note
const arpPatternsByBar = {
  4: [103.83, 130.81, 155.56, 207.65], // Ab
  5: [103.83, 130.81, 155.56, 207.65],
  6: [116.54, 146.83, 174.61, 233.08], // Bb
};
for (let bar = 4; bar <= 6; bar++) {
  const b0 = bar * 4;
  const notes = arpPatternsByBar[bar];
  for (let s = 0; s < 16; s++) {
    const t = beat(b0) + s * (BEAT / 4);
    const f = notes[s % notes.length];
    addMono(t, pluck(f * 2, 0.22), 0.25, 0.55);
  }
}

// Bar 7->8 transition (t ~ 12.5-13.125): snare/hat roll + riser building to the climax
for (let s = 0; s < 10; s++) {
  const t = beat(27) + s * (BEAT / 5);
  addMono(t, hat(false), 0.1, 0.9 + s * 0.03);
}
addMono(beat(27), riser(beat(1), 400, 9000, 'exp'), 0, 1.1);

// Bar 8 downbeat (t = beat(28) = 13.125): CLIMAX HIT — final logo + URL lockup
kickTimes.push(beat(28));
addMono(beat(28) - 0.02, impactHit(1.15), 0, 1.0);
addMono(beat(28), subBass(65.41, beat(4)), 0, 1.0);
addMono(beat(28), padChord([130.81, 164.81, 196.0, 261.63], beat(4), 300, 3500), 0, 1.0);
addMono(beat(28), scale(highpass(noiseBuf(beat(4)), 5000), 0.05), 0.3, 1.0); // air/shimmer tail

// final tail hat taps for polish
addMono(beat(30), hat(false), -0.2, 1.0);
addMono(beat(31), hat(true), -0.2, 0.8);

// =========================================================
// MASTER BUS: soft-clip saturation + fade out tail + normalize
// =========================================================
function softClip(x) {
  return Math.tanh(x * 1.15);
}

let peak = 0;
for (let i = 0; i < N; i++) {
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = peak > 0 ? 0.85 / peak : 1;

const fadeOutSamples = Math.round(0.35 * SR);
const outL = new Int16Array(N);
const outR = new Int16Array(N);
for (let i = 0; i < N; i++) {
  let l = softClip(L[i] * norm);
  let r = softClip(R[i] * norm);
  if (i > N - fadeOutSamples) {
    const k = (N - i) / fadeOutSamples;
    l *= k;
    r *= k;
  }
  outL[i] = Math.max(-32767, Math.min(32767, Math.round(l * 32767)));
  outR[i] = Math.max(-32767, Math.min(32767, Math.round(r * 32767)));
}

// ---- WAV writer (44.1kHz, 16-bit, stereo) ----
function writeWav(path, left, right) {
  const numSamples = left.length;
  const blockAlign = 4;
  const dataSize = numSamples * blockAlign;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(2, 22); // channels
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * blockAlign, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  let off = 44;
  for (let i = 0; i < numSamples; i++) {
    buf.writeInt16LE(left[i], off); off += 2;
    buf.writeInt16LE(right[i], off); off += 2;
  }
  fs.writeFileSync(path, buf);
}

writeWav('/home/user/motiongraphics/public/audio/score.wav', outL, outR);

// Emit the beat map so the Remotion timeline can reference exact timestamps.
const beatMap = {
  bpm: BPM,
  beatSec: BEAT,
  duration: DURATION,
  beats: Object.fromEntries(Array.from({ length: 33 }, (_, i) => [i, +beat(i).toFixed(5)])),
  cues: {
    riserStart: 0,
    logoImpact: +beat(4).toFixed(5),
    logoSettle: +beat(6).toFixed(5),
    grooveStart: +beat(8).toFixed(5),
    titleStart: +beat(8).toFixed(5),
    screenshotStart: +beat(12).toFixed(5),
    arpStart: +beat(16).toFixed(5),
    statsStart: +beat(20).toFixed(5),
    buildupStart: +beat(27).toFixed(5),
    climaxHit: +beat(28).toFixed(5),
    end: DURATION,
  },
};
fs.writeFileSync('/home/user/motiongraphics/scripts/beatmap.json', JSON.stringify(beatMap, null, 2));
console.log('Wrote score.wav', (N / SR).toFixed(3), 's');
console.log(beatMap.cues);
