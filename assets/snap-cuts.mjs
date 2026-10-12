// Turns the words to keep into cuts placed in real quiet, so no word is clipped,
// and lays them out as sound and picture clips.
//
//   node snap-cuts.mjs words <transcript.json>
//     Lists the words, numbered, with their start times.
//   node snap-cuts.mjs <recording> <transcript.json> <keeps.json> <fps> [--j-cut=<ms>]
//     keeps.json: [[firstWord, lastWord], ...] by those numbers, in playback order.
//     Prints { durationInFrames, sound, picture, ranges } and warns about cuts
//     that land on sound. sound and picture are clips on the video's timeline:
//     start (frame in the video), from (frame in the recording), length. The
//     picture switches --j-cut ms after the sound (default 200; 0 cuts both together).
//
// The transcript only says which gap a cut belongs in; the sound says where in
// that gap it goes. Word starts in the transcript are reliable, word ends often
// come early, so a cut after a word waits for its sound to die.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const RATE = 16000;
const HOP_S = 0.005;
const WINDOW_S = 0.02;
const IN_SEARCH_S = 0.3;
const OUT_SEARCH_S = 0.45;
const HOLD_S = 0.04;
const IN_BREATH_S = 0.06;
const OUT_BREATH_S = 0.08;
const NEIGHBOUR_GAP_S = 0.02;

const readWords = (path) => JSON.parse(readFileSync(path, "utf8")).words.filter((w) => w.type === "word");

const args = process.argv.slice(2);
if (args[0] === "words" && args[1]) {
  for (const [n, w] of readWords(args[1]).entries()) console.log(`${n}\t${w.start.toFixed(2)}\t${w.text}`);
  process.exit(0);
}
const jCutArg = args.find((a) => a.startsWith("--j-cut="));
const [recording, transcriptPath, keepsPath, fpsArg] = args.filter((a) => !a.startsWith("--"));
const fps = Number(fpsArg);
const jCutMs = jCutArg ? Number(jCutArg.slice("--j-cut=".length)) : 200;
if (!recording || !transcriptPath || !keepsPath || !(fps > 0) || !(jCutMs >= 0)) {
  console.error(
    "usage: snap-cuts.mjs words <transcript.json>\n       snap-cuts.mjs <recording> <transcript.json> <keeps.json> <fps> [--j-cut=<ms>]",
  );
  process.exit(1);
}

const pcm = execFileSync(
  "ffmpeg",
  // The first sound stream, padded back to zero so times match the transcript's clock.
  ["-v", "error", "-i", recording, "-map", "0:a:0", "-ac", "1", "-ar", String(RATE), "-af", "aresample=async=1:first_pts=0", "-f", "s16le", "-"],
  { maxBuffer: 1 << 30 },
);
const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.byteLength >> 1);

const hop = Math.round(HOP_S * RATE);
const win = Math.round(WINDOW_S * RATE);
const curve = [];
for (let start = 0; start + win <= samples.length; start += hop) {
  let sum = 0;
  for (let i = start; i < start + win; i++) sum += samples[i] * samples[i];
  curve.push(10 * Math.log10(sum / win / 32768 ** 2 + 1e-12));
}
const sorted = [...curve].sort((a, b) => a - b);
const floor = sorted[Math.floor(sorted.length * 0.1)];
const speech = sorted[Math.floor(sorted.length * 0.9)];
if (speech - floor < 15) {
  console.error(`Only ${(speech - floor).toFixed(1)} dB between room and speech; cuts can't be measured. Check them by ear.`);
  process.exit(1);
}
const quietBelow = Math.min(floor + 8, speech - 18);
const durationS = samples.length / RATE;

const hopAt = (s) => Math.min(curve.length - 1, Math.max(0, Math.round((s - WINDOW_S / 2) / HOP_S)));
const timeOf = (h) => h * HOP_S + WINDOW_S / 2;
const quiet = (h) => curve[h] < quietBelow;
const quietFor = (h, hops) => {
  for (let i = h; i < h + hops; i++) if (i >= curve.length || !quiet(i)) return false;
  return true;
};

const quietest = (fromS, toS) => {
  let best = hopAt(fromS);
  for (let h = best; h <= hopAt(toS); h++) if (curve[h] < curve[best]) best = h;
  return timeOf(best);
};

// The last quiet moment before the word's sound starts, with a breath of quiet before it.
const placeIn = (startS, earliestS) => {
  const limit = hopAt(earliestS);
  for (let h = hopAt(startS + 0.03); h >= limit; h--) {
    if (!quiet(h)) continue;
    let back = h;
    while (back - 1 >= limit && h - back < IN_BREATH_S / HOP_S && quiet(back - 1)) back--;
    return timeOf(back);
  }
  return null;
};

// The first moment the word's sound has died and stays quiet, with a breath of quiet after it.
const placeOut = (endS, latestS) => {
  const limit = hopAt(latestS);
  const hold = Math.round(HOLD_S / HOP_S);
  for (let h = hopAt(endS - 0.03); h <= limit; h++) {
    if (!quietFor(h, hold)) continue;
    let on = h;
    while (on + 1 <= limit && on - h < OUT_BREATH_S / HOP_S && quiet(on + 1)) on++;
    return timeOf(on);
  }
  return null;
};

const words = readWords(transcriptPath);
const keeps = JSON.parse(readFileSync(keepsPath, "utf8"));

for (const [from, to] of keeps) {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from >= 0 && from <= to && to < words.length)) {
    throw new Error(`Bad keep [${from}, ${to}]; there are ${words.length} words`);
  }
}

const round = (s) => Math.round(s * 1000) / 1000;
const placed = keeps.map(([from, to]) => {
  const first = words[from];
  const last = words[to];
  const prev = words[from - 1];
  const next = words[to + 1];
  const earliestS = Math.max(first.start - IN_SEARCH_S, prev ? prev.start + NEIGHBOUR_GAP_S : 0);
  const latestS = Math.min(last.end + OUT_SEARCH_S, next ? next.start - NEIGHBOUR_GAP_S : durationS);
  const inS = placeIn(first.start, earliestS);
  const outS = placeOut(last.end, latestS);
  if (inS === null) console.error(`"${first.text}" (word ${from}, ${first.start}s) starts on sound. Cut at the quietest moment; listen to it.`);
  if (outS === null) console.error(`"${last.text}" (word ${to}, ${last.end}s) ends on sound. Cut at the quietest moment; listen to it.`);
  return {
    words: [from, to],
    text: `${first.text} … ${last.text}`,
    in: inS ?? quietest(earliestS, first.start + 0.02),
    out: outS ?? quietest(last.end - 0.05, latestS),
  };
});

// A pause between two keeps that follow on in the recording is cut out, unless
// there's no quiet to cut in: then they play straight through.
const joined = [];
for (const range of placed) {
  const last = joined[joined.length - 1];
  if (last && last.words[1] + 1 === range.words[0] && range.in <= last.out) {
    last.words[1] = range.words[1];
    last.text = `${last.text.split(" … ")[0]} … ${range.text.split(" … ")[1]}`;
    last.out = range.out;
  } else joined.push(range);
}

const ranges = joined.map((r) => ({
  ...r,
  in: round(r.in),
  out: round(r.out),
  fromFrame: Math.round(r.in * fps),
  toFrame: Math.round(r.out * fps),
}));

const sound = [];
for (const r of ranges) {
  const prev = sound[sound.length - 1];
  sound.push({ start: prev ? prev.start + prev.length : 0, from: r.fromFrame, length: r.toFrame - r.fromFrame });
}
const durationInFrames = sound.reduce((n, c) => n + c.length, 0);

// The picture follows its sound by the J-cut, never more than half of the clip it switches to.
const jCut = Math.round((jCutMs / 1000) * fps);
const switchAt = sound.map((c, i) => (i === 0 ? 0 : c.start + Math.min(jCut, Math.floor(c.length / 2))));
const picture = sound.map((c, i) => {
  const start = switchAt[i];
  const end = switchAt[i + 1] ?? durationInFrames;
  return { start, from: c.from + start - c.start, length: end - start };
});

console.log(JSON.stringify({ durationInFrames, sound, picture, ranges }, null, 2));
