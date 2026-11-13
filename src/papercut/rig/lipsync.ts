export type Word = {text: string; start: number; end: number};
export type SpokenLine = {at: number; words: Word[]};

const vowels = (w: string) => (w.toLowerCase().match(/[aeiouáéíóú]+/g) ?? []).length || 1;

/** Mouth shape at time `s` from word timings: opens once per syllable, wider on e/i, rounder on o/u. */
export const mouthAt = (s: number, lines: SpokenLine[]): {open: number; wide: number} => {
  for (const line of lines) {
    const t = s - line.at;
    if (t < 0) continue;
    for (const w of line.words) {
      if (t >= w.start && t <= w.end) {
        const syl = vowels(w.text);
        const p = (t - w.start) / Math.max(0.01, w.end - w.start);
        const idx = Math.min(syl - 1, Math.floor(p * syl));
        const v = (w.text.toLowerCase().match(/[aeiouáéíóú]/g) ?? ['a'])[idx] ?? 'a';
        return {open: 0.2 + 0.6 * Math.abs(Math.sin(Math.PI * syl * p)), wide: /[eéií]/.test(v) ? 1 : /[oóuú]/.test(v) ? 0 : 0.6};
      }
    }
  }
  return {open: 0, wide: 0.5};
};
