import type {Episode} from './types';
import pilotWords from '../../public/audio/piloto_narracion.words.json';

/**
 * Episode template: 4 scenes x 15 s = 60 s. Edit this file to make a new episode.
 * - Times are in seconds from each scene's start.
 * - Expressions: 'neutral' | 'sad' | 'thoughtful'. Backdrops: 'room' | 'street' | 'dialogue'.
 * - Only scene 1 has a voice (the pilot narration). To voice another scene, add a line to
 *   tools/tts/generate.py (word timings on), run `npm run tts -- <name>`, then set `narration`
 *   and use word-based subtitles (fromWord/toWord).
 */
export const episode01: Episode = {
  id: 'episodio-01',
  title: '¿Somos felices?',
  scenes: [
    {
      id: '1-encuentro',
      seconds: 15,
      backdrop: 'room',
      narration: {audio: 'audio/piloto_narracion.mp3', startAt: 1, words: pilotWords},
      subtitles: [
        {text: 'Imagina encontrarte con tu yo de hace cinco años…', fromWord: 0, toWord: 8, hold: 0.33},
        {text: 'Te mira a los ojos y te pregunta:', fromWord: 9, toWord: 16, hold: 0.2},
        {text: '¿Somos felices?', fromWord: 17, toWord: 18, hold: 1.5},
      ],
      expressions: [
        {at: 0, expression: 'neutral'},
        {at: 1.8, expression: 'thoughtful'},
        {at: 5.5, expression: 'neutral'},
        {at: 10.3, expression: 'sad'},
      ],
      blinks: [3.9, 7.5, 12, 14],
      camera: [
        {at: 0, zoom: 1.0},
        {at: 5.9, zoom: 1.1},
        {at: 8.3, zoom: 1.55, lift: 110},
        {at: 10.6, zoom: 1.6, lift: 110},
        {at: 15, zoom: 1.45, lift: 110},
      ],
    },
    {
      id: '2-recuerdos',
      seconds: 15,
      backdrop: 'street',
      subtitles: [
        {text: 'Hace cinco años caminabas por aquí…', from: 1, to: 6},
        {text: 'con otros planes y otras preocupaciones.', from: 7, to: 12.5},
      ],
      expressions: [
        {at: 0, expression: 'neutral'},
        {at: 6.5, expression: 'thoughtful'},
      ],
      camera: [
        {at: 0, zoom: 1.0},
        {at: 15, zoom: 1.12, lift: 40},
      ],
    },
    {
      id: '3-silencio',
      seconds: 15,
      backdrop: 'room',
      subtitles: [
        {text: 'A veces la respuesta no llega de inmediato.', from: 2, to: 8},
        {text: 'Y está bien.', from: 9, to: 13},
      ],
      expressions: [{at: 0, expression: 'sad'}],
      camera: [
        {at: 0, zoom: 1.35, lift: 80},
        {at: 15, zoom: 1.1, lift: 30},
      ],
    },
    {
      id: '4-respuesta',
      seconds: 15,
      backdrop: 'street',
      subtitles: [
        {text: 'Quizás no siempre somos felices.', from: 1.5, to: 6.5},
        {text: 'Pero hoy podemos intentarlo.', from: 8, to: 13.5},
      ],
      expressions: [
        {at: 0, expression: 'thoughtful'},
        {at: 7.5, expression: 'neutral'},
      ],
      camera: [
        {at: 0, zoom: 1.0},
        {at: 7.5, zoom: 1.2, lift: 50},
        {at: 15, zoom: 1.45, lift: 110},
      ],
    },
  ],
};
