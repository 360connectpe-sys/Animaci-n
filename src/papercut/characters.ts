import type {Look} from './rig/Puppet';

// Same person, five years apart: same face, skin, hair and build; age and wardrobe change.
export const YOUNG: Look = {
  age: 'young',
  skin: '#c99470',
  hair: '#17120e',
  top: '#80868a', // gray sweater
  pants: '#4a4f54',
  shoe: '#d3cdc0',
  sole: '#9d978b',
  outfit: 'sweater',
  build: 0.94,
  headScale: 1.05,
};

export const ADULT: Look = {
  age: 'adult',
  skin: '#c48c68',
  hair: '#120e0b',
  top: '#1f2226', // dark hoodie
  pants: '#15171a',
  shoe: '#d9d4c9',
  sole: '#a8a397',
  outfit: 'hoodie',
  build: 1.0,
  headScale: 1.0,
};
