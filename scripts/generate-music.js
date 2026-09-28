// Procedural score for the 30s Eden & Design ad.
// 128 BPM -> beat = 0.46875s. 64 beats = exactly 30.000s (16 bars of 4/4).
// Hand-synthesized so every hit lands on a known timestamp; the beat map it
// writes (src/beatmap.json) is what the Remotion timeline is cut against.

const fs = require('fs');
const path = require('path');

const SR = 44100;
const BPM = 128;
const BEAT = 60 / BPM;
const BARS = 16;
const DURATION = BARS * 4 * BEAT; // 30.0
const N = Math.round(SR * DURATION);

const L = new Float64Array(N);
const R = new Float64Array(N);

let seed = 1337;
function rand() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const beat = (n) => n * BEAT;
const bar = (n) => n * 4 * BEAT;
const t2i = (t) => Math.max(0, Math.round(t * SR));

function add(startTime, samples, pan = 0, gain = 1) {
  const start = t2i(startTime);
  const lg = gain * (1 - Math.max(0, pan));
  const rg = gain * (1 + Math.min(0, pan));
  for (let i = 0; i < samples.length; i++) {
    const idx = start + i;
    if (idx < 0) continue;
    if (idx >= N) break;
    L[idx] += samples[i] * lg;
    R[idx] += samples[i] * rg;
  }
}

// ---------- primitives ----------
function noise(dur) {
  const n = Math.round(dur * SR);
  const b = new Float64Array(n);
  for (let i = 0; i < n; i++) b[i] = rand() * 2 - 1;
  return b;
}

// one-pole lowpass whose cutoff may vary per sample (no state resets -> no clicks)
function lowpassVar(buf, cutoffAt) {
  const out = new Float64Array(buf.length);
  let y = 0;
  for (let i = 0; i < buf.length; i++) {
    const fc = typeof cutoffAt === 'function' ? cutoffAt(i / buf.length) : cutoffAt;
    const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    y += a * (buf[i] - y);
    out[i] = y;
  }
  return out;
}
const lowpass = (buf, fc) => lowpassVar(buf, fc);
function highpass(buf, fc) {
  const lp = lowpass(buf, fc);
  const out = new Float64Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = buf[i] - lp[i];
  return out;
}
const bandpass = (buf, lo, hi) => lowpass(highpass(buf, lo), hi);

function osc(freq, dur, shape = 'sine', detuneCents = 0) {
  const n = Math.round(dur * SR);
  const out = new Float64Array(n);
  const f = freq * Math.pow(2, detuneCents / 1200);
  const phase0 = rand();
  for (let i = 0; i < n; i++) {
    const ph = phase0 + (f * i) / SR;
    if (shape === 'sine') out[i] = Math.sin(2 * Math.PI * ph);
    else if (shape === 'saw') out[i] = 2 * (ph % 1) - 1;
    else if (shape === 'tri') out[i] = 2 * Math.abs(2 * (ph % 1) - 1) - 1;
  }
  return out;
}

function sweep(dur, f0, f1, shape = 'sine', k = 0.35) {
  const n = Math.round(dur * SR);
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const f = f0 + (f1 - f0) * Math.pow(i / n, k);
    phase += f / SR;
    out[i] = shape === 'sine' ? Math.sin(2 * Math.PI * phase) : 2 * (phase % 1) - 1;
  }
  return out;
}

function env(buf, fn) {
  const out = new Float64Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = buf[i] * fn(i / SR, i / buf.length);
  return out;
}
const decay = (buf, tau) => env(buf, (t) => Math.exp(-t / tau));
function mix(...parts) {
  const n = Math.max(...parts.map(([b]) => b.length));
  const out = new Float64Array(n);
  for (const [b, g] of parts) for (let i = 0; i < b.length; i++) out[i] += b[i] * g;
  return out;
}

// ---------- voices ----------
function kick(g = 1) {
  const body = decay(sweep(0.3, 170, 46), 0.12);
  const click = decay(highpass(noise(0.012), 3000), 0.005);
  return mix([body, 0.95 * g], [click, 0.55 * g]);
}
function hat(open = false, g = 1) {
  const n = lowpass(highpass(noise(open ? 0.25 : 0.05), 7500), 14000);
  return decay(n, open ? 0.09 : 0.017).map((x) => x * (open ? 0.2 : 0.23) * g);
}
function clap(g = 1) {
  // three quick noise bursts -> the classic smeared clap transient
  const n = bandpass(noise(0.22), 900, 3400);
  const e = env(n, (t) => {
    const bursts = [0, 0.011, 0.022].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) / 0.006) : 0), 0);
    return 0.5 * bursts + (t >= 0.022 ? Math.exp(-(t - 0.022) / 0.06) : 0);
  });
  return e.map((x) => x * 0.42 * g);
}
function snare(g = 1) {
  const n = decay(bandpass(noise(0.18), 1200, 6000), 0.05);
  const body = decay(osc(200, 0.18), 0.03);
  return mix([n, 0.45 * g], [body, 0.25 * g]);
}
function sub(freq, dur) {
  const o = mix([osc(freq, dur), 0.85], [osc(freq * 2, dur), 0.14]);
  const rel = 0.06;
  return env(o, (t) => Math.min(1, t / 0.008) * Math.min(1, (dur - t) / rel)).map((x) => x * 0.55);
}
function pluck(freq, dur = 0.24, g = 1) {
  const o = mix([osc(freq, dur, 'saw', -4), 0.5], [osc(freq, dur, 'saw', 4), 0.5]);
  const f = lowpassVar(o, (p) => 600 + 3200 * Math.exp(-p * 5));
  return decay(f, 0.14).map((x) => x * 0.3 * g);
}
function pad(freqs, dur, fc0, fc1, g = 1) {
  const parts = [];
  for (const f of freqs) {
    parts.push([osc(f, dur, 'saw', -7), 1], [osc(f, dur, 'saw', 7), 1], [osc(f / 2, dur, 'tri'), 0.5]);
  }
  const m = lowpassVar(mix(...parts), (p) => fc0 + (fc1 - fc0) * p);
  return env(m, (t) => Math.min(1, t / 0.3) * Math.min(1, (dur - t) / 0.25)).map((x) => x * 0.05 * g);
}
function riser(dur, f0, f1, g = 1) {
  const n = lowpassVar(highpass(noise(dur), f0), (p) => f0 + (f1 - f0) * p * p);
  const tone = sweep(dur, f0 / 2, f1 / 4, 'saw', 1.6);
  return env(mix([n, 1], [lowpass(tone, 3000), 0.25]), (_, p) => Math.pow(p, 2.4)).map((x) => x * 0.55 * g);
}
function whoosh(dur = 0.42, g = 1) {
  // filtered-noise swoosh that peaks right as the downbeat lands
  const n = lowpassVar(highpass(noise(dur), 250), (p) => 400 + 7000 * Math.sin(Math.PI * Math.min(1, p * 1.1)));
  return env(n, (_, p) => Math.pow(Math.sin(Math.PI * Math.pow(p, 1.6)), 2)).map((x) => x * 0.5 * g);
}
function impact(g = 1) {
  const s = decay(sweep(1.1, 95, 30), 0.4);
  const n = decay(bandpass(noise(0.4), 150, 7000), 0.1);
  const c = decay(highpass(noise(0.01), 4000), 0.004);
  return mix([s, 1 * g], [n, 0.7 * g], [c, 0.5 * g]);
}
function shimmer(dur, g = 1) {
  return env(highpass(noise(dur), 6000), (t) => Math.min(1, t / 0.05) * Math.exp(-t / (dur * 0.5))).map((x) => x * 0.06 * g);
}

// ---------- harmony ----------
const CHORD = {
  Cm: [130.81, 155.56, 196.0],
  Bb: [116.54, 146.83, 174.61],
  Ab: [103.83, 130.81, 155.56],
  C: [130.81, 164.81, 196.0],
};
const ROOT = { Cm: 65.41, Bb: 58.27, Ab: 51.91, C: 65.41 };
// bar index -> chord. Minor verse, then a lift to C major for the call to action.
const PROG = ['Cm', 'Cm', 'Cm', 'Bb', 'Ab', 'Bb', 'Cm', 'Bb', 'Ab', 'Bb', 'Ab', 'Bb', 'C', 'Ab', 'Bb', 'C'];

// ---------- arrangement (bar numbers are 0-based) ----------
// 0      intro riser, pluck hits         | 1   IMPACT: hero photo
// 2-3    half-time groove, logo reveal   | 4-7 portfolio: one photo per bar, whoosh into each
// 8-9    pillars + arp                   | 10-11 regions, bar 11 builds (roll + riser)
// 12     CLIMAX: call to action          | 12-14 CTA groove | 15 resolve + tail

const kickTimes = [];
for (let b = 2; b <= 14; b++) {
  const halfTime = b <= 3;
  const breakdown = b === 11;
  for (let q = 0; q < 4; q++) {
    if (halfTime && q % 2 === 1) continue;
    if (breakdown && q >= 2) continue;
    kickTimes.push(bar(b) + beat(q));
  }
}
kickTimes.push(bar(1), bar(15));

function duck(t) {
  let d = 1;
  for (const kt of kickTimes) {
    const dt = t - kt;
    if (dt >= 0 && dt < 0.25) d = Math.min(d, 1 - 0.7 * Math.exp(-dt * 20));
  }
  return d;
}
function addDucked(t0, buf, pan = 0, gain = 1) {
  add(t0, env(buf, (t) => duck(t0 + t)), pan, gain);
}

// intro
add(0, riser(bar(1), 250, 6000), 0, 0.9);
add(beat(0), pluck(392.0, 0.7), -0.25, 0.9);
add(beat(2), pluck(466.16, 0.7), 0.25, 0.9);
add(beat(3), pluck(523.25, 0.5), 0, 0.6);

// bar 1: impact + hold
add(bar(1) - 0.02, impact(1.0));
add(bar(1), sub(ROOT.Cm, bar(1)), 0, 0.9);
add(bar(1), pad(CHORD.Cm, bar(1), 300, 1400), 0, 1);
add(bar(1) + beat(2), impact(0.3), 0, 0.6);

// harmonic bed for bars 2-15
for (let b = 2; b <= 15; b++) {
  const c = PROG[b];
  const dur = b === 15 ? bar(1) : bar(1) + 0.02;
  const bright = b >= 12 ? 1.6 : 1;
  addDucked(bar(b), sub(ROOT[c], b === 15 ? bar(1) * 0.9 : bar(1)), 0, 1);
  addDucked(bar(b), pad(CHORD[c], dur, 500 * bright + (b % 4) * 150, 1500 * bright + (b % 4) * 200), 0, 1);
}

// drums
for (const kt of kickTimes) add(kt, kick(kt >= bar(12) ? 1.08 : 1), 0, 1);
for (let b = 2; b <= 14; b++) {
  const breakdown = b === 11;
  for (let e = 0; e < 8; e++) {
    if (breakdown && e >= 4) break;
    const open = e === 7 && b % 2 === 1;
    add(bar(b) + e * (BEAT / 2), hat(open), 0.18, 1);
  }
  if (b >= 4 && !breakdown) {
    add(bar(b) + beat(1), clap(), -0.12, 1);
    add(bar(b) + beat(3), clap(), -0.12, 1);
  }
}

// portfolio transitions: whoosh arriving on each photo downbeat (bars 4-7) and on the services/CTA hits
for (const b of [4, 5, 6, 7, 8, 10]) add(bar(b) - 0.38, whoosh(0.42), b % 2 ? 0.3 : -0.3, 0.9);

// arpeggio: bars 8-10 and CTA bars 12-14
for (const b of [8, 9, 10, 12, 13, 14]) {
  const tones = CHORD[PROG[b]];
  const pattern = [tones[0] * 2, tones[1] * 2, tones[2] * 2, tones[0] * 4];
  for (let s = 0; s < 16; s++) {
    add(bar(b) + s * (BEAT / 4), pluck(pattern[s % 4], 0.22, s % 4 === 0 ? 1 : 0.7), s % 2 ? 0.3 : -0.3, 0.55);
  }
}

// bar 11 build: snare roll accelerating into the climax + riser
const rollHits = [];
{
  // beat 2 of bar 11 in 16ths, beat 3 in 32nds -> 12 hits accelerating into the drop
  const start = bar(11) + beat(2);
  for (let i = 0; i < 4; i++) rollHits.push(start + i * (BEAT / 4));
  for (let i = 0; i < 8; i++) rollHits.push(start + BEAT + i * (BEAT / 8));
  rollHits.forEach((ht, i) => add(ht, snare(0.45 + (i / rollHits.length) * 0.8), 0.05, 1));
  add(bar(11), riser(bar(1), 400, 10000, 1.2), 0, 1);
}

// bar 12: CLIMAX — call to action lands
add(bar(12) - 0.02, impact(1.15));
add(bar(12), shimmer(bar(2)), 0.3, 1);

// CTA button "pulse" accents: soft bell on beat 1 of each CTA bar
for (const b of [12, 13, 14]) add(bar(b), pluck(1046.5, 0.5, 0.8), 0, 0.5);

// bar 15: resolve
add(bar(15) - 0.02, impact(0.55));
add(bar(15), pad([...CHORD.C, 261.63], bar(1), 2500, 600, 1.2), 0, 1);
add(bar(15), shimmer(bar(1)), -0.3, 1);
add(bar(15) + beat(2), hat(true, 0.8), -0.2, 1);

// ---------- master ----------
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const norm = 0.9 / peak;
const fade = Math.round(0.4 * SR);
const outL = new Int16Array(N);
const outR = new Int16Array(N);
for (let i = 0; i < N; i++) {
  const k = i > N - fade ? (N - i) / fade : 1;
  outL[i] = Math.round(Math.tanh(L[i] * norm * 1.2) * k * 32767);
  outR[i] = Math.round(Math.tanh(R[i] * norm * 1.2) * k * 32767);
}

function writeWav(file, left, right) {
  const dataSize = left.length * 4;
  const b = Buffer.alloc(44 + dataSize);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + dataSize, 4);
  b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 4, 28);
  b.writeUInt16LE(4, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(dataSize, 40);
  for (let i = 0, o = 44; i < left.length; i++, o += 4) {
    b.writeInt16LE(left[i], o);
    b.writeInt16LE(right[i], o + 2);
  }
  fs.writeFileSync(file, b);
}

const root = path.join(__dirname, '..');
writeWav(path.join(root, 'public/audio/score.wav'), outL, outR);

const r = (x) => +x.toFixed(5);
const beatMap = {
  bpm: BPM,
  beatSec: BEAT,
  barSec: 4 * BEAT,
  duration: DURATION,
  cues: {
    intro: 0,
    heroImpact: r(bar(1)),
    heroSettle: r(bar(1) + beat(2)),
    logo: r(bar(2)),
    portfolio: [4, 5, 6, 7].map((b) => r(bar(b))),
    pillars: r(bar(8)),
    regions: r(bar(10)),
    buildup: r(bar(11) + beat(2)),
    cta: r(bar(12)),
    ctaPulses: [12, 13, 14].map((b) => r(bar(b))),
    resolve: r(bar(15)),
    end: r(DURATION),
  },
  kicks: kickTimes.sort((a, b) => a - b).map(r),
  roll: rollHits.map(r),
};
fs.writeFileSync(path.join(root, 'src/beatmap.json'), JSON.stringify(beatMap, null, 2));
console.log(`score.wav ${DURATION.toFixed(3)}s`, beatMap.cues);
