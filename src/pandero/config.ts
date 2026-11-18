import x1 from '../../public/pandero/voz/x1.words.json';
import x2 from '../../public/pandero/voz/x2.words.json';
import x3 from '../../public/pandero/voz/x3.words.json';
import x4 from '../../public/pandero/voz/x4.words.json';
import x5 from '../../public/pandero/voz/x5.words.json';
import x6 from '../../public/pandero/voz/x6.words.json';
import x7 from '../../public/pandero/voz/x7.words.json';

export type Word = {text: string; start: number; end: number};

/**
 * Pandero Ya commercial — Daniel Domínguez. Scene order fixed by the client.
 * Times (seconds) follow the real voice lengths. No car brands, no vehicle prices, no groups.
 */
export const CONFIG = {
  fps: 30,
  advisor: 'Daniel Domínguez',
  role: 'Asesor vehicular — Pandero Auto',
  whatsapp: '943 455 094',
  // Legal / commercial line shown in the close. VALIDATE with Pandero's official guidelines before publishing.
  legal: 'Información referencial. Adjudicación y entrega sujetas a las condiciones del contrato y del programa Pandero Ya.',
  scenes: {
    s1: {start: 0, end: 11.8, voiceAt: 0.3}, // presentación
    s2: {start: 11.8, end: 24.5, voiceAt: 12.0}, // adelanta tus 24 cuotas
    s3: {start: 24.5, end: 35.7, voiceAt: 24.7}, // paga mes a mes hasta el mes 24
    s4: {start: 35.7, end: 47.0, voiceAt: 35.9}, // las 36 cuotas restantes
    s5: {start: 47.0, end: 58.4, voiceAt: 47.2}, // trámite de adquisición
    s6: {start: 58.4, end: 70.3, voiceAt: 58.6}, // sorteos como posibilidad adicional
    s7: {start: 70.3, end: 84.0, voiceAt: 70.5}, // cierre
  },
};

export const VOICE = {
  s1: {file: 'pandero/voz/x1.mp3', words: x1 as Word[]},
  s2: {file: 'pandero/voz/x2.mp3', words: x2 as Word[]},
  s3: {file: 'pandero/voz/x3.mp3', words: x3 as Word[]},
  s4: {file: 'pandero/voz/x4.mp3', words: x4 as Word[]},
  s5: {file: 'pandero/voz/x5.mp3', words: x5 as Word[]},
  s6: {file: 'pandero/voz/x6.mp3', words: x6 as Word[]},
  s7: {file: 'pandero/voz/x7.mp3', words: x7 as Word[]},
};

type Cue = {from: number; to: number; text: string};
export const CAPTIONS: Record<keyof typeof VOICE, Cue[]> = {
  s1: [
    {from: 0, to: 0, text: '¡Hola!'},
    {from: 1, to: 3, text: 'Soy Daniel Domínguez,'},
    {from: 4, to: 8, text: 'asesor vehicular de Pandero Auto,'},
    {from: 9, to: 16, text: 'y hoy te explicaré cómo puedes hacer realidad'},
    {from: 17, to: 23, text: 'el sueño de estrenar tu auto nuevo'},
    {from: 24, to: 26, text: 'con Pandero Ya.'},
  ],
  s2: [
    {from: 0, to: 4, text: 'Con Pandero Ya puedes adelantar'},
    {from: 5, to: 8, text: 'tus primeras 24 cuotas,'},
    {from: 9, to: 14, text: 'dentro de los primeros 24 meses,'},
    {from: 15, to: 20, text: 'en el momento que tú decidas,'},
    {from: 21, to: 26, text: 'para acceder al proceso de adjudicación'},
    {from: 27, to: 30, text: 'de tu auto nuevo.'},
  ],
  s3: [
    {from: 0, to: 3, text: 'O, si lo prefieres,'},
    {from: 4, to: 8, text: 'puedes pagar tus cuotas mensualmente'},
    {from: 9, to: 14, text: 'y esperar hasta el mes 24'},
    {from: 15, to: 22, text: 'para acceder a la adjudicación de tu vehículo,'},
    {from: 23, to: 27, text: 'según las condiciones del programa.'},
  ],
  s4: [
    {from: 0, to: 3, text: 'Y recuerda algo importante:'},
    {from: 4, to: 8, text: 'después de recibir tu vehículo,'},
    {from: 9, to: 11, text: 'deberás continuar pagando'},
    {from: 12, to: 17, text: 'las 36 cuotas restantes,'},
    {from: 18, to: 25, text: 'de acuerdo con las condiciones de tu contrato.'},
  ],
  s5: [
    {from: 0, to: 3, text: 'Durante todo este proceso'},
    {from: 4, to: 7, text: 'contarás con mi asesoría'},
    {from: 8, to: 11, text: 'para conocer los requisitos,'},
    {from: 12, to: 14, text: 'preparar tu documentación'},
    {from: 15, to: 19, text: 'y realizar los trámites necesarios'},
    {from: 20, to: 24, text: 'para adquirir tu auto nuevo.'},
  ],
  s6: [
    {from: 0, to: 2, text: '¡Y algo más!'},
    {from: 3, to: 9, text: 'Durante ese periodo también tienes la posibilidad'},
    {from: 10, to: 17, text: 'de salir adjudicado mediante los sorteos del programa'},
    {from: 18, to: 26, text: 'y acceder a tu vehículo antes del mes 24.'},
  ],
  s7: [
    {from: 0, to: 8, text: '¡Haz realidad el sueño de estrenar tu auto nuevo!'},
    {from: 9, to: 11, text: 'Soy Daniel Domínguez,'},
    {from: 12, to: 16, text: 'asesor vehicular de Pandero Auto.'},
    {from: 17, to: 22, text: 'Escríbeme y conoce todas tus opciones.'},
  ],
};

export const wordAt = (scene: keyof typeof VOICE, i: number, edge: 'start' | 'end' = 'start') =>
  CONFIG.scenes[scene].voiceAt + VOICE[scene].words[Math.min(i, VOICE[scene].words.length - 1)][edge];

export const TOTAL_SECONDS = CONFIG.scenes.s7.end;
