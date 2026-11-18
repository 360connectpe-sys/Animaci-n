import s1 from '../../public/pandero/voz/s1.words.json';
import s1Precio from '../../public/pandero/voz/s1_precio.words.json';
import s2 from '../../public/pandero/voz/s2.words.json';
import s3 from '../../public/pandero/voz/s3.words.json';
import s4 from '../../public/pandero/voz/s4.words.json';

export type Word = {text: string; start: number; end: number};

/**
 * Editable content of the Pandero Auto commercial.
 * PRICE: turn `showPrice` on ONLY when Daniel's quote confirms US$259/month for the model and plan shown.
 * When on, scene 1 uses the price voice line (s1_precio) and reveals the price text on the word "doscientos" (word 11).
 */
export const CONFIG = {
  fps: 30,
  showPrice: false,
  priceText: 'Cuota mensual referencial desde US$259',
  advisor: 'Daniel Domínguez',
  role: 'Asesor vehicular de Pandero Auto',
  whatsapp: '943 455 094',
  // Scene boundaries and when each voice line starts (seconds). Follow the real audio lengths.
  scenes: {
    s1: {start: 0, end: 8.1, voiceAt: 0.6},
    s2: {start: 8.1, end: 19.6, voiceAt: 8.4},
    s3: {start: 19.6, end: 28.6, voiceAt: 19.9},
    s4: {start: 28.6, end: 41.0, voiceAt: 28.9},
  },
};

export const VOICE = {
  s1: CONFIG.showPrice ? {file: 'pandero/voz/s1_precio.mp3', words: s1Precio as Word[]} : {file: 'pandero/voz/s1.mp3', words: s1 as Word[]},
  s2: {file: 'pandero/voz/s2.mp3', words: s2 as Word[]},
  s3: {file: 'pandero/voz/s3.mp3', words: s3 as Word[]},
  s4: {file: 'pandero/voz/s4.mp3', words: s4 as Word[]},
};

/** Subtitle chunks as word-index ranges (max two short lines each). */
export const CAPTIONS: Record<keyof typeof VOICE, {from: number; to: number; text: string}[]> = {
  s1: CONFIG.showPrice
    ? [
        {from: 0, to: 3, text: '¿Buscas un auto nuevo?'},
        {from: 4, to: 9, text: 'Conoce esta opción con cuotas mensuales'},
        {from: 10, to: 99, text: 'desde US$259'},
      ]
    : [
        {from: 0, to: 3, text: '¿Buscas un auto nuevo?'},
        {from: 4, to: 6, text: 'Soy Daniel Domínguez'},
        {from: 7, to: 15, text: 'y te explico cómo funciona el adelanto de cuotas.'},
      ],
  s2: [
    {from: 0, to: 5, text: 'Con Pandero Ya puedes adelantar pagos.'},
    {from: 6, to: 9, text: 'Al completar veinticuatro cuotas'},
    {from: 10, to: 15, text: 'y cumplir las condiciones del programa,'},
    {from: 16, to: 21, text: 'puedes acceder a la adjudicación anticipada.'},
  ],
  s3: [
    {from: 0, to: 4, text: 'Una vez adjudicado tu certificado,'},
    {from: 5, to: 11, text: 'empiezas los trámites para recibir tu vehículo'},
    {from: 12, to: 17, text: 'y continúas pagando las cuotas pendientes.'},
  ],
  s4: [
    {from: 0, to: 4, text: '¿Qué modelo tienes en mente?'},
    {from: 5, to: 7, text: 'Escríbeme por WhatsApp'},
    {from: 8, to: 15, text: 'y revisamos juntos las cuotas y los requisitos.'},
  ],
};

/** Absolute time (s) of a word in a scene's voice line. */
export const wordAt = (scene: keyof typeof VOICE, i: number, edge: 'start' | 'end' = 'start') =>
  CONFIG.scenes[scene].voiceAt + VOICE[scene].words[Math.min(i, VOICE[scene].words.length - 1)][edge];

export const TOTAL_SECONDS = CONFIG.scenes.s4.end;
