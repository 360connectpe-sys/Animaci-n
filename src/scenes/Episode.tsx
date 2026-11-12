import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CharacterIdle, ExpressionKey} from './CharacterIdle';
import {Cue, Subtitles} from '../components/Subtitles';
import type {Episode, EpisodeScene} from '../episodes/types';

// Natural blink pattern (seconds), repeated every 14 s when a scene does not set its own blinks.
const BLINK_PATTERN = [1.3, 4.1, 4.4, 7.2, 10.5, 13.0];

const defaultBlinks = (seconds: number): number[] => {
  const out: number[] = [];
  for (let base = 0; base < seconds; base += 14) {
    for (const b of BLINK_PATTERN) if (base + b < seconds - 0.5) out.push(base + b);
  }
  return out;
};

const SceneView: React.FC<{scene: EpisodeScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = (sec: number) => Math.round(sec * fps);

  const narrationStart = scene.narration ? f(scene.narration.startAt) : 0;
  const words = scene.narration?.words ?? [];
  const wordFrame = (i: number, edge: 'start' | 'end') => narrationStart + f(words[i][edge]);

  const cues: Cue[] = (scene.subtitles ?? []).map((c) =>
    c.fromWord !== undefined && c.toWord !== undefined
      ? {text: c.text, from: wordFrame(c.fromWord, 'start'), to: wordFrame(c.toWord, 'end') + f(c.hold ?? 0.3)}
      : {text: c.text, from: f(c.from ?? 0), to: f(c.to ?? scene.seconds)},
  );

  const expressions: ExpressionKey[] = scene.expressions.map((e) => ({at: f(e.at), expression: e.expression}));
  const blinks = (scene.blinks ?? defaultBlinks(scene.seconds)).map(f);

  const cam = scene.camera ?? [
    {at: 0, zoom: 1.0},
    {at: scene.seconds, zoom: 1.08},
  ];
  const ease = Easing.inOut(Easing.cubic);
  const opts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease} as const;
  const times = cam.map((k) => f(k.at));
  const zoom = cam.length > 1 ? interpolate(frame, times, cam.map((k) => k.zoom), opts) : cam[0].zoom;
  const lift = cam.length > 1 ? interpolate(frame, times, cam.map((k) => k.lift ?? 0), opts) : cam[0].lift ?? 0;

  return (
    <AbsoluteFill style={{backgroundColor: '#0e0c12'}}>
      <AbsoluteFill style={{transform: `translateY(${lift}px) scale(${zoom})`, transformOrigin: '50% 14%'}}>
        <CharacterIdle scene={scene.backdrop} expressionTimeline={expressions} blinkStarts={blinks} />
      </AbsoluteFill>
      <Subtitles frame={frame} cues={cues} />
      {scene.narration && (
        <Sequence from={narrationStart}>
          <Audio src={staticFile(scene.narration.audio)} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

/** Plays the episode's scenes back to back. Each scene fades in and out (CharacterIdle). */
export const EpisodeVideo: React.FC<{episode: Episode}> = ({episode}) => {
  const {fps} = useVideoConfig();
  let from = 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#0e0c12'}}>
      {episode.scenes.map((scene) => {
        const duration = Math.round(scene.seconds * fps);
        const el = (
          <Sequence key={scene.id} name={scene.id} from={from} durationInFrames={duration}>
            <SceneView scene={scene} />
          </Sequence>
        );
        from += duration;
        return el;
      })}
    </AbsoluteFill>
  );
};
