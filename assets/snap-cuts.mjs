// Turns the words to keep into tight cuts placed in real quiet, so no word is
// clipped, and lays them out as sound and picture clips.
//
//   node snap-cuts.mjs words <transcript.json>
//     Lists the words, numbered, with their start times.
//   node snap-cuts.mjs <recording> <transcript.json> <keeps.json> <fps> [options]
//     keeps.json: [[firstWord, lastWord], ...] by those numbers, in playback order.
//     Prints { durationInFrames, sound, picture, words, ranges }. sound and
//     picture are clips on the video's timeline: start (frame in the video),
//     from (frame in the recording), length. words gives every kept word's
//     frames in the video. Warns, with video times, about cuts that land on sound.
//
//   --max-pause=<ms>  pauses longer than this inside a keep are cut out (default 350; "off" keeps them)
//   --air=<ms>        quiet left between the last word and the next at each cut (default 0)
//   --j-cut=<ms>      the picture switches this long after the sound (default 200; 0 cuts both together)
//
// The transcript only says which gap a cut belongs in; the sound says where in
// that gap it goes. Word starts in the transcript are reliable, word ends often
// come early, so a cut after a word waits for its sound to die. Each clip keeps
// a little quiet at both ends, and at a join the outgoing quiet plays under the
// incoming quiet at full volume, so the words meet with only the chosen air.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const RATE = 16000;
const HOP_S = 0.005;
const WINDOW_S = 0.02;
const IN_SEARCH_S = 0.3;
const OUT_SEARCH_S = 0.45;
const HOLD_S = 0.04;
const LEAD_S = 0.12;
const TAIL_S = 0.2;
const NEIGHBOUR_GAP_S = 0.02;

const readWords = (path) => JSON.parse(readFileSync(path, "utf8")).words.filter((w) => w.type === "word");

const args = process.argv.slice(2);
if (args[0] === "words" && args[1]) {
  for (const [n, w] of readWords(args[1]).entries()) console.log(`${n}\t${w.start.toFixed(2)}\t${w.text}`);
  process.exit(0);
}
const option = (name, fallback) => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3) : fallback;
};
const [recording, transcriptPath, keepsPath, fpsArg] = args.filter((a) => !a.startsWith("--"));
const fps = Number(fpsArg);
const maxPauseOption = option("max-pause", "350");
const maxPauseS = maxPauseOption === "off" ? Infinity : Number(maxPauseOption) / 1000;
const airS = Number(option("air", "0")) / 1000;
const jCutS = Number(option("j-cut", "200")) / 1000;
if (!recording || !transcriptPath || !keepsPath || !(fps > 0) || !(maxPauseS >= 0) || !(airS >= 0) || !(jCutS >= 0)) {
  console.error(
    "usage: snap-cuts.mjs words <transcript.json>\n       snap-cuts.mjs <recording> <transcript.json> <keeps.json> <fps> [--max-pause=<ms|off>] [--air=<ms>] [--j-cut=<ms>]",
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
// Breaths and room noise in a pause count as quiet; only speech doesn't.
const quietBelow = floor + 0.4 * (speech - floor);
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

// Where the word's sound starts (attack), and a cut up to LEAD_S of quiet before it.
// On sound: the quietest moment right at the word's start, which the transcript
// gets right, with no quiet to share.
const placeIn = (startS, earliestS) => {
  const limit = hopAt(earliestS);
  for (let h = hopAt(startS + 0.03); h >= limit; h--) {
    if (!quiet(h)) continue;
    let back = h;
    while (back - 1 >= limit && h - back < LEAD_S / HOP_S && quiet(back - 1)) back--;
    return { cut: timeOf(back), attack: timeOf(h + 1), onSound: false };
  }
  const cut = quietest(Math.max(earliestS, startS - 0.04), startS + 0.01);
  return { cut, attack: cut, onSound: true };
};

// Where the word's sound has died (death), and a cut up to TAIL_S of quiet after it.
const placeOut = (endS, latestS) => {
  const limit = hopAt(latestS);
  const hold = Math.round(HOLD_S / HOP_S);
  for (let h = hopAt(endS - 0.03); h <= limit; h++) {
    if (!quietFor(h, hold)) continue;
    let on = h;
    while (on + 1 <= limit && on - h < TAIL_S / HOP_S && quiet(on + 1)) on++;
    return { cut: timeOf(on), death: timeOf(h), onSound: false };
  }
  const cut = quietest(endS - 0.05, latestS);
  return { cut, death: cut, onSound: true };
};

const words = readWords(transcriptPath);
const keeps = JSON.parse(readFileSync(keepsPath, "utf8"));
for (const [from, to] of keeps) {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from >= 0 && from <= to && to < words.length)) {
    throw new Error(`Bad keep [${from}, ${to}]; there are ${words.length} words`);
  }
}

const inFor = (i) => placeIn(words[i].start, Math.max(words[i].start - IN_SEARCH_S, i > 0 ? words[i - 1].start + NEIGHBOUR_GAP_S : 0));
const outFor = (i) =>
  placeOut(words[i].end, Math.min(words[i].end + OUT_SEARCH_S, i + 1 < words.length ? words[i + 1].start - NEIGHBOUR_GAP_S : durationS));

// Each keep, split wherever the measured quiet between two words runs longer than the longest pause.
const runs = keeps.flatMap(([from, to]) => {
  const split = [{ from, to: from }];
  for (let i = from + 1; i <= to; i++) {
    const out = outFor(i - 1);
    const into = inFor(i);
    if (!out.onSound && !into.onSound && into.attack - out.death > maxPauseS) split.push({ from: i, to: i });
    else split[split.length - 1].to = i;
  }
  return split;
});

const placed = runs.map(({ from, to }) => ({ words: [from, to], in: inFor(from), out: outFor(to) }));

// Two runs that follow on in the recording share the quiet between them: the cut
// after one and before the next meet inside it. With no quiet at all, they play
// straight through.
const joined = [];
const keptPauses = [];
for (const run of placed) {
  const last = joined[joined.length - 1];
  const follows = last && last.words[1] + 1 === run.words[0];
  if (follows && (last.out.onSound || run.in.onSound || run.in.attack <= last.out.death)) {
    keptPauses.push(words[last.words[1]].text);
    last.words[1] = run.words[1];
    last.out = run.out;
    continue;
  }
  if (follows && run.in.cut < last.out.cut) {
    const meet = last.out.death + ((run.in.attack - last.out.death) * TAIL_S) / (TAIL_S + LEAD_S);
    last.out = { ...last.out, cut: meet };
    run.in = { ...run.in, cut: meet };
  }
  joined.push({ ...run, words: [...run.words] });
}

const round = (s) => Math.round(s * 1000) / 1000;
const ranges = joined.map((r) => ({
  words: r.words,
  text: `${words[r.words[0]].text} … ${words[r.words[1]].text}`,
  in: round(r.in.cut),
  out: round(r.out.cut),
  fromFrame: Math.round(r.in.cut * fps),
  toFrame: Math.round(r.out.cut * fps),
}));

// At each join the outgoing clip's quiet tail plays under the incoming clip's quiet
// lead, so only the chosen air is left between the words. A cut on sound shares
// nothing, and no overlap takes more than a quarter of either clip.
const sound = [];
ranges.forEach((r, i) => {
  const length = r.toFrame - r.fromFrame;
  const prev = sound[i - 1];
  if (!prev) return sound.push({ start: 0, from: r.fromFrame, length });
  const before = joined[i - 1].out;
  const after = joined[i].in;
  const quietS = before.onSound || after.onSound ? 0 : before.cut - before.death + (after.attack - after.cut);
  const overlap = Math.min(Math.round(Math.max(0, quietS - airS) * fps), Math.floor(Math.min(prev.length, length) / 4));
  sound.push({ start: prev.start + prev.length - overlap, from: r.fromFrame, length });
});
const last = sound[sound.length - 1];
const durationInFrames = last.start + last.length;

// The picture follows its sound by the J-cut, never more than half of the clip it switches to.
const jCut = Math.round(jCutS * fps);
const switchAt = sound.map((c, i) => (i === 0 ? 0 : c.start + Math.min(jCut, Math.floor(c.length / 2))));
const picture = sound.map((c, i) => {
  const start = switchAt[i];
  const end = switchAt[i + 1] ?? durationInFrames;
  return { start, from: c.from + start - c.start, length: end - start };
});

// Every kept word's place in the video, for captions and anything timed to speech.
const toVideo = (seconds, clip) => clip.start + Math.round(seconds * fps) - clip.from;
const keptWords = ranges.flatMap((r, i) =>
  words.slice(r.words[0], r.words[1] + 1).map((w, k) => ({
    word: r.words[0] + k,
    text: w.text,
    from: Math.max(sound[i].start, toVideo(w.start, sound[i])),
    to: Math.min(sound[i].start + sound[i].length, toVideo(w.end, sound[i])),
  })),
);

const clock = (frame) => {
  const s = frame / fps;
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
};
for (const word of keptPauses) console.error(`The pause after "${word}" stays in: there's no quiet in it to cut.`);
joined.forEach((r, i) => {
  if (i > 0 && r.in.onSound) {
    console.error(`${clock(sound[i].start)}: "${words[r.words[0]].text}" starts right on other sound, cut at the quietest moment. Ask the member to listen there.`);
  }
  if (i < joined.length - 1 && r.out.onSound) {
    console.error(`${clock(sound[i + 1].start)}: "${words[r.words[1]].text}" runs straight into other sound, cut at the quietest moment. Ask the member to listen there.`);
  }
});
console.error(`${ranges.length} clips, ${ranges.length - 1} cuts, ${(durationInFrames / fps).toFixed(1)} s.`);

console.log(JSON.stringify({ durationInFrames, sound, picture, words: keptWords, ranges }, null, 2));
