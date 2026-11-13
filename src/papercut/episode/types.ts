import type {Key} from '../lib/tracks';
import type {Look} from '../rig/Puppet';
import type {Memory} from '../scenery/Effects';

/** A spoken line: `id` is the audio file in public/audio (and its .words.json timings). */
export type Line = {id: string; who: 'young' | 'adult'; at: number; text: string};

/**
 * Everything a character does, as keyframed channels in seconds.
 * x: standing/walking hip position. seat: 0 standing .. 1 seated on the bench (feet stay planted).
 * facing: +1 right / -1 left (passing through 0 squashes the puppet as it turns around).
 * raise / gesture / wave: arm actions blended over the base pose. board: 0..1 steps into the bus.
 */
export type Actor = {
  look: Look;
  seatX: number;
  seatLean: number;
  x: Key[];
  facing: Key[];
  seat: Key[];
  tilt: Key[];
  turn: Key[];
  brow: Key[];
  browTilt?: Key[];
  smile: Key[];
  lid?: Key[];
  lookX?: Key[];
  lookY?: Key[];
  mouth?: Key[]; // silent mouth movement (e.g. trying to answer)
  raise?: Key[];
  gesture?: Key[];
  board?: Key[];
  blinks: number[];
};

export type EpisodeDef = {
  seconds: number;
  lines: Line[];
  young: Actor;
  adult: Actor;
  camera: {zoom: Key[]; cx: Key[]; cy: Key[]};
  rain: Key[]; // intensity multiplier
  gusts: {t0: number; t1: number; count: number}[];
  memories: Memory[];
  bus: {x: Key[]; door: Key[]; arriveSound: number; leaveSound: number};
  dark: Key[]; // fade to black
  card: {at: number; lines: string[]};
  music: Key[]; // volume
  heavyRain: Key[]; // volume of the heavy rain layer
};
