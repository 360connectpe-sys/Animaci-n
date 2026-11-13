import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PaperDefs} from '../paper/PaperDefs';
import {FOOT_H, Limb3, Pose, Puppet, SHIN, THIGH} from '../rig/Puppet';
import {HEAD_REST} from '../rig/Head';
import {blinkAt, cycleLength, hipOnGround, legIK, walkCycle} from '../rig/motion';
import {SpokenLine, mouthAt} from '../rig/lipsync';
import {clamp, easeInOut, lerp} from '../lib/math';
import {track} from '../lib/tracks';
import {Bench, City, Clouds, GROUND, LampLight, PaperFrame, SEAT_Y, Shelter, Sky, Street, StreetLamp} from '../scenery/BusStop';
import {Puddle, Rain, Splashes} from '../scenery/Rain';
import {Bus, PaperCaption, PaperGust, Silhouette} from '../scenery/Effects';
import type {Actor, EpisodeDef} from './types';
import {VOICES} from './ep01-voices';

const FPS = 30;
const SHELTER_DX = -200;
const BENCH_DX = -260;
const BENCH_EXTRA = 160;
export const CHAR_SCALE = 0.86; // characters a bit smaller so two people fit on the bench in a 9:16 frame
const K = CHAR_SCALE;
const STAND_Y = GROUND - (THIGH + SHIN + FOOT_H) * K + 2;
const SEATED_Y = SEAT_Y - 22 * K;
const groundHip = (a: Limb3, b: Limb3) => GROUND - K * (GROUND - hipOnGround(GROUND, a, b));

const mix3 = (a: Limb3, b: Limb3, t: number): Limb3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Walk phase/amplitude for every frame (integrated from the x channel) plus footstep frames. */
type Gait = {phase: number[]; amp: number[]; steps: number[]};
const gaitCache = new Map<Actor, Gait>();
const gaitOf = (a: Actor, frames: number): Gait => {
  const hit = gaitCache.get(a);
  if (hit) return hit;
  const phase: number[] = [];
  const amp: number[] = [];
  const steps: number[] = [];
  let p = 0.4;
  for (let f = 0; f < frames; f++) {
    const s = f / FPS;
    const dx = track(s + 1 / FPS, a.x) - track(s, a.x);
    const seated = track(s, a.seat) > 0.001;
    const m = seated ? 0 : Math.pow(clamp((Math.abs(dx) * FPS) / 210), 0.75);
    const before = Math.floor((p - Math.PI / 2) / Math.PI);
    if (m > 0.02) p += (2 * Math.PI * Math.abs(dx)) / (cycleLength(m) * K);
    if (m > 0.15 && Math.floor((p - Math.PI / 2) / Math.PI) > before) steps.push(f);
    phase.push(p);
    amp.push(m);
  }
  const g = {phase, amp, steps};
  gaitCache.set(a, g);
  return g;
};

const poseOf = (a: Actor, who: 'young' | 'adult', frame: number, ep: EpisodeDef, g: Gait): Pose => {
  const s = frame / FPS;
  const face = track(s, a.facing, 1);
  const sign = face >= 0 ? 1 : -1;
  const seat = clamp(track(s, a.seat));
  const e = easeInOut(seat);
  const amp = g.amp[frame] ?? 0;
  const w = walkCycle(g.phase[frame] ?? 0, amp);

  let x = track(s, a.x);
  let y: number;
  let legF: Limb3;
  let legB: Limb3;
  if (seat > 0.001) {
    // Feet stay planted in front of the bench; the hips travel back and down onto the seat.
    const ankleX = a.seatX + 117 * K * sign;
    x = lerp(x, a.seatX, e);
    y = lerp(STAND_Y, SEATED_Y, e);
    const ay = GROUND - FOOT_H * K;
    legF = legIK(0, 0, (ankleX + 8 * sign - x) / K, (ay - y) / K, sign);
    legB = legIK(0, 0, (ankleX - 16 * sign - x) / K, (ay - y) / K, sign);
  } else if (amp > 0.02) {
    legF = w.legF;
    legB = w.legB;
    y = groundHip(legF, legB);
  } else {
    legF = [2, 3, 0];
    legB = [-2, 3, 0];
    y = groundHip(legF, legB);
  }

  const standArms: Limb3 = amp > 0.02 ? w.armF : [4, 12, 4];
  const standArmsB: Limb3 = amp > 0.02 ? w.armB : [-3, 12, 4];
  let armF = mix3(standArms, [16, 84, 18], e);
  const armB = mix3(standArmsB, [10, 86, 14], e);
  armF = mix3(armF, mix3([20, 46, -18], [34, 66, -26], e), clamp(track(s, a.gesture)));
  armF = mix3(armF, [58, 92, -6], clamp(track(s, a.raise)));

  const spoken: SpokenLine[] = ep.lines.filter((l) => l.who === who).map((l) => ({at: l.at, words: VOICES[l.id] ?? []}));
  const m = mouthAt(s, spoken);
  const board = clamp(track(s, a.board));
  const breath = Math.sin(s * ((2 * Math.PI) / (who === 'adult' ? 4.2 : 3.4)) + (who === 'adult' ? 1 : 0));

  return {
    x: x - 30 * board * sign,
    y: y - 26 * board,
    facing: face,
    scale: K * (1 - 0.45 * board),
    opacity: 1 - board,
    lean: lerp(w.lean * (amp > 0.02 ? 1 : 0), a.seatLean, e) + 16 * Math.sin(Math.PI * seat) * (seat > 0.001 && seat < 0.999 ? 1 : 0) + (who === 'adult' ? 1.2 * breath : 0),
    tilt: track(s, a.tilt),
    breath,
    legF,
    legB,
    armF,
    armB,
    head: {
      ...HEAD_REST,
      turn: track(s, a.turn),
      brow: track(s, a.brow),
      browTilt: track(s, a.browTilt),
      smile: track(s, a.smile),
      lid: track(s, a.lid),
      lookX: track(s, a.lookX),
      lookY: track(s, a.lookY),
      mouthOpen: Math.max(m.open, track(s, a.mouth)),
      mouthWide: m.wide,
      blink: blinkAt(frame, a.blinks.map((b) => Math.round(b * FPS))),
    },
  };
};

const TitleCard: React.FC<{s: number; at: number; lines: string[]}> = ({s, at, lines}) => {
  if (s < at) return null;
  return (
    <g>
      <rect x={60} y={620} width={960} height={620} fill="#0e1d22" opacity={clamp((s - at) / 1)} filter="url(#paperBg)" />
      {lines.map((l, i) => (
        <text
          key={i}
          x={540}
          y={820 + i * 86}
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fontSize={56}
          fill="#e8dcc0"
          opacity={clamp((s - at - 0.6 - i * 0.7) / 1.2)}
        >
          {l}
        </text>
      ))}
    </g>
  );
};

export const EpisodeView: React.FC<{ep: EpisodeDef}> = ({ep}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const s = frame / FPS;
  const gy = gaitOf(ep.young, durationInFrames);
  const ga = gaitOf(ep.adult, durationInFrames);
  const young = poseOf(ep.young, 'young', frame, ep, gy);
  const adult = poseOf(ep.adult, 'adult', frame, ep, ga);

  const zoom = track(s, ep.camera.zoom, 1);
  const cx = track(s, ep.camera.cx, 540);
  const cy = track(s, ep.camera.cy, 1200);
  const pan = (540 - cx) * 0.5;
  const rain = track(s, ep.rain, 1);

  const line = ep.lines.find((l) => {
    const wds = VOICES[l.id] ?? [];
    if (!wds.length) return false;
    return s >= l.at + wds[0].start - 0.1 && s <= l.at + wds[wds.length - 1].end + 0.5;
  });
  let capOpacity = 0;
  if (line) {
    const wds = VOICES[line.id];
    const a = line.at + wds[0].start - 0.1;
    const b = line.at + wds[wds.length - 1].end + 0.5;
    capOpacity = clamp((s - a) / 0.15) * clamp((b - s) / 0.2);
  }

  return (
    <AbsoluteFill style={{backgroundColor: '#061014'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <PaperDefs />
        <g transform={`translate(540 960) scale(${zoom}) translate(${-cx} ${-cy})`}>
          <Sky />
          <Clouds frame={frame} pan={pan} />
          <City frame={frame} pan={pan} />
          <Rain frame={frame} seed={1} count={Math.round(110 * rain)} speed={34} length={24} width={1.1} opacity={0.3} />
          {ep.memories.map((m, i) => (
            <Silhouette key={i} s={s} m={m} seed={i + 3} />
          ))}
          <Bus x={track(s, ep.bus.x)} s={s} door={track(s, ep.bus.door)} />
          <Shelter dx={SHELTER_DX} />
          <Street frame={frame} />
          <StreetLamp />
          <Puddle frame={frame} cx={130} cy={GROUND + 92} rx={110} ry={17} glow={0.9} seed={3} />
          <Puddle frame={frame} cx={760} cy={GROUND + 110} rx={90} ry={14} seed={6} />
          <Rain frame={frame} seed={2} count={Math.round(70 * rain)} speed={48} length={38} width={1.7} opacity={0.4} />
          <Bench dx={BENCH_DX} extra={BENCH_EXTRA} />
          <ellipse cx={young.x} cy={GROUND + 6} rx={100 * young.scale} ry={12} fill="#000" opacity={0.45 * (young.opacity ?? 1)} filter="url(#softSmall)" />
          <Puppet uid="ep-adult" look={ep.adult.look} pose={adult} />
          <Puppet uid="ep-young" look={ep.young.look} pose={young} />
          <Splashes frame={frame} seed={9} count={Math.round(26 * rain)} y0={GROUND + 10} y1={GROUND + 140} />
          <LampLight frame={frame} />
          {ep.gusts.map((gst, i) => (
            <PaperGust key={i} s={s} t0={gst.t0} t1={gst.t1} seed={40 + i} count={gst.count} />
          ))}
          <Rain frame={frame} seed={3} count={Math.round(26 * rain)} speed={70} length={70} width={3} opacity={0.35} slant={0.14} />
        </g>
        <rect x={0} y={0} width={1080} height={1920} fill="url(#vignette)" />
        <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={track(s, ep.dark)} />
        {line && <PaperCaption text={line.text} opacity={capOpacity} />}
        <TitleCard s={s} at={ep.card.at} lines={ep.card.lines} />
        <PaperFrame />
      </svg>

      {/* sound */}
      <Audio src={staticFile('audio/papercut/rain.mp3')} loop volume={(f) => interpolate(f, [0, 30], [0, 0.55], {extrapolateRight: 'clamp'})} />
      <Audio src={staticFile('audio/papercut/rain_heavy.mp3')} loop volume={(f) => track(f / FPS, ep.heavyRain)} />
      <Audio src={staticFile('audio/papercut/music.mp3')} volume={(f) => track(f / FPS, ep.music)} />
      {gy.steps.map((f) => (
        <Sequence key={`st${f}`} from={f} durationInFrames={12}>
          <Audio src={staticFile('audio/papercut/step.mp3')} volume={0.5} />
        </Sequence>
      ))}
      <Sequence from={Math.round(ep.bus.arriveSound * FPS)}>
        <Audio src={staticFile('audio/papercut/bus_arrive.mp3')} volume={0.55} />
      </Sequence>
      <Sequence from={Math.round(ep.bus.leaveSound * FPS)}>
        <Audio src={staticFile('audio/papercut/bus_leave.mp3')} volume={0.55} />
      </Sequence>
      {ep.lines.map((l) => (
        <Sequence key={l.id} from={Math.round(l.at * FPS)}>
          <Audio src={staticFile(`audio/${l.id}.mp3`)} volume={1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
