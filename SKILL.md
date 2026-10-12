---
name: attention-editor
description: Edit a member's recordings into finished videos with Remotion, made for Instagram Reels. Use when a member drops in recordings, asks for any video edit, caption, title, graphic, overlay, transition or animation in this folder, or wants to copy the style of a video they like.
---

# Attention Editor

Made for Instagram Reels: vertical, 1080×1920, unless the member wants another shape.

This skill is the engine: where things may go, what to check, and the few parts that ship ready-made. How things look, sound and move (fonts, sizes, colours, how captions read, pacing, cuts, animation) comes from a style and the member's preferences. With neither, use your judgment.

## Talking to the member

Members are online coaches, consultants and business owners, not developers. Avoid technical language. Use short, ADHD-friendly sentences and simple lists. Keep their cognitive load as low as possible and focus on the result: the video. When you need a decision, ask with the question tool.

## Start of every chat that touches a video

- Remotion's official skills (`remotion-dev/skills`) are the guide for all Remotion work. Install them in the main folder if they're missing (`npx skills add remotion-dev/skills`, project scope), otherwise update them (`npx skills update -p -y`).
- Read `preferences.md` in the main folder, if it exists.
- Check `ELEVENLABS_API_KEY` is in `.env` in the main folder. If not, walk the member through making one on elevenlabs.io, have them paste it in the chat, test it with a tiny transcription, and save it. Keys can be limited to some features, so test with a real request, not the account page. Never show the key back or copy it anywhere else.

## When recordings come in

- Several files at once: ask whether they're parts of one video or separate videos, and what the member wants.
- Never move, rename or change the member's files. They stay where they are on the disk.

## Projects

- Each video gets its own Remotion project in `videos/YYYY-MM-DD-slug/`, with a slug that says what the video is about. If the name is taken, add `-2`.
- You only know what it's about once you've heard it. Transcribe first (for example into the system temp folder), then create the project and move the transcripts in.
- Every project has:
  - `about.md`: what the video is about, the style it uses, and the full paths of the original recordings;
  - `transcripts/`: one file per recording;
  - `export/`: finished videos.
  The rest of the layout is up to you.
- Remotion only reads files inside the project's `public/`. Hard-link each recording in (`ln`, no extra disk space). Symbolic links fail at export. If the recording is on another drive, copy it.

## Listening and sound

- ElevenLabs does all the listening and sound: transcripts with word timings (Scribe), sound effects, music and voiceovers. Use it instead of the local Whisper options in the Remotion captions skill.
- Every call costs the member credits. Transcribe each recording once and reuse the file.

## Cutting

- Choose what to keep as words from the transcript, never as times. Transcript word ends are often early, so cuts placed on them clip words. `node <this skill>/assets/snap-cuts.mjs words <transcript>` numbers the words; `node <this skill>/assets/snap-cuts.mjs <recording> <transcript> <keeps.json> <fps>` places every cut in the quiet around them and lays out the clips.
- Use its clips as they are: `sound` as `<Audio>` clips, `picture` as muted `<Video>` clips. By default the picture switches 200 ms after the sound (a J-cut), so the next line is heard just before it's seen. A style or the member can change that with `--j-cut=<ms>`; `--j-cut=0` cuts both together.
- Captions follow the sound. Graphics that arrive with a new shot follow the picture.
- To cut out a pause, end one keep before it and start the next after it. Where it warns that a cut lands on sound, choose other words or listen to that cut.
- How tight the cuts are comes from the style.
- Before handing over, export only the sound (`--codec=wav`), transcribe it and compare it with the words you kept.

## Showing the work

Show the member exports, not a live preview. Open Remotion Studio only when they ask.

- Check your own work with `npx remotion still` at the moments that matter, before exporting. An export takes a few minutes per minute of video.
- Export into `export/`, with a new name each time (`-v2`, `-v3`) so the member can compare. Open the folder for them and say what changed.

## Where things go

`assets/safe-zones.ts` holds the part of a vertical Reel that Instagram leaves visible on an iPhone, and the named positions below. Copy it to `src/safe-zones.ts` in every vertical project.

When the member asks why something isn't where they expected (lower, nearer the edge), explain what the app would cover there: the caption and account name at the bottom, the buttons on the right, the top bar, or the sides iPhones cut off.

- Centre things on the screen, not on the safe zone. The zone is lopsided, and something centred in it looks off.
- Text never leaves the zone, unless the member asks: captions, titles, labels, calls to action, text on cards. Place it from `src/safe-zones.ts`, not by eye. For centred text, `column()` gives the widest stretch around the screen's centre that stays inside.
- Other graphics (pictures, cut-outs, footage, shapes) may run past the zone and off the frame where that looks right. Use judgment. Don't fade them at the edge.
- Keep the member's face clear, especially eyes and mouth, unless the style or the member asks otherwise. Framing differs a lot between recordings, so look at where the face sits first and place everything around it, as best you can.
- When things compete for space, captions win, then pictures and footage, big enough to see on a phone. Everything else is a judgment call.

### Named positions

Styles and members can name a height. `POSITIONS` pins it:

- **top**: the top edge sits on the top of the zone.
- **center**: the middle sits on the middle of the screen.
- **off-center**: the middle sits in the middle of the lower part of the zone, below the chin on most framings.
- **bottom**: the bottom edge sits on the bottom of the zone.

A named position is a starting point. If it would cover the face on this recording, move to the nearest spot that doesn't.

### When the style doesn't fit the recording

Styles are written from one kind of footage: standing or seated, wide or close, room above the head or not. When this recording differs (the head fills the top, the background is too pale for the style's text, a size won't fit the zone), keep what the style is going for and adapt: move to the nearest named position that works, shrink text to fit the zone, make it readable on this background. Tell the member what you changed and why.

## Layouts

Besides the member full screen, styles can ask for:

- **split**: the frame cut into two stacked parts (50/50 unless the style says otherwise), the member cropped into one, other footage in the other. Keep the face inside its part.
- **inset**: a smaller video or picture floating over the member.
- **cutaway**: other footage full screen for a moment; the member's voice keeps going.

When a layout needs footage or a picture you don't have, put `assets/Placeholder.tsx` there (copy it into `src/`) with a short label of what belongs there, and keep going. Then tell the member each placeholder in plain words, with what you recommend: their own clip, a screenshot you can make, a picture you can find, or an animation you can build. Never export with a placeholder left in, unless the member says so.

## Pictures

When the member mentions a brand, product, app, person or place, do your best to show the real thing: logos, photos, screenshots. How pictures look and where they go comes from the style.

- Logos: Simple Icons (`cdn.jsdelivr.net/npm/simple-icons@latest/icons/<name>.svg`, black, single colour) or Wikimedia Commons.
- People and places: Wikimedia Commons (Wikipedia's lead photo is a good start) or official press kits. Prefer free licenses.
- Save them in `public/images/` and list each source and license in `about.md`.
- Cut-outs (people or objects without a background), when the style or the member wants them: remove the background locally, for example with `@imgly/background-removal-node`. Check the edges on a coloured background before using it.
- Not sure it's the right person, logo or version? Or only a blurry one? Leave it out, or use a placeholder, and tell the member.

## Styles

A style is a `style.md` describing one look: fonts, sizes, colours, how captions read (case, punctuation, words at a time), named positions, layouts, pictures, pacing, cuts, motion and sound. Ready-made ones are in `styles/` in this skill. The member's own are in `styles/` in the main folder.

- Ask which style to use when a video starts, unless `preferences.md` already says. Note it in the project's `about.md`.
- Follow the style closely. Text stays in the safe zone whatever the style says, unless the member asks otherwise. The face stays clear unless the style or the member says to cover it.
- A member who wants to change a style gets their own copy in the main folder `styles/`, with a new name. Never edit a ready-made style for one member.

### Copying a style from a video

When a member shares videos they like and wants that look:

1. Download them (`yt-dlp`; Instagram needs a logged-in browser's cookies, `--cookies-from-browser`). If one browser is blocked by the computer's privacy settings, try another.
2. Transcribe them. What creators say often explains what they do.
3. Look at one frame per second for the overview, then frame by frame around every cut and every new graphic. One frame per second hides all motion.
4. Look at full-size crops of the text to read fonts and sizes.
5. Ask the member about sound. Loudness alone can't tell music from room noise or sound effects.
6. Write a `style.md` in the main folder `styles/<name>/`, like the ready-made ones: the system behind the look, so it works on a new recording. No creator names, no lines from their videos.
7. Offer to try it on one of the member's recordings.

## Motion graphics

Before designing or changing any title, graphic, overlay, transition or animation, read [references/motion-design.md](references/motion-design.md) in full. Where the style says how something moves, the style wins. Captions are not motion graphics; the guide doesn't cover them.

## The member's preferences

When the member says what they like or dislike (caption look, cut style, music, things to avoid), save it to `preferences.md` in the main folder, in plain words. It's theirs to read and change.

## Known pitfalls

- Phone videos are often stored sideways with a rotation tag. Check it before reading the recording's width and height.
- In phone videos the sound can start a split second after the picture. If words land late against the picture, check this first.
- iPhone videos can carry a second, spatial sound track browsers can't play. Pick the normal track (`audioStreamIndex={0}`). At export, `@remotion/media` may fail to read such a file and fall back to the slower reader on its own; that's fine.
- Never make lighter working copies of recordings.
- Joining clips: overlap the sound by a frame or two at each cut, from about half volume, or it clicks. Not at the very start or end.
- Anything on screen keeps its look and place from its first frame to its last, unless the style animates it. If something else changes how it should look (a card arriving), decide once per item, not per frame, or it flips halfway.
- Graphics behind the member: the cut-out and the picture under it must both come from the same `@remotion/video-matting` run (its base layer), never the original recording. Otherwise they're drawn at slightly different sizes and edges show twice.
- First and last frames: cut where they look away or down. Start and end on closed eyes if the audio allows.
