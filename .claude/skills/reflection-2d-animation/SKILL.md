---
name: reflection-2d-animation
description: Conventions for 9:16 reflective 2D shorts built with Remotion, SVG rigs and Edge TTS narration in this repository.
---

# Reflection 2D animation

## Format
- Composition `ReflexionDialogo`: 1080x1920, 30 fps, 600 frames (20 s). Source in `src/scenes/Dialogue.tsx`.

## Characters
- `src/rig/Person.tsx` is an articulated SVG figure. Origin is the hip; `facing` flips it to +x/-x.
- Pose: `breath` (chest scale), `headTilt` (rotates around the neck), `armL`/`armR` ([upper, forearm] degrees).
- Expression: `brow`, `smile`, `mouthOpen`, `eyeOpen`. Use `blink()` from `src/lib/anim.ts` for eyes.
- One person at two ages: keep skin and face identical; change hair color, wardrobe and `wrinkles`.
- Arm sign convention: left-side positive angles swing outward; right-side negative swing outward.

## Motion
- Breathing: `breath(frame, fps, periodSeconds)`. Blink: `blink(frame, period, offset)`. Ease: `smooth(frame, start, end)`.
- Camera and parallax live in `Dialogue.tsx`: a push-in group scale, and background layers that move at different factors.

## Narration and subtitles
- Voices are generated with Edge TTS by `tools/tts/generate.py` (`npm run tts`) into `public/audio/` with `.vtt` timings.
- Subtitle text and frame ranges are hard-coded in the scene from the VTT timings. Re-check them after regenerating audio.
- If the network uses a TLS-intercepting proxy, set `CA_BUNDLE` to the proxy CA file. Never disable certificate verification.

## Commands
- Preview: `npm run studio`
- Type-check: `npm run typecheck`
- Render MP4: `npm run render` (output `out/dialogo.mp4`, not committed). CI: the "Render MP4" workflow.
