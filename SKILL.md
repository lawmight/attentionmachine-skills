---
name: attention-editor
description: Edits raw recordings into videos for social media using Remotion. Best for Instagram Reels (9:16), but also suitable for other platforms like TikTok, LinkedIn and YouTube (incl. 16:9). Use for any video edit, caption, title, graphic, overlay, transition or animation, or to copy the style of a video.
---

# Attention Editor

Optimized for Instagram Reels: vertical, 1080x1920, unless the user wants another aspect ratio.

This skill is the engine: where things may go, what to check, and the few parts that ship ready-made. How things look, sound and move (fonts, sizes, colours, how captions read, pacing, cuts, animation) comes from a style. Without one, use your judgment.

The user's own things live in `.attention-editor/` in the main folder: `preferences.md`, their own `styles/`, and `.env` with their keys.

## STRICT RULES

These are strict rules that you must not break unless there is an explicit user ask for it. 

- Always read `.attention-editor/preferences.md`, if it exists. These are explicit user overrides that you must acknowledge.
- Avoid technical language. Users are online coaches, consultants and business owners, not developers. Use short, ADHD-friendly sentences and simple lists.
- Keep their cognitive load as low as possible and focus on the result: the video. When you need a decision, ask with the question tool.
- You must never ask the user for something that you can easily solve yourself. You are their assistant. Act like it.

## SYSTEM REQUIREMENTS

- Remotion's official skills are the guide for all Remotion work. Install them if they're missing (`npx skills add remotion-dev/skills`, project scope), otherwise update them (`npx skills update -p -y`).
- Check `ffmpeg -version` runs. If not, install it with Homebrew if on Mac (`brew install ffmpeg`) or OS-appropriate ways on Windows/Linux. The one bundled with Remotion is missing the sound filters this skill uses.
- Check `ELEVENLABS_API_KEY` is in `.attention-editor/.env`. If not, walk the user through making one on elevenlabs.io, have them paste it in the chat, test it with a tiny transcription, and save it. Keys can be limited to some features, so test with a real request, not the account page. Never show the key back or copy it anywhere else.

## When recordings come in

- Several files at once: ask whether they're parts of one video or separate videos, and what the user wants.
- Never move, rename or change the user's files. They stay where they are on the disk.

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
- Every call costs the user credits. Transcribe each recording once and reuse the file.
- Transcribe with `scribe_v2`. When `preferences.md` lists names (the user, their business, products, people they mention), pass them as `keyterms` so they come back spelled right. That costs 20% more, so skip it when there are none.
- Coughs, throat clears and laughs come back as sound tags (`audio_event`). The cut tool cuts out coughs and throat clears and keeps laughter.
- Before captions go on screen, fix names the transcript got wrong against the user's names, and write spoken numbers as digits ("twenty five" → "25", "a hundred percent" → "100%"). Change nothing else.
- Recordings come in at very different loudness. The cut tool's voice track already sits at −14 LUFS with peaks under −1.5 dB; keep music and effects under it. After every export, run `node <this skill>/scripts/finish-sound.mjs <export>`: it sets the whole video to that level and leaves the picture untouched.
- Plans limit how many requests run at once, two on the free plan. Send at most two at a time. On a "too many concurrent requests" error, wait a moment and send it again.

## Cutting

### What to keep

Read the whole transcript first. Then choose:

- Open on the strongest hook, never on warm-up. Speakers often re-record the hook at the end of a session, so look there too. Keeps play in the order you list them.
- Keep the last complete take of each line, and never stitch one line from two attempts. A take the speaker rejects out loud ("no", "again", "scratch that") goes, and so does a correction mid-sentence, even without a pause. With several recordings, retakes often sit in the next one.
- Leave out filler: um, uh, er, hmm and their versions in other languages; "like", "you know", "I mean", "basically" when they add nothing; doubled words; words cut off halfway.
- The words on both sides of every cut must read as one sentence.
- End on a landing. Exactly one call to action survives, and it closes the video.
- Keep it under 2:50, never over 3:00; shorter is better. A length the user asks for wins.
- Note where a picture, clip, number or zoom would earn its place: a thing named, a number said, something shown.
- Then read the kept words end to end: nothing said twice, no filler, every join reads right, nothing refers to something not heard yet, no rejected take, opens on the hook, ends on the payoff.

### Placing the cuts

- Choose keeps as words, never as times. Transcript word ends are often early, so cuts placed on them clip words. `node <this skill>/scripts/snap-cuts.mjs words <transcript>` numbers the words and shows the sounds between them. `node <this skill>/scripts/snap-cuts.mjs <recording> <transcript> <keeps.json> <fps> --voice=public/voice.wav` places every cut in the quiet around them, lays out the clips, and writes the cut sound with a short fade at every cut so nothing clicks.
- Play `voice.wav` as one `<Audio>` from the first frame, and `picture` as muted `<Video>` clips. `words` gives every kept word's frames in the video; time captions from it.
- The defaults: pauses over 500 ms are cut out, 200 ms of the quiet at each cut plays on top of itself so the words flow, and the picture switches halfway through it. A style or the user can change them: `--max-pause=<ms>` (`off` keeps every pause), `--overlap=<ms>` (`max` makes the words almost touch), `--j-cut=<ms>` (the next line is heard this long before it's seen).
- To cut a pause the tool keeps, end one keep before it and start the next after it.
- Captions follow the sound. Graphics that arrive with a new shot follow the picture.
- Where it warns that a cut lands on sound, keep the word next to it if the sentence still reads right, or use another take, and run it again. For whatever's left, give the user at most three video times to listen to, the ones most likely to be heard.
- Before handing over, transcribe `voice.wav` and compare it with the words you kept: every word there, nothing extra.

## Showing the work

Show the user stills and exports, not a live preview. Open Remotion Studio only when they ask.

- An export takes a few minutes per minute of video. For changes to how things look, show stills first: render the moments that changed with `npx remotion still` and embed them in your reply. Export once the user is happy, or straight away for changes stills can't show (timing, sound, motion).
- Check your own work in stills at the moments that matter before every export.
- Export into `export/`, with a new name each time (`-v2`, `-v3`) so the user can compare. Open the folder for them and say what changed.

## Where things go

`assets/safe-zones.ts` holds the part of a vertical Reel that Instagram leaves visible on an iPhone, and the named positions below. Copy it to `src/safe-zones.ts` in every vertical project.

When the user asks why something isn't where they expected (lower, nearer the edge), explain what the app would cover there: the caption and account name at the bottom, the buttons on the right, the top bar, or the sides iPhones cut off.

- Centre things on the screen, not on the safe zone. The zone is lopsided, and something centred in it looks off.
- Text never leaves the zone, unless the user asks: captions, titles, labels, calls to action, text on cards. Place it from `src/safe-zones.ts`, not by eye. For centred text, `column()` gives the widest stretch around the screen's centre that stays inside.
- Other graphics (pictures, cut-outs, footage, shapes) may run past the zone and off the frame where that looks right. Use judgment. Don't fade them at the edge.
- Keep the speaker's face clear, especially eyes and mouth, unless the style or the user asks otherwise. Framing differs a lot between recordings, so look at where the face sits first and place everything around it, as best you can.
- When things compete for space, captions win, then pictures and footage, big enough to see on a phone. Everything else is a judgment call.

### Named positions

Styles and users can name a height. `POSITIONS` pins it:

- **top**: the top edge sits on the top of the zone.
- **center**: the middle sits on the middle of the screen.
- **off-center**: the middle sits in the middle of the lower part of the zone, below the chin on most framings.
- **bottom**: the bottom edge sits on the bottom of the zone.

A named position is a starting point. If it would cover the face on this recording, move to the nearest spot that doesn't.

### When the style doesn't fit the recording

Styles are written from one kind of footage: standing or seated, wide or close, room above the head or not. When this recording differs (the head fills the top, the background is too pale for the style's text, a size won't fit the zone), keep what the style is going for and adapt: move to the nearest named position that works, shrink text to fit the zone, make it readable on this background. Tell the user what you changed and why.

## Layouts

Besides the speaker full screen, styles can ask for:

- **split**: the frame cut into two stacked parts (50/50 unless the style says otherwise), the speaker cropped into one, other footage in the other. Keep the face inside its part.
- **inset**: a smaller video or picture floating over the speaker.
- **cutaway**: other footage full screen for a moment; the speaker's voice keeps going.

When a layout needs footage or a picture you don't have, put `assets/Placeholder.tsx` there (copy it into `src/`) with a short label of what belongs there, and keep going. Then tell the user each placeholder in plain words, with what you recommend: their own clip, a screenshot you can make, a picture you can find, or an animation you can build. Never export with a placeholder left in, unless the user says so.

## Pictures

When the user mentions a brand, product, app, person or place, do your best to show the real thing: logos, photos, screenshots. How pictures look and where they go comes from the style.

- Logos: Simple Icons (`cdn.jsdelivr.net/npm/simple-icons@latest/icons/<name>.svg`, black, single colour) or Wikimedia Commons.
- People and places: Wikimedia Commons (Wikipedia's lead photo is a good start) or official press kits. Prefer free licenses.
- Save them in `public/images/` and list each source and license in `about.md`.
- Cut-outs (people or objects without a background), when the style or the user wants them: remove the background locally, for example with `@imgly/background-removal-node`. Check the edges on a coloured background before using it.
- Not sure it's the right person, logo or version? Or only a blurry one? Leave it out, or use a placeholder, and tell the user.

## Styles

A style is a `style.md` describing one look: fonts, sizes, line spacing, colours, how captions read (case, punctuation, words at a time), named positions, layouts, pictures, pacing, cuts, motion and sound. Ready-made ones are in `styles/` in this skill. The user's own are in `.attention-editor/styles/`.

- Ask which style to use when a video starts, unless `preferences.md` already says. Note it in the project's `about.md`.
- Follow the style closely. Text stays in the safe zone whatever the style says, unless the user asks otherwise. The face stays clear unless the style or the user says to cover it.
- A user who wants to change a style gets their own copy in `.attention-editor/styles/`, with a new name. Never edit a ready-made style for one user.
- A style the user builds from scratch while editing also goes in `.attention-editor/styles/`.
- When the user gives feedback on the look while using their own style, update that style. On a ready-made style, offer them their own copy.

### Stealing a style from a video

When a user shares videos they like and wants that look ("steal this style", "make a style out of this", "copy this"), read [references/steal-a-style.md](references/steal-a-style.md) in full and follow it. It ends in a new `style.md` in `.attention-editor/styles/`.

## Motion graphics

Before designing or changing any title, graphic, overlay, transition or animation, read [references/motion-design.md](references/motion-design.md) in full. Where the style says how something moves, the style wins. Captions are not motion graphics; the guide doesn't cover them.

## The user's preferences

`.attention-editor/preferences.md` holds what's true about the user whatever the style: their usual style, their audience, their brand (names to spell right, colours, fonts, logo files), and things to avoid in every video. Save what they tell you there, in plain words. How a look looks, sounds and moves goes in a style, never here.

## Known pitfalls

- Phone videos are often stored sideways with a rotation tag. Check it before reading the recording's width and height.
- In phone videos the sound can start a split second after the picture. If words land late against the picture, check this first.
- iPhone videos can carry a second, spatial sound track browsers can't play. Pick the normal track (`audioStreamIndex={0}`). At export, `@remotion/media` may fail to read such a file and fall back to the slower reader on its own; that's fine.
- Never make lighter working copies of recordings.
- Joining sound clips without the tool (music, voiceovers): overlap them by a frame or two, from about half volume, or it clicks. Not at the very start or end.
- Anything on screen keeps its look and place from its first frame to its last, unless the style animates it. If something else changes how it should look (a card arriving), decide once per item, not per frame, or it flips halfway.
- Graphics behind the speaker: the cut-out and the picture under it must both come from the same `@remotion/video-matting` run (its base layer), never the original recording. Otherwise they're drawn at slightly different sizes and edges show twice.
- First and last frames: cut where they look away or down. Start and end on closed eyes if the audio allows.
- Text on more than one line runs into itself easily, most of all stacked sizes and tucked lines. Check each one in a full-size still: no letters touch (tall letters, tails, i-dots, accents) unless the style says they do. Fonts carry different built-in spacing, so judge the gaps you see, not a line-height number.
- Gradient-filled text (`background-clip: text`) shows its `text-shadow` through the letters. Give it shadows and glows with `filter: drop-shadow()` instead.
