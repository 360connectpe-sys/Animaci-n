import type {Episode} from './types';
import w1 from '../../public/audio/ep01_escena1.words.json';
import w2 from '../../public/audio/ep01_escena2.words.json';
import w3 from '../../public/audio/ep01_escena3.words.json';
import w4 from '../../public/audio/ep01_escena4.words.json';

/**
 * Episode template: 4 scenes x 15 s = 60 s. Edit this file to make a new episode.
 * - Times are in seconds from each scene's start.
 * - Expressions: 'neutral' | 'sad' | 'thoughtful'. Backdrops: 'room' | 'street' | 'dialogue'.
 * - Narration lines live in tools/tts/generate.py (es-PE-AlexNeural, word timings on);
 *   regenerate with `npm run tts -- <name>` and keep word-based subtitles (fromWord/toWord).
 */
export const episode01: Episode = {
  id: 'episodio-01',
  title: '¿Qué pensaría tu yo de hace cinco años?',
  scenes: [
    {
      // The question. Silence, then he looks straight at you.
      id: '1-pregunta',
      seconds: 15,
      backdrop: 'room',
      narration: {audio: 'audio/ep01_escena1.mp3', startAt: 2, words: w1},
      subtitles: [
        {text: '¿Qué pensaría tu yo de hace cinco años…', fromWord: 0, toWord: 7, hold: 0.3},
        {text: '…si te viera hoy?', fromWord: 8, toWord: 11, hold: 2.5},
      ],
      expressions: [
        {at: 0, expression: 'neutral'},
        {at: 2.0, expression: 'thoughtful'},
        {at: 9.5, expression: 'neutral'},
      ],
      blinks: [4.0, 8.0, 12.0, 13.6],
      camera: [
        {at: 0, zoom: 1.0},
        {at: 4.8, zoom: 1.1},
        {at: 7.0, zoom: 1.5, lift: 100},
        {at: 15, zoom: 1.55, lift: 110},
      ],
    },
    {
      // Pride, then what was left behind.
      id: '2-camino',
      seconds: 15,
      backdrop: 'street',
      narration: {audio: 'audio/ep01_escena2.mp3', startAt: 2, words: w2},
      subtitles: [
        {text: 'Quizás se sorprendería de lo lejos que llegaste.', fromWord: 0, toWord: 7, hold: 0.8},
        {text: 'O de todo lo que dejaste en el camino.', fromWord: 8, toWord: 16, hold: 2.5},
      ],
      expressions: [
        {at: 0, expression: 'neutral'},
        {at: 6.0, expression: 'thoughtful'},
        {at: 10.5, expression: 'sad'},
      ],
      blinks: [1.3, 4.2, 8.0, 12.8],
      camera: [
        {at: 0, zoom: 1.0},
        {at: 15, zoom: 1.15, lift: 40},
      ],
    },
    {
      // The unanswered question. Long pause.
      id: '3-suenos',
      seconds: 15,
      backdrop: 'room',
      narration: {audio: 'audio/ep01_escena3.mp3', startAt: 2.5, words: w3},
      subtitles: [
        {text: 'Tal vez te preguntaría por esos sueños…', fromWord: 0, toWord: 6, hold: 0.3},
        {text: '…y tú no sabrías qué responder.', fromWord: 7, toWord: 12, hold: 3},
      ],
      expressions: [
        {at: 0, expression: 'sad'},
        {at: 11.0, expression: 'thoughtful'},
      ],
      blinks: [12.5, 14.0],
      camera: [
        {at: 0, zoom: 1.35, lift: 80},
        {at: 15, zoom: 1.1, lift: 30},
      ],
    },
    {
      // Acceptance: he looks at you, at peace.
      id: '4-suficiente',
      seconds: 15,
      backdrop: 'street',
      narration: {audio: 'audio/ep01_escena4.mp3', startAt: 2, words: w4},
      subtitles: [
        {text: 'Pero también vería a alguien que siguió adelante.', fromWord: 0, toWord: 7, hold: 0.8},
        {text: 'Y eso… ya es suficiente.', fromWord: 8, toWord: 12, hold: 4},
      ],
      expressions: [
        {at: 0, expression: 'thoughtful'},
        {at: 6.0, expression: 'neutral'},
      ],
      blinks: [1.5, 4.5, 10.0, 12.8],
      camera: [
        {at: 0, zoom: 1.0},
        {at: 6.0, zoom: 1.2, lift: 50},
        {at: 15, zoom: 1.45, lift: 110},
      ],
    },
  ],
};
