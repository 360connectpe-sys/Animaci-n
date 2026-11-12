import type {ExpressionName, SceneName} from '../scenes/CharacterIdle';

/** Word timing from tools/tts/generate.py (<name>.words.json), in seconds from the audio start. */
export type Word = {text: string; start: number; end: number};

/** Camera keyframe. `at` is seconds from the scene start; `lift` moves the frame down in px (more headroom). */
export type CameraKey = {at: number; zoom: number; lift?: number};

/** Subtitle: give seconds (from/to) or word indexes into the scene narration (fromWord/toWord). */
export type SubtitleCue = {
  text: string;
  from?: number;
  to?: number;
  fromWord?: number;
  toWord?: number;
  hold?: number; // extra seconds on screen after the last word (word-based cues only)
};

export type EpisodeScene = {
  id: string;
  seconds: number;
  backdrop: SceneName; // 'room' | 'street' | 'dialogue'
  expressions: {at: number; expression: ExpressionName}[]; // seconds from scene start; changes are blink-masked cuts
  camera?: CameraKey[]; // default: slow push-in
  blinks?: number[]; // seconds where a normal blink starts; default: an irregular natural pattern
  narration?: {audio: string; startAt: number; words?: Word[]}; // audio path inside public/
  subtitles?: SubtitleCue[];
};

export type Episode = {id: string; title: string; scenes: EpisodeScene[]};

export const episodeSeconds = (e: Episode) => e.scenes.reduce((sum, s) => sum + s.seconds, 0);
