# Motion Design Guide

A portable playbook for making motion graphics that look directed, not generated. It does not depend on one model or one tool. Use it as a SKILL.md, an AGENTS.md, or paste it above a motion prompt.

---

## Contents

1. When to use this
2. Workflow: gates, not one shot · 2b. Visual foundation (DESIGN.md)
3. Core principles
4. Motion numbers cheat sheet: durations, easing, springs, stagger, emphasis, beats, reading windows, motion blur, camera, type, canvas sizes
5. Composition, hierarchy and story
6. Transitions
7. Color and light
8. Sound
9. Loops
10. Default ban list
11. Render contract
12. Environments and toolbox
13. Review and repair: checklist, failure modes
14. Prompt template

---

## 1. When to use this

Use it for any short video drawn by code: product and UI walkthroughs, stat reveals, title stings, explainers, social loops and launch films. Code-drawn motion animates your own text, charts, shapes and images. It doesn't produce realistic footage or people. It is strongest at UI, typography, diagrams and data. Photoreal scenes and organic characters may still need footage.

It covers motion graphics only: titles, graphics, overlays, UI and data. Captions are not motion design and follow their own rules.

**The core idea:** the model's default look lives in the decisions you leave open, and adjectives are open decisions. Every adjective you swap for a number, a state or a named rule is a choice you make instead of the model.

**Find what's worth animating first:**
- a flow one screenshot can't explain, such as a new user's first steps;
- a change that falls flat as a bare number, such as new-versus-old speed;
- the newest feature most worth showing.

If a project has none of these, say so. Don't force an animation.

## 2. Workflow: gates, not one shot

Work in stages. Don't render the whole film until the stage before it has been approved.

1. **Inputs.** Ask for what you need and give a default for each item, so a skipped question never blocks the work.
2. **Brief.** Write down who will watch, where it plays and roughly how long it runs, and attach the real report, data or screenshots. In one sentence, say what the viewer should understand after one watch, and what they believe at the start. Approved facts and assets go on a separate list. The model can invent camera moves. It must never invent product screens, logos, metrics or quotes. If an asset is missing, stop and ask.
3. **Style anchor → DESIGN.md (§2b).** Take one high-res screenshot of the real app and extract its colors, corner radii, padding and type scale as tokens. Save them as a DESIGN.md before any motion work. Give each reference video one job, such as "a card entrance with a controlled landing." Sample it at 2 fps for an overview, then look at consecutive frames around the key events. Note what moves first, where the eye lands and how long the result gets. Check positions against the extracted frames, because the model's spatial estimates are approximate. Write the findings as concrete values: palette, type, composition, pacing, motion and texture. Don't copy subjects, logos or copy.
4. **Timed storyboard / beat map.** List each scene with its seconds and the exact words, numbers and screenshots on screen, using only real content. Give each beat an entry state, an exit state, the one thing the viewer learns, a hero move, a sound cue and a reason to exist. Cut any beat you can't justify.
5. **Stills.** Get stills approved before the full render. At minimum, use the three-still check: the opening, the product result and the closing frame. Is the main text readable? Is the result visible? Is anything cropped or overlapping? Is there room for the closing action? For longer pieces, render one still per beat.
6. **Draft render.** Look at one frame per second, fix, and only then export the final file.
7. **Review and repair** (§13). Judge only the rendered frames. Two to four rounds is normal.
8. **Deliver.** Hand over the master, the native-format variants, a poster frame, the source, the exact render command, a decisions log, the audio cue list, and a list of the checks you couldn't run. Save approved entrance, cursor and text components for the next film, and re-check their timing when the copy changes.

**Run rules.**
- Make reversible creative choices yourself and log them. Ask only when missing facts, rights or a goal-changing ambiguity block the work.
- If the reference is unclear, deliver one test frame, not 900 polished wrong frames.
- **Circuit breaker:** if the same error happens twice in a row, stop and rethink the approach instead of retrying.

## 2b. Visual foundation (DESIGN.md)

**Why it matters.** Motion amplifies whatever it moves. When colors, sizes, radii and spacing are invented separately in every frame, every move exposes the inconsistency: cards land at different radii, type jumps weight between scenes, and the accent drifts. Fix the stills before you animate them. A DESIGN.md is a design-system file a coding agent reads before it builds. It holds tokens in YAML front matter and the reasoning in prose.

**Source order.**
1. Your product's real screens and tokens: the screenshot anchor in §2, or the app's own CSS variables.
2. A DESIGN.md extracted from a site you admire. Borrow its system, never its logo or copy.
3. A generic template, only as a last resort, and override its accent and type.

**What strong ones contain.** The Google spec sets the section order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts. The best extracted files (Refero's ElevenLabs, OpenDesign's Linear) add:
- **Color roles**, such as "accent for CTAs only; product-art colors never on UI";
- a **type scale** with size, weight, line-height and tracking per level (e.g. display 48 px / 300 / 1.08 / −0.02em);
- **surface steps**, e.g. canvas → card → plate;
- a **4 or 8 px spacing scale**;
- **radii per element**;
- **elevation recipes**;
- **component states**;
- **concrete do and don't rules**.

The Google spec has no motion section, so add one yourself. Unknown sections are allowed. OpenDesign's Linear system carries `motion-fast 150ms`, `motion-base 200ms` and `ease-standard cubic-bezier(0.2,0,0,1)` (Material 3's standard curve).

**Minimal motion-ready DESIGN.md (fill in):**
```
---
name: [brand]
colors:   { canvas: "#", surface: "#", text: "#", text-muted: "#", border: "#", accent: "#" }  # accent = one job only
typography: { display: [face size/weight/lh/tracking], headline: [...], body: [...], label: [...] }  # 1–2 faces
spacing:  { base: 8px, scale: [4, 8, 16, 24, 32, 48, 96] }
rounded:  { control: [px], card: [px], pill: 9999px }  # one radius per element type
---
## Overview      one sentence of mood + audience; light or dark canvas
## Colors        role of each token; where the accent may and may not appear
## Typography    which level is used on screen at 1080p (map to §4 sizes)
## Layout        grid, safe margins, max text width, max lines
## Elevation     flat / ring / raised recipes (or "tonal steps, no shadows")
## Components    card, button, cursor, chart: default / hover / pressed / active
## Motion        durations: feedback [ms], UI move [ms], hero [ms], exit [% of entry]
                 easings: enter [curve], exit [curve], camera [curve]; springs: cards ζ [ ], overshoot [%]
                 stagger: words [ms], items [ms]; may move: [list]; never moves: [logo, body text while read]
## Do's and Don'ts   concrete, token-referenced rules
```

**Rules against the generic look.**
- No purple or blue gradient as a default background.
- Every color on screen must be a token, with one accent and one job for it.
- Use one or two typefaces with a fixed weight set.
- Use one radius per element type, never mixed in a view.
- Use real UI and real copy, never placeholder dashboards.
- If a value isn't in the DESIGN.md, add it to the file first, then use it.

**Where to get inspired** (verified Oct 2026)
- **Refero Styles** (styles.refero.design): 2,000+ real sites with screenshots and agent-ready DESIGN.md files. The best way to steal a system. Free to browse.
- **OpenDesign** (open-design.ai/plugins/systems): 152 open-source DESIGN.md systems, some with motion tokens, plus a sourced animation-discipline guide. Free (Apache-2.0).
- **designmd.me**: paste a URL to get a DESIGN.md, an HTML preview and a Figma import. Uses credits; you can start without a card.
- **designmd.supply**: generates a Google-spec DESIGN.md from any public domain. Open source (MIT).
- **design-md.hyperbrowser.ai**: one URL in, one DESIGN.md out, using your own Hyperbrowser key.
- **TypeUI** (typeui.sh): CLI (`npx typeui.sh pull <slug>`) for generic style skills such as editorial or minimal. These are thin, so use them as a last resort. Open source.
- **Aura** (aura.build/design-systems): DESIGN.md generator and templates inside an AI landing-page builder. Freemium.
- **Mobbin**: 400k+ real app and web screenshots and flows for UI states. Free tier is limited; Pro costs extra.
- **LottieFiles**: free Lottie animations for studying timing.
- **Rive marketplace**: community interactive animations.
- **Motion benchmarks:** product pages from Apple, Linear and Stripe. Watch how they hold, stagger and settle, and match their restraint rather than their effects.

---

## 3. Core principles

1. **Numbers, not adjectives.** "Premium" becomes materials and curves. "Modern" becomes a camera with a field of view and a path. "Animated" becomes beats and spring values.
2. **Write each shot as an event.** Show the start state, put the cursor on the action, register the press, reveal the result, then hold for reading.
3. **One hero per shot, one owner of the screen.** Only one orchestrated moment at a time. Everything else waits, dims to 40% or holds still. Keep attention on the button until its response appears, then let the result own the reading window. If the cursor crosses a headline during an entrance, delay one of the two events or reroute the cursor. Each scene gets one focal action and a real hold.
4. **Rank the rest.** Secondary moves travel 50–70% as far as the hero and start 100–200 ms after it. About 0.1 s is a good first try for a supporting label, then tune it in playback. Ambient motion stays under 5% of the hero's travel, runs on a slow sine and never stops.
5. **Motion must mean something.** Every move should show grouping, order, cause or scale. Avoid decorative camera moves and perpetual motion. After each move the viewer must know where to look.
6. **One continuous world.** Close-ups are camera moves through a single layout. Carry objects across cuts: a dot becomes a node, a line becomes a path. A scene's exit state, meaning position, scale and highlighted field, becomes the next scene's entry state.
7. **A guide object.** One element, such as a ball, cursor or dot, travels through the film and causes each transition. It never teleports.
8. **Values come from motion.** Slider fill and number come from the knob's x position. Typed text is whatever has been "pressed" so far. Labels stay pinned to their owners.
9. **Weight by object class.** Small controls snap. Panels settle. The camera moves slowly enough to keep you oriented. Headlines arrive fast and then hold. If everything overshoots, nothing feels precise.
10. **Restraint.** Use one neutral field, one accent, two typefaces and a stable grid. Prefer real UI and sourced data over generic imagery.
11. **Guard what may not change.** Name the proportions, colors and shapes that keep a brand or character recognizable, as hard constraints.

---

## 4. Motion numbers cheat sheet

### Durations
| Use | Value |
|---|---|
| UI feedback (press, toggle) | 100–200 ms (Nielsen Norman Group: 100 ms feels instant) |
| UI moves | 200–500 ms |
| Hero reveals | 600–900 ms |
| Exits | 40–50% shorter than the entrance (Material 3: 400 ms in / 200 ms out) |

Write timing in seconds first, then convert: `frames = s × fps`. A 0.6 s entrance is 18 frames at 30 fps. Label reference timestamps with the reference's own frame rate.

### Easing
- **Entering:** ease-out. **Exiting:** ease-in. **Moving across the screen:** ease-in-out.
- **Camera:** the softest curves, such as ease-in-out-quart. Objects get snappier curves.
- **Linear:** only for rotation, progress bars and loop phase. Linear on a move is the quickest way to make a render look like a render.
- "Premium" usually means ease-out-quint on entrances, springs at damping ratio 0.8 and no overshoot on text.

### Springs
Damping ratio ζ = c / (2·√(k·m)):
| ζ | Feel |
|---|---|
| 1.0 | no bounce |
| 0.7–0.85 | premium |
| 0.4–0.6 | playful |
| < 0.3 | cartoon |

- Remotion's default spring (mass 1, damping 10, stiffness 100) works out to ≈ 0.5, and react-spring's default ≈ 1.0.
- Position and size may bounce. Opacity and color never do.
- Evaluate springs in closed form, as a function of time.
- When tuning, keep the destination fixed and change one parameter at a time.
- **Overshoot:** UI cards about 2%. Ceiling of 5–8%. Text 0%.
- All motion settles before the text that depends on it appears.

### Stagger and overlap
- Letters 1 frame apart, words 60–120 ms, list items 40–80 ms.
- Start the next element when the previous one is 30–50% done.

### Emphasis and character
- "Pop": scale 1.0 → 1.08 → 1.0 over 6 frames, peaking on the beat.
- Anticipation of about 3 frames, a brief squash on impact, and key poses pushed 10–30% for phone viewing.
- **Living holds:** a slow 2% push, or 1.00 → 1.03 over 3 s. Constant-percentage changes compound across frames, so define the push from start to end.

### Beats
- Frames per beat = fps × 60 / BPM. Compute each beat from time and round each one, never accumulate.
- Cut on the beat, change the layout on the bar (every 4 beats).

### Reading windows
- Count the hold from the moment the text is **legible**, not from when its entrance starts.
- Minimum: 0.3 s per word + 0.5 s. Then verify by reading aloud at normal speed, and extend any hold that ends before you finish. 8 frames at 30 fps is about 0.27 s, which is far too short.
- Keep supporting movement quiet during the hold.

### Motion blur
Use blur only on fast entrances, and let it settle with the movement. Never apply it during a reading hold. Check for smeared text and lingering trails.

### Camera
- 3D field of view: start at 35–50°. Parallax speeds: foreground 1.0, middle 0.5, background 0.2.
- 2D worlds: one camera transform, with zoom interpolated in log space. Text must not blur during moves.

### Type and readability
- Contrast at least 4.5:1 on every frame, and no more than 3 flashes per second (WCAG).
- Under eight words per line. Meaning must not depend on color alone.
- Text never moves while it's being read. Check interface labels at phone size.
- **Sizes at 1080p:** body text at least 40 px at 16:9 and at least 48 px at 9:16. Headlines 96–160 px. Keep 5% safe margins.

### Canvas sizes
16:9 1920×1080 · 1:1 1080×1080 · 4:5 1080×1350 · 9:16 1080×1920. Pick the canvas before the first frame.

---

## 5. Composition, hierarchy and story

- **Explainer arc:** 0–10% shows the familiar wrong picture. 10–35% reveals the smallest correct model. 35–75% shows one concrete example. 75–90% changes one variable. 90–100% returns to the opening image, now understood.
- **Product film:** hook (0–2 s) → problem → reveal through a real interaction → proof (one screen or number) → close with a readable CTA.
- **States before transitions:** for UI, write the state list first, then design the continuity between states.
- **Layout limits:** test with the longest copy you expect. Record the headline width, max lines, logo space and the final positions of text and product card. If a headline wraps to 3 lines, fix the copy, not the motion: shorten it, widen the box, or move supporting info to another shot. Re-render the landing frame after any copy change. Check the real font in the render.
- **Copy load:** use a short opening line and let the product action do the explaining. An explanation that needs several sentences gets its own scene.
- **Hierarchy:** the hero is the brightest, largest or most contrasted element. Don't center everything.
- **First and last frames:** a real hook in the first 2 s, and a last frame that works as a poster. Frame 0 is a finished composition.
- **Each format is its own composition.** Never center-crop a wide film into 9:16. 9:16 gets fewer elements and a stronger vertical hierarchy. 1:1 gets tighter type and shorter holds. 16:9 gets more spatial context. Design the smallest crop first.

## 6. Transitions

- Give each shot a handoff: a hard cut on the beat, a match cut, or a mask wipe. **Default to the cut.**
- In continuous UI films, transitions are camera moves led by the guide object. Ban hard cuts there.
- After any local edit, inspect both neighboring scene boundaries before watching the whole film. When transitions overlap scenes, count the overlap in the total duration.

## 7. Color and light

- One neutral field, one accent, two typefaces, all from the DESIGN.md (§2b).
- Replace "cool" with a lighting setup: key, fill and rim lights with exact values and soft contact shadows, and no glow.

## 8. Sound

**Picture first.** Feeds autoplay muted, so the film must work silently. Sound comes after the picture is approved.

**Sources: real files, not synthesized code.**
- Music: a licensed track the user supplies, or one under Mixkit's free license. Record the source and license.
- Sound effects: ready-made files, with one per cut or big move. Use a whoosh for movement, a pop for appearing, a click for clicks and typing sounds for typing.
- Use the project's existing library first (HyperFrames' changelog references bundled SFX in its media tooling). Ask if no library exists.
- *Never synthesize sound effects in code.*

**Timing.**
- Keep audio cues in the same timing file as the visual events, so shifting a card by 12 frames moves its sound with it.
- Align a sound's **loudest point** to its visual event, not the file start. Soft lead-ins move the audible hit, so find it on the waveform and offset the clip. The picture may lead the sound by up to 1 frame, never trail it.
- Beat detection (e.g. librosa) can lock onto the off-beat. In one case it was 0.22 s off. Plot the waveform below 120 Hz against the beat grid, zoom in on a few bars, and shift the whole grid if the kicks don't line up.
- Put cuts and title appearances on the beat. If the animation can't change, move where the music starts.
- Effects only on meaningful changes, plus one recurring musical motif. Keep music and effects on separate tracks with adjustable placement and volume.

**Mix.**
- Priority: voiceover loudest, effects above the music, music ducked under speech.
- Target about −16 LUFS integrated with true peak below −4 dBFS, so nothing clips after AAC compression or on a mono phone speaker.
- Measure the **exported MP4** with ffmpeg's `ebur128`, not the WAV.

**Verify.**
The model can't hear, so measure instead of judging by feel.
- Grab a frame before and after each cue from the exported MP4, and compare them with a waveform plot.
- Give the human 5 timestamps to check on headphones and a phone speaker: the loudest event, the quietest useful cue and the ending.
- Listen audio-only. If the sound has no shape on its own, it isn't finished.
- Never claim it "sounds good."

## 9. Loops

- Render frames 0 to N−1, never N. Drive loops from `phase = frame / N` with whole-number cycles. For organic drift, sample noise along a circle.
- Match the last frame to the first in position, direction, cursor and UI state.
- GIF at 24 fps: use five frames at 40 ms and then one at 50 ms to keep time.

---

## 10. Default ban list

Ban these by name, and after each first render add whatever the model used anyway.

- Purple or blue gradients, glow, bloom, lens flares, neon, glow orbs
- Decorative particles and particle bursts
- Everything fading in at once, or fade-and-slide-up on every element
- Centered-everything layouts, big centered text with muddy shadows, a logo fading to black at the end
- Text that moves or blurs while it's being read
- Spinning turntables, generic dark-space backgrounds
- Excessive bouncing, disconnected transitions, teleporting objects
- Stock footage, generic AI imagery, invented UI, metrics or taglines
- Decorative camera moves, perpetual motion
- Linear easing on movement
- Sound effects synthesized in code, or unlicensed music

## 11. Render contract (brief)

- Every frame is a pure function of time, `frame = render(t)`, and any frame renders on its own.
- No wall clock, timers, `requestAnimationFrame` loops, CSS transitions or state carried between frames. Seed all randomness and load assets before frame 0.
- Fixed fps, size and length. Fixed event times for every click, key and card.
- Text, numbers, timings and audio cues live in one data file, so "slow down scene 2" or "change this to 18%" touches one value and nothing else moves.
- Render the same frame twice and compare the pixels. Save the exact render command.
- Use frame counters and `?t=` freezing only during iteration. Label scene-local frames separately from global ones (local 30 in a scene that starts at 120 is global 150).

## 12. Environments and toolbox (compact)

| Environment | Time driver | Stills / export |
|---|---|---|
| Remotion | `useCurrentFrame()`, `interpolate()`, `spring()`, `<Sequence>` | `npx remotion render … --frames=0,30,60` |
| HyperFrames | Paused GSAP timeline in `window.__timelines[id]`; also seeks CSS, Anime.js, Lottie, Three.js, WAAPI | `npx hyperframes snapshot --at 0,2,5` / `render` |
| HTML + Playwright | `window.seek(t)` per frame + screenshot + ffmpeg | — |
| GSAP / Anime.js / Lottie / PixiJS | `tl.seek(s)` / `anim.seek(ms)` / `goToAndStop(f, true)` / `autoStart:false` + `app.render()` | via HTML harness |

Other tools: **Three.js** (time from the frame number) · **Manim** (time-stepped at a fixed `--fps`) · **Theatre.js** (sequence `position`; verify per-frame seeking first) · **VideoDB** (search and indexing, not a renderer) · **librosa + ffmpeg** (beats and loudness, §8).

---

## 13. Review and repair

- **Critic prompt with fixed checkpoints:** pick 4 timestamps (e.g. 1.5, 4.0, 8.5, 14.0 s). Check text contrast against its container, and that motion settles before text appears. Score polish from 1 to 10. If the score is below 8, fix the two worst defects with a minimal patch.
- **Independent critic:** a separate session gets only the brief, the stills and the extracted frames. It returns at most 5 frame-specific corrections, and the accepted ones go to the builder.
- **Correction format, 4 fields:** location (frame or time) · observed problem · change · what stays fixed.
- **Fix order:** missing or unreadable information first, then timing, then visual detail.
- **Scope:** patch locally and re-render only the affected range. Send one or two notes per round.
- **Tools:** a contact sheet, strips around the fastest transitions, onion skin, speed graphs, and the frames on either side of a stubborn bug.

### Review checklist
- [ ] Real hook in the first 2 s. Frame 0 and the last frame both work as stills.
- [ ] One hero and one screen owner per moment. The eye knows where to go after every move.
- [ ] Each reading hold, counted from legibility, survives a read-aloud. Text is still, sharp (no blur) and at 4.5:1 or better.
- [ ] Longest copy fits its layout limits. No 3-line headlines. Labels are readable at phone size.
- [ ] Motion settles before dependent text appears. Overshoot only on position and size, about 2% on cards.
- [ ] Easing matches direction. No linear moves.
- [ ] Guide-object handoffs are continuous. Values stay attached. Scene boundaries are clean.
- [ ] Only real assets. Every color, font, size, radius and shadow matches a DESIGN.md token; nothing is off-system.
- [ ] Same component, same radius and type in every scene. The accent appears only in its assigned role.
- [ ] Cuts and titles on a verified beat grid (kicks checked below 120 Hz). Sound peaks aligned to events.
- [ ] Licensed music and file-based SFX with sources noted. Mix ≈ −16 LUFS, true peak < −4 dBFS, measured on the MP4, mono-safe.
- [ ] Muted check passed, audio-only check passed, 5 headphone timestamps handed to the human.
- [ ] Loop seam invisible. Same frame rendered twice is identical. Each format recomposed and checked.

### Failure modes → fix
| Symptom | Fix |
|---|---|
| Looks "AI-made" | Name the defaults it used, ban them, re-render |
| Generic or sloppy styling | Fix the DESIGN.md first (real tokens, one accent, one radius per element), then re-animate |
| Busy | One screen owner; others about 0.1–0.15 s later at 60% travel |
| Cursor collides with headline | Delay one event or reroute the cursor |
| Text unreadable or hold too short | Count from legibility, read aloud, extend |
| Headline wraps to 3 lines | Fix the copy or box before touching motion |
| Smeared text | Blur only during the entrance, none in the hold |
| Drags / doesn't pop | Cut each hold by a beat / 1.0→1.08→1.0 on the beat |
| Frame differs between runs | Clock or unseeded random somewhere |
| Loop stutter / music drift | Rendered frame N / accumulated beat rounding |
| Cuts feel off the music | Beat grid on the off-beat: re-check kicks below 120 Hz, shift grid or music start |
| Click lands late | Align the file's loudest point, not its start |
| Clipping on phones | Re-measure the MP4: −16 LUFS, true peak < −4 dBFS |
| Same error twice | Circuit breaker: stop and rethink |
| Invented UI or numbers | Missing asset is a blocker: ask |

---

## 14. Prompt template (fill every line)

```
<inputs>
Ask me for: [list]. If I skip any, use: [defaults]. Attach: real screenshots, data, licensed track.
DESIGN.md: [path] (own product first; else extracted from [site]). Use only its tokens, plus its ## Motion section.
</inputs>

<goal>
For [who], playing on [where], about [N] s, [format/fps].
After one watch they should understand: [one sentence]. They start believing: [prior belief].
</goal>

<direction>
Style anchor: tokens from [screenshot path]. Palette: [neutral], [one accent], text [hex]. Type: [2 faces].
References: [file] → job: [one thing to learn from it].
Layout limits: headline width [px], max [2] lines, logo space [px], final positions [x,y].
Guide object: [what travels and causes each transition].
Motion by class: micro UI [ms, curve]; cards [spring ζ, ~2% overshoot]; camera [ease-in-out-quart];
headlines [ease-out-quint, hold counted from legibility].
One screen owner at a time; secondaries +0.1 s at 50–70% travel. No blur in reading holds.
Banned: [§10 + anything seen in previous renders]. Never invent screens, metrics or quotes.
</direction>

<structure>
BPM [x] → [frames/beat]. Each shot as an event — start state → cursor → press → result → reading hold:
1. [0.0–2.0 s] HOOK | entry → exit | hero | words | sound cue
...
N. Close: poster-worthy final state (or matches frame 0 for loops).
</structure>

<sound>
Music: [supplied / Mixkit track + license]. SFX from the project library: whoosh/pop/click/typing.
Cues in the same timing file as visuals; align loudest points. Verify the beat grid below 120 Hz.
VO > SFX > music (ducked). ~−16 LUFS, true peak < −4 dBFS, measured on the MP4.
</sound>

<build>
Every frame = f(t); all text, numbers, timings and cues in one data file. Separate compositions per format.
</build>

<gotchas>
[e.g. labels stay attached; typed keys match text; no teleporting; cursor never crosses a headline mid-entrance.]
</gotchas>

<start>
Show the timed storyboard and 3 stills (opening, result, closing) before building.
After the draft: frames at 1 fps, the critic pass (≤5 corrections, 4-field format), then 5 timestamps for me to check on headphones.
</start>
```
