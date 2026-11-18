import v1 from '../../public/pandero/voz/v1.words.json';
import v2 from '../../public/pandero/voz/v2.words.json';
import v3 from '../../public/pandero/voz/v3.words.json';
import v4 from '../../public/pandero/voz/v4.words.json';

export type Word = {text: string; start: number; end: number};

/** Editable content of the Pandero Auto commercial. Times in seconds; they follow the real voice lengths. */
export const CONFIG = {
  fps: 30,
  advisor: 'Daniel Domínguez',
  role: 'Asesor vehicular de Pandero',
  whatsapp: '943 455 094',
  // Reference price shown on screen (scene 1 and the close). Set show: false to hide it.
  price: {show: true, text: 'Cuotas desde US$259 al mes', note: 'Precio referencial según modelo y plan'},
  scenes: {
    s1: {start: 0, end: 12.7, voiceAt: 0.5}, // bienvenida con el auto
    s2: {start: 12.7, end: 22.7, voiceAt: 12.9}, // iPhone: dos formas de pago
    s3: {start: 22.7, end: 37.4, voiceAt: 22.9}, // pasos y entrega del auto
    s4: {start: 37.4, end: 49.5, voiceAt: 37.6}, // cierre WhatsApp
  },
};

export const VOICE = {
  s1: {file: 'pandero/voz/v1.mp3', words: v1 as Word[]},
  s2: {file: 'pandero/voz/v2.mp3', words: v2 as Word[]},
  s3: {file: 'pandero/voz/v3.mp3', words: v3 as Word[]},
  s4: {file: 'pandero/voz/v4.mp3', words: v4 as Word[]},
};

/** Subtitle chunks as word-index ranges (max two short lines each). */
export const CAPTIONS: Record<keyof typeof VOICE, {from: number; to: number; text: string}[]> = {
  s1: [
    {from: 0, to: 0, text: '¡Hola!'},
    {from: 1, to: 7, text: 'Soy Daniel Domínguez, asesor vehicular de Pandero.'},
    {from: 8, to: 16, text: 'Hoy te voy a explicar cómo funciona Pandero Ya'},
    {from: 17, to: 26, text: 'y qué pasos debes seguir para llevarte tu auto nuevo.'},
  ],
  s2: [
    {from: 0, to: 2, text: 'Tienes dos opciones.'},
    {from: 3, to: 8, text: 'Puedes adelantar cuotas hasta completar veinticuatro,'},
    {from: 9, to: 14, text: 'o pagar una cuota al mes'},
    {from: 15, to: 19, text: 'y completarlas en veinticuatro meses.'},
  ],
  s3: [
    {from: 0, to: 4, text: 'Cuando completas las veinticuatro cuotas'},
    {from: 5, to: 10, text: 'y cumples los requisitos del plan,'},
    {from: 11, to: 16, text: 'puedes iniciar los trámites de entrega.'},
    {from: 17, to: 22, text: 'Una vez que termines esos trámites,'},
    {from: 23, to: 26, text: 'podrás llevarte tu auto'},
    {from: 27, to: 34, text: 'y seguir pagando las cuotas que te quedan.'},
  ],
  s4: [
    {from: 0, to: 6, text: '¿Ya sabes qué auto te gustaría manejar?'},
    {from: 7, to: 9, text: 'Escríbeme por WhatsApp'},
    {from: 10, to: 14, text: 'y te ayudo a cotizarlo.'},
  ],
};

export const wordAt = (scene: keyof typeof VOICE, i: number, edge: 'start' | 'end' = 'start') =>
  CONFIG.scenes[scene].voiceAt + VOICE[scene].words[Math.min(i, VOICE[scene].words.length - 1)][edge];

export const TOTAL_SECONDS = CONFIG.scenes.s4.end;
