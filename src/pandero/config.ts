import w1 from '../../public/pandero/voz/w1.words.json';
import w1Sin from '../../public/pandero/voz/w1_sin_precio.words.json';
import w2 from '../../public/pandero/voz/w2.words.json';
import w3 from '../../public/pandero/voz/w3.words.json';
import w4 from '../../public/pandero/voz/w4.words.json';
import w5 from '../../public/pandero/voz/w5.words.json';

export type Word = {text: string; start: number; end: number};

/**
 * Editable content of the Pandero Ya commercial (Daniel Domínguez).
 * price.show: true = opening says and shows "desde US$259 al mes" (cuota referencial).
 *             false = opening without price ("¿Te gustaría saber cómo llevarte tu auto nuevo…?").
 *             Keep it true only while the current quote confirms US$259 for the Kia Soluto and the plan shown.
 * Scene times follow the real voice lengths (seconds).
 */
export const CONFIG = {
  fps: 30,
  advisor: 'Daniel Domínguez',
  role: 'Asesor vehicular de Pandero',
  whatsapp: '943 455 094',
  model: 'Kia Soluto',
  price: {show: true, big: 'Desde US$259 al mes', note: 'Cuota referencial'},
  scenes: {
    s1: {start: 0, end: 15.6, voiceAt: 0.3},
    s2: {start: 15.6, end: 27.4, voiceAt: 15.8},
    s3: {start: 27.4, end: 42.8, voiceAt: 27.6},
    s4: {start: 42.8, end: 57.9, voiceAt: 43.0},
    s5: {start: 57.9, end: 67.0, voiceAt: 58.1},
  },
};
if (!CONFIG.price.show) {
  // the opening without price is 3 s shorter: move every later scene up so there is no gap
  CONFIG.scenes.s1.end -= 3;
  for (const k of ['s2', 's3', 's4', 's5'] as const) {
    CONFIG.scenes[k].start -= 3;
    CONFIG.scenes[k].end -= 3;
    CONFIG.scenes[k].voiceAt -= 3;
  }
}

export const VOICE = {
  s1: CONFIG.price.show ? {file: 'pandero/voz/w1.mp3', words: w1 as Word[]} : {file: 'pandero/voz/w1_sin_precio.mp3', words: w1Sin as Word[]},
  s2: {file: 'pandero/voz/w2.mp3', words: w2 as Word[]},
  s3: {file: 'pandero/voz/w3.mp3', words: w3 as Word[]},
  s4: {file: 'pandero/voz/w4.mp3', words: w4 as Word[]},
  s5: {file: 'pandero/voz/w5.mp3', words: w5 as Word[]},
};

type Cue = {from: number; to: number; text: string};
export const CAPTIONS: Record<keyof typeof VOICE, Cue[]> = {
  s1: CONFIG.price.show
    ? [
        {from: 0, to: 0, text: '¡Hola!'},
        {from: 1, to: 3, text: 'Soy Daniel Domínguez,'},
        {from: 4, to: 7, text: 'asesor vehicular de Pandero.'},
        {from: 8, to: 13, text: '¿Te imaginas estrenar un Kia Soluto'},
        {from: 14, to: 23, text: 'con cuotas desde US$259 al mes?'},
        {from: 24, to: 29, text: 'Te explico cómo funciona Pandero Ya.'},
      ]
    : [
        {from: 0, to: 0, text: '¡Hola!'},
        {from: 1, to: 3, text: 'Soy Daniel Domínguez,'},
        {from: 4, to: 7, text: 'asesor vehicular de Pandero.'},
        {from: 8, to: 11, text: '¿Te gustaría saber cómo'},
        {from: 12, to: 15, text: 'llevarte tu auto nuevo'},
        {from: 16, to: 18, text: 'con Pandero Ya?'},
        {from: 19, to: 21, text: 'Te lo explico.'},
      ],
  s2: [
    {from: 0, to: 2, text: 'Tienes dos caminos.'},
    {from: 3, to: 8, text: 'Puedes pagar una cuota al mes'},
    {from: 9, to: 15, text: 'y completar las 24 en dos años.'},
    {from: 16, to: 20, text: 'O, si quieres llegar antes,'},
    {from: 21, to: 23, text: 'puedes adelantar cuotas.'},
  ],
  s3: [
    {from: 0, to: 3, text: 'Y hay algo más.'},
    {from: 4, to: 12, text: 'En los meses 1, 5, 10, 15 y 20'},
    {from: 13, to: 15, text: 'de tu grupo,'},
    {from: 16, to: 20, text: 'puedes participar en un sorteo.'},
    {from: 21, to: 23, text: 'Si sales elegido,'},
    {from: 24, to: 27, text: 'empiezas antes los trámites'},
    {from: 28, to: 31, text: 'para llevarte tu auto.'},
  ],
  s4: [
    {from: 0, to: 3, text: 'Si no sales elegido,'},
    {from: 4, to: 8, text: 'al completar las 24 cuotas'},
    {from: 9, to: 14, text: 'y cumplir los requisitos del programa,'},
    {from: 15, to: 17, text: 'inicias los trámites'},
    {from: 18, to: 21, text: 'para llevarte tu auto.'},
    {from: 22, to: 25, text: 'Y después de recibirlo,'},
    {from: 26, to: 32, text: 'sigues pagando las cuotas que te quedan.'},
  ],
  s5: [
    {from: 0, to: 4, text: '¿Qué modelo tienes en mente?'},
    {from: 5, to: 7, text: 'Escríbeme por WhatsApp'},
    {from: 8, to: 12, text: 'y te ayudo a cotizarlo.'},
  ],
};

export const wordAt = (scene: keyof typeof VOICE, i: number, edge: 'start' | 'end' = 'start') =>
  CONFIG.scenes[scene].voiceAt + VOICE[scene].words[Math.min(i, VOICE[scene].words.length - 1)][edge];

export const TOTAL_SECONDS = CONFIG.scenes.s5.end;
