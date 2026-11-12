import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CharacterIdle, ExpressionKey} from './CharacterIdle';
import {Cue, Subtitles} from '../components/Subtitles';
import words from '../../public/audio/piloto_narracion.words.json';

// Pilot: 15 s in the night room. Narration (Edge TTS, es-PE-AlexNeural) starts at 1 s.
export const PILOT_DURATION = 450;
const VOICE_START = 30;

// Word timings (seconds) -> composition frames.
const at = (i: number, edge: 'start' | 'end') => VOICE_START + Math.round(words[i][edge] * 30);

// Phrases by word index: "Imagina ... años" (0-8), "Te mira ... pregunta" (9-16), "Somos felices" (17-18).
const CUES: Cue[] = [
  {from: at(0, 'start'), to: at(8, 'end') + 10, text: 'Imagina encontrarte con tu yo de hace cinco años…'},
  {from: at(9, 'start'), to: at(16, 'end') + 6, text: 'Te mira a los ojos y te pregunta:'},
  {from: at(17, 'start'), to: at(18, 'end') + 45, text: '¿Somos felices?'},
];

// Expressions follow the text: thoughtful while imagining, back to neutral when he looks at you,
// sad after the question sinks in. Each change is a blink-masked cut (see CharacterIdle).
const EXPRESSIONS: ExpressionKey[] = [
  {at: 0, expression: 'neutral'},
  {at: at(1, 'start'), expression: 'thoughtful'},
  {at: at(9, 'start') - 12, expression: 'neutral'},
  {at: at(18, 'end') + 24, expression: 'sad'},
];

// Normal blinks, kept away from the expression cuts and from the question (he looks straight at you).
const BLINKS = [118, 225, 360, 420];

export const Pilot: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const ease = Easing.inOut(Easing.cubic);

  // Camera: slow push-in, a closer move toward the face on "Te mira a los ojos", hold on the question,
  // then a slow pull back while the sadness settles.
  const zoom = interpolate(
    frame,
    [0, at(9, 'start'), at(17, 'start'), at(18, 'end') + 40, durationInFrames - 1],
    [1.0, 1.1, 1.55, 1.6, 1.45],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease},
  );
  const lift = interpolate(frame, [at(9, 'start'), at(17, 'start')], [0, 110], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0e0c12'}}>
      <AbsoluteFill style={{transform: `translateY(${lift}px) scale(${zoom})`, transformOrigin: '50% 14%'}}>
        <CharacterIdle scene="room" expressionTimeline={EXPRESSIONS} blinkStarts={BLINKS} />
      </AbsoluteFill>
      <Subtitles frame={frame} cues={CUES} />
      <Sequence from={VOICE_START}>
        <Audio src={staticFile('audio/piloto_narracion.mp3')} />
      </Sequence>
    </AbsoluteFill>
  );
};
