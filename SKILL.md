---
name: attention-editor
description: Edit a member's recordings into finished videos with Remotion, made for Instagram Reels. Use when a member drops in recordings or asks for any video edit, caption, title, graphic, overlay, transition or animation in this folder.
---

# Attention Editor

Made for Instagram Reels: vertical, 1080×1920, unless the member wants another shape.

House rules for editing: where things go, what to check, and the few parts that ship ready-made. How to cut, caption and animate is up to you and the member's preferences.

## Talking to the member

Members are online coaches, consultants and business owners, not developers. Avoid technical language. Use short, ADHD-friendly sentences and simple lists. Keep their cognitive load as low as possible and focus on the result: the video. When you need a decision, ask with the question tool.

## Start of every chat that touches a video

- Remotion's official skills (`remotion-dev/skills`) are the guide for all Remotion work. Install them in the main folder if they're missing (`npx skills add remotion-dev/skills`, project scope), otherwise update them (`npx skills update -p -y`).
- Read `preferences.md` in the main folder, if it exists.
- Check `ELEVENLABS_API_KEY` is in `.env` in the main folder. If not, walk the member through making one on elevenlabs.io, have them paste it in the chat, test it with one small request, and save it. Never show the key back or copy it anywhere else.

## When recordings come in

- Several files at once: ask whether they're parts of one video or separate videos, and what the member wants.
- Never move, rename or change the member's files. They stay where they are on the disk.

## Projects

- Each video gets its own Remotion project in `videos/YYYY-MM-DD-slug/`, with a slug that says what the video is about. If the name is taken, add `-2`.
- You only know what it's about once you've heard it. Transcribe first (for example into the system temp folder), then create the project and move the transcripts in.
- Every project has:
  - `about.md`: what the video is about, and the full paths of the original recordings;
  - `transcripts/`: one file per recording;
  - `export/`: finished videos.
  The rest of the layout is up to you.
- Remotion only reads files inside the project's `public/`. Hard-link each recording in (`ln`, no extra disk space). Symbolic links play in the preview but fail at export. If the recording is on another drive, copy it.

## Listening and sound

- ElevenLabs does all the listening and sound: transcripts with word timings (Scribe), sound effects, music and voiceovers. Use it instead of the local Whisper options in the Remotion captions skill.
- Every call costs the member credits. Transcribe each recording once and reuse the file.

## Preview

Show work in the ready-made player in `assets/player/`, not Remotion Studio. Open Studio only when the member asks.

1. Copy `assets/player/` into the project as `player/`, and `assets/safe-zones.ts` to `src/safe-zones.ts`.
2. Create `src/preview.ts` exporting `preview = { component, durationInFrames, fps, width, height }`, usually the same values as the main composition.
3. Install `@remotion/player`, `vite` and `@vitejs/plugin-react`, then run `npx vite player` in the project.

Open it in your internal browser if you can, and give the member the link as soon as there's something to see. It reloads on every change, so it never autoplays and comes back paused on the same frame. On vertical videos, an "Instagram overlay" button shows what the app covers and what iPhones cut off at the sides; it starts off.

## Safe zone

`assets/safe-zones.ts` holds the part of a vertical Reel that Instagram leaves visible on an iPhone.

- Centre things on the screen, not on the safe zone. The zone is lopsided, and something centred in it looks off.
- Text never leaves the zone, unless the member asks: captions, titles, labels, calls to action, text on cards. Place it from the bands in `src/safe-zones.ts`, not by eye. For centred text, use the widest column around the screen's centre that still fits the band.
- Other graphics (pictures, cut-outs, shapes) may run past the zone and off the frame where that looks right. Use judgment. Don't fade them at the edge.
- Keep the member's face clear, especially eyes and mouth, unless they ask otherwise. Framing differs a lot between recordings, so look at where the face sits first and place everything around it, as best you can.
- When things compete for space, captions win: centred, inside the zone. Then pictures and cards, big enough to see on a phone. Everything else is a judgment call.

## Captions

- No punctuation. Apostrophes and hyphens inside words stay (don't, flip-flop).
- No capital at the start of a sentence. Names and "I" keep theirs.

## Pictures

When the member mentions a brand, product, app, person or place, do your best to show the real thing, not only text: logos, photos, screenshots. A real picture beats a word on screen.

- Logos: Simple Icons (`cdn.jsdelivr.net/npm/simple-icons@latest/icons/<name>.svg`, black, single colour) or Wikimedia Commons.
- People and places: Wikimedia Commons (Wikipedia's lead photo is a good start) or official press kits. Prefer free licenses.
- Save them in `public/images/` and list each source and license in `about.md`.
- Cut-outs (people or objects without a background), when the style or the member wants them: remove the background locally, for example with `@imgly/background-removal-node`. Check the edges on a coloured background before using it.
- Not sure it's the right person, logo or version? Or only a blurry one? Use text instead and tell the member.

## Motion graphics

Before designing or changing any title, graphic, overlay, transition or animation, read [references/motion-design.md](references/motion-design.md) in full. Captions are not motion graphics; the guide doesn't cover them.

## The member's preferences

When the member says what they like or dislike (caption look, cut style, music, things to avoid), save it to `preferences.md` in the main folder, in plain words. It's theirs to read and change.

## Known pitfalls

- Phone videos are often stored sideways with a rotation tag. Check it before reading the recording's width and height.
- In phone videos the sound can start a split second after the picture. If words land late against the picture, check this first.
- Joining clips: overlap the sound by a frame or two at each cut, from about half volume, or it clicks. Not at the very start or end. `<TransitionSeries>` remounts clips and makes the player stall on every cut.
- The preview hides some export problems (layers out of line, unreadable files). Check graphics with `npx remotion still` at that moment, and pause the player before taking screenshots.
- Graphics behind the member: the cut-out and the picture under it must both come from the same `@remotion/video-matting` run (its base layer), never the original recording. Otherwise they're drawn at slightly different sizes and edges show twice.
- First and last frames: cut where they look away or down. Start and end on closed eyes if the audio allows.
