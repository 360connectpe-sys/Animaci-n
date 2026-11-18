import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAPTIONS, CONFIG, VOICE, Word, wordAt} from './config';
import {Presenter} from './Presenter';

type SceneKey = keyof typeof VOICE;
const SCENES: SceneKey[] = ['s1', 's2', 's3', 's4'];
const BLUE = '#0a3d8f';
const NAVY = '#062a66';
const RED = '#e31b23';
const FONT = 'Arial Black, Arial, Helvetica, sans-serif';
const FONT_TEXT = 'Arial, Helvetica, sans-serif';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** 0..1 progress between two times (s), eased. */
const prog = (s: number, a: number, b: number) => ease((s - a) / (b - a));

const sceneAt = (s: number): SceneKey => SCENES.find((k) => s < CONFIG.scenes[k].end) ?? 's4';

/** Mouth from word timings: one opening per syllable. */
const mouthAt = (s: number) => {
  for (const k of SCENES) {
    const at = CONFIG.scenes[k].voiceAt;
    for (const w of VOICE[k].words as Word[]) {
      const t = s - at;
      if (t >= w.start && t <= w.end) {
        const v = w.text.toLowerCase().match(/[aeiouáéíóú]/g) ?? ['a'];
        const p = (t - w.start) / Math.max(0.01, w.end - w.start);
        const ch = v[Math.min(v.length - 1, Math.floor(p * v.length))];
        return {open: 0.25 + 0.65 * Math.abs(Math.sin(Math.PI * v.length * p)), wide: /[eéií]/.test(ch) ? 1 : /[oóuú]/.test(ch) ? 0 : 0.6};
      }
    }
  }
  return {open: 0, wide: 0.5};
};

/** Mask reveal: content wipes in from the left. */
const Reveal: React.FC<{p: number; children: React.ReactNode; style?: React.CSSProperties}> = ({p, children, style}) => (
  <div style={{...style, clipPath: `inset(0 ${100 - clamp(p) * 100}% 0 0)`}}>{children}</div>
);

const Background: React.FC<{s: number}> = ({s}) => (
  <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 30%, #1556b8 0%, ${BLUE} 45%, ${NAVY} 100%)`}}>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {[0, 1, 2].map((i) => (
        <polygon
          key={i}
          points={`${-400 + i * 520 + ((s * 24) % 520)},1920 ${-100 + i * 520 + ((s * 24) % 520)},1920 ${500 + i * 520 + ((s * 24) % 520)},0 ${200 + i * 520 + ((s * 24) % 520)},0`}
          fill="#ffffff"
          opacity={0.04}
        />
      ))}
      <rect x={0} y={1880} width={1080} height={40} fill={RED} />
      <rect x={0} y={1868} width={1080} height={8} fill="#ffffff" />
    </svg>
  </AbsoluteFill>
);

const LogoCard: React.FC<{s: number; show: number}> = ({show}) => (
  <div
    style={{
      position: 'absolute',
      left: 290,
      top: 150,
      width: 500,
      height: 198,
      background: '#fff',
      borderRadius: 26,
      boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `translateY(${(1 - show) * -260}px)`,
      opacity: show,
    }}
  >
    <Img src={staticFile('pandero/logo-crop.png')} style={{width: 440, height: 'auto'}} />
  </div>
);

const Car: React.FC<{x: number; y: number; w: number; opacity?: number}> = ({x, y, w, opacity = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, opacity}}>
    <div style={{position: 'absolute', left: '6%', right: '6%', bottom: -14, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', filter: 'blur(10px)'}} />
    <Img src={staticFile('pandero/auto.png')} style={{width: '100%', height: 'auto', position: 'relative'}} />
  </div>
);

/** Thin-bezel front-facing phone that explains the two ways to pay. */
const Phone: React.FC<{option: number; paid: number}> = ({option, paid}) => {
  const cells = Array.from({length: 24}, (_, i) => i + 1);
  const tab = (n: number, label: string) => (
    <div
      style={{
        flex: 1,
        borderRadius: 16,
        padding: '10px 6px',
        textAlign: 'center',
        fontFamily: FONT_TEXT,
        fontWeight: 800,
        fontSize: 24,
        lineHeight: 1.15,
        background: option === n ? BLUE : '#dfe7f5',
        color: option === n ? '#fff' : '#33466b',
      }}
    >
      {label}
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 270, top: 230, width: 540, height: 880, borderRadius: 74, background: '#0b0d12', padding: 12, boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 62, overflow: 'hidden', background: '#f3f6fc'}}>
        <div style={{position: 'absolute', left: 190, top: 16, width: 136, height: 38, borderRadius: 20, background: '#0b0d12'}} />
        <div style={{position: 'absolute', top: 76, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_TEXT, fontWeight: 900, fontSize: 32, color: BLUE}}>Pandero Ya</div>
        <div style={{position: 'absolute', top: 126, left: 28, right: 28, display: 'flex', gap: 12}}>
          {tab(1, 'Adelantar cuotas')}
          {tab(2, '1 cuota al mes')}
        </div>
        <div style={{position: 'absolute', top: 222, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_TEXT, fontWeight: 800, fontSize: 28, color: '#33466b'}}>
          {option === 2 ? 'Meses completados' : 'Cuotas completadas'}: {Math.round(paid)} / 24
        </div>
        <div style={{position: 'absolute', top: 272, left: 28, right: 28, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10}}>
          {cells.map((n) => {
            const done = paid >= n - 0.01;
            return (
              <div
                key={n}
                style={{
                  height: 78,
                  borderRadius: 16,
                  background: done ? (option === 2 ? '#2f6fd6' : BLUE) : '#fff',
                  border: `3px solid ${done ? BLUE : '#c9d5ea'}`,
                  color: done ? '#fff' : '#33466b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONT_TEXT,
                  fontWeight: 800,
                }}
              >
                <div style={{fontSize: 18, opacity: 0.85}}>{option === 2 ? 'Mes' : 'Cuota'}</div>
                <div style={{fontSize: 32, lineHeight: 1}}>{n}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StepCard: React.FC<{n: number; title: string; active: number; reveal: number; icon: React.ReactNode}> = ({n, title, active, reveal, icon}) => (
  <Reveal p={reveal} style={{position: 'absolute', left: 120, width: 840, height: 220, top: n === 1 ? 470 : 740}}>
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 30,
        background: `rgba(255,255,255,${0.16 + 0.84 * active})`,
        border: '3px solid rgba(255,255,255,0.7)',
        display: 'flex',
        alignItems: 'center',
        gap: 30,
        padding: '0 40px',
        boxSizing: 'border-box',
        transform: `scale(${1 + 0.04 * active})`,
        boxShadow: active > 0.5 ? '0 20px 50px rgba(0,0,0,0.35)' : 'none',
        borderLeft: `18px solid ${active > 0.5 ? RED : 'rgba(255,255,255,0.7)'}`,
      }}
    >
      <div style={{width: 110, height: 110, borderRadius: 55, background: active > 0.5 ? BLUE : 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
      <div style={{fontFamily: FONT_TEXT, color: active > 0.5 ? BLUE : '#fff'}}>
        <div style={{fontSize: 30, fontWeight: 700, opacity: 0.8}}>Paso {n}</div>
        <div style={{fontSize: 46, fontWeight: 900, lineHeight: 1.1}}>{title}</div>
      </div>
    </div>
  </Reveal>
);

const Caption: React.FC<{s: number}> = ({s}) => {
  for (const k of SCENES) {
    for (const c of CAPTIONS[k]) {
      const a = wordAt(k, c.from, 'start') - 0.05;
      const b = wordAt(k, c.to, 'end') + 0.25;
      if (s >= a && s <= b) {
        const o = clamp((s - a) / 0.12) * clamp((b - s) / 0.12);
        return (
          <div style={{position: 'absolute', left: 430, top: 1370, width: 540, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o}}>
            <div style={{background: 'rgba(4,22,56,0.82)', borderRadius: 18, padding: '14px 22px', fontFamily: FONT_TEXT, fontWeight: 800, fontSize: 40, lineHeight: 1.2, color: '#fff', textAlign: 'center', borderBottom: `5px solid ${RED}`}}>
              {c.text}
            </div>
          </div>
        );
      }
    }
  }
  return null;
};

const Wipe: React.FC<{s: number}> = ({s}) => {
  // a red/white diagonal band sweeps across at every scene change
  for (const k of ['s2', 's3', 's4'] as SceneKey[]) {
    const t = (s - CONFIG.scenes[k].start + 0.25) / 0.5;
    if (t > 0 && t < 1) {
      const x = -1400 + t * 2900;
      return (
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <polygon points={`${x},1920 ${x + 260},1920 ${x + 1260},0 ${x + 1000},0`} fill={RED} />
          <polygon points={`${x + 260},1920 ${x + 300},1920 ${x + 1300},0 ${x + 1260},0`} fill="#fff" />
        </svg>
      );
    }
  }
  return null;
};

export const PanderoCommercial: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = frame / fps;
  const sc = sceneAt(s);
  const S = CONFIG.scenes;
  const sp = (at: number) => spring({frame: frame - Math.round(at * fps), fps, config: {damping: 16, stiffness: 120}});

  // presenter
  const m = mouthAt(s);
  const blinkF = [1.8, 5.2, 9.9, 13.6, 17.4, 22.3, 26.0, 30.9, 35.2, 39.6, 43.4, 47.1].some((b) => s >= b && s < b + 0.13) ? 1 : 0;
  const point = Math.max(
    prog(s, wordAt('s2', 0), wordAt('s2', 1)) * (1 - prog(s, wordAt('s2', 19), wordAt('s2', 19, 'end'))),
    prog(s, wordAt('s3', 0), wordAt('s3', 1)) * (1 - prog(s, wordAt('s3', 16), wordAt('s3', 17))),
    prog(s, wordAt('s4', 7), wordAt('s4', 8)) * (1 - prog(s, wordAt('s4', 13), wordAt('s4', 14))),
  );
  const nod = Math.max(...SCENES.flatMap((k) => (VOICE[k].words as Word[]).map((w, i) => (i % 4 === 0 ? Math.max(0, 1 - Math.abs(s - (S[k].voiceAt + w.start)) / 0.25) : 0))));
  const presenterIn = sp(0.15);

  // camera follows the focus of each scene
  let zoom = 1;
  const ox = 540;
  let oy = 760;
  if (sc === 's1') zoom = interpolate(s, [0, S.s1.end], [1, 1.05]);
  if (sc === 's2') {
    zoom = interpolate(s, [S.s2.start, S.s2.start + 1.2, S.s2.end], [0.9, 1.06, 1.1], {extrapolateRight: 'clamp'});
    oy = 680;
  }

  // scene 1: welcome with the car
  const s1Car = sp(S.s1.start + 0.2);
  const nameReveal = prog(s, wordAt('s1', 2) - 0.1, wordAt('s1', 2) + 0.5);

  // scene 2: two ways to pay
  const option = s >= wordAt('s2', 9) - 0.1 ? 2 : 1;
  const paid =
    option === 1
      ? interpolate(s, [wordAt('s2', 4), wordAt('s2', 8, 'end')], [0, 24], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
      : interpolate(s, [wordAt('s2', 10), wordAt('s2', 19, 'end')], [0, 24], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const phoneIn = sp(S.s2.start + 0.1);
  const optLabel = prog(s, wordAt('s2', 3) - 0.1, wordAt('s2', 3) + 0.4);

  // scene 3: steps, then the car comes back on "llevarte tu auto"
  const carBack = wordAt('s3', 24) - 0.15;
  const stepsOut = prog(s, carBack - 0.1, carBack + 0.4);
  const step1 = prog(s, wordAt('s3', 1) - 0.2, wordAt('s3', 1) + 0.3);
  const req = prog(s, wordAt('s3', 6) - 0.2, wordAt('s3', 6) + 0.3);
  const step2 = prog(s, wordAt('s3', 12) - 0.2, wordAt('s3', 12) + 0.3);
  const done2 = prog(s, wordAt('s3', 20) - 0.2, wordAt('s3', 20) + 0.3);
  const s3Car = spring({frame: frame - Math.round(carBack * fps), fps, config: {damping: 16, stiffness: 120}});
  const keep = prog(s, wordAt('s3', 28) - 0.2, wordAt('s3', 28) + 0.4);

  // scene 4
  const s4Text = prog(s, S.s4.start + 0.4, S.s4.start + 1.0);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Background s={s} />

      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${ox}px ${oy}px`}}>
        {sc === 's1' && (
          <>
            <LogoCard s={s} show={sp(0)} />
            <Car x={40 + (1 - s1Car) * 1100} y={520} w={1000} />
            <Reveal p={nameReveal} style={{position: 'absolute', left: 140, top: 960, width: 800}}>
              <div style={{background: '#fff', borderRadius: 22, padding: '18px 30px', borderLeft: `16px solid ${RED}`, fontFamily: FONT_TEXT}}>
                <div style={{fontSize: 52, fontWeight: 900, color: BLUE}}>{CONFIG.advisor}</div>
                <div style={{fontSize: 34, fontWeight: 700, color: '#33466b'}}>{CONFIG.role}</div>
              </div>
            </Reveal>
          </>
        )}

        {sc === 's2' && (
          <>
            <div style={{transform: `translateY(${(1 - phoneIn) * 1200}px)`}}>
              <Phone option={option} paid={paid} />
            </div>
            <Reveal p={optLabel} style={{position: 'absolute', left: 300, top: 1140, width: 500}}>
              <div style={{background: option === 1 ? RED : '#ffffff', color: option === 1 ? '#fff' : BLUE, borderRadius: 30, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 34}}>
                {option === 1 ? 'Opción 1: adelantar' : 'Opción 2: 1 cuota al mes'}
              </div>
            </Reveal>
          </>
        )}

        {sc === 's3' && (
          <>
            <div style={{opacity: 1 - stepsOut, transform: `translateX(${-stepsOut * 300}px)`}}>
              <Reveal p={prog(s, S.s3.start, S.s3.start + 0.6)} style={{position: 'absolute', left: 120, top: 330, width: 840}}>
                <div style={{color: '#fff', fontFamily: FONT_TEXT, fontWeight: 800, fontSize: 42}}>Pasos para llevarte tu auto</div>
              </Reveal>
              <StepCard n={1} title="24 cuotas completadas" active={step1 * (1 - step2)} reveal={prog(s, S.s3.start + 0.2, S.s3.start + 0.7)} icon={<div style={{color: '#fff', fontFamily: FONT, fontSize: 40}}>24</div>} />
              <Reveal p={req} style={{position: 'absolute', left: 180, top: 700, width: 720}}>
                <div style={{color: '#fff', fontFamily: FONT_TEXT, fontWeight: 700, fontSize: 32, textAlign: 'center'}}>+ requisitos del plan cumplidos</div>
              </Reveal>
              <StepCard n={2} title={done2 > 0.5 ? 'Trámites terminados ✓' : 'Trámites de entrega'} active={step2} reveal={prog(s, wordAt('s3', 11) - 0.3, wordAt('s3', 11) + 0.2)} icon={<svg width={64} height={64} viewBox="0 0 64 64"><rect x={10} y={8} width={44} height={50} rx={6} fill="#fff" /><rect x={18} y={18} width={28} height={5} fill={RED} /><rect x={18} y={29} width={28} height={4} fill={BLUE} /><rect x={18} y={38} width={20} height={4} fill={BLUE} /></svg>} />
            </div>
            {s >= carBack && (
              <>
                <Reveal p={prog(s, carBack, carBack + 0.5)} style={{position: 'absolute', left: 140, top: 330, width: 800}}>
                  <div style={{color: '#fff', fontFamily: FONT, fontSize: 58, textAlign: 'center'}}>¡Te llevas tu auto!</div>
                </Reveal>
                <Car x={40 + (1 - s3Car) * 1100} y={470} w={1000} />
                <Reveal p={keep} style={{position: 'absolute', left: 150, top: 900, width: 780}}>
                  <div style={{background: RED, color: '#fff', borderRadius: 40, padding: '16px 26px', fontFamily: FONT_TEXT, fontWeight: 800, fontSize: 34, textAlign: 'center'}}>Sigues pagando las cuotas que te quedan</div>
                </Reveal>
              </>
            )}
          </>
        )}

        {sc === 's4' && (
          <>
            <LogoCard s={s} show={sp(S.s4.start)} />
            <Car x={40} y={400} w={1000} />
            <Reveal p={s4Text} style={{position: 'absolute', left: 60, top: 820, width: 960}}>
              <div style={{background: '#fff', borderRadius: 34, padding: '22px 20px', textAlign: 'center', boxShadow: '0 18px 40px rgba(0,0,0,0.35)', borderBottom: `10px solid ${RED}`}}>
                <div style={{fontFamily: FONT_TEXT, fontSize: 54, fontWeight: 900, color: BLUE}}>{CONFIG.advisor}</div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 6}}>
                  <svg width={70} height={70} viewBox="0 0 64 64"><circle cx={32} cy={32} r={28} fill="#25d366" /><path d="M 22 20 Q 18 30 28 40 Q 38 50 46 44 L 42 37 L 37 39 Q 31 35 28 29 L 30 25 Z" fill="#fff" /></svg>
                  <div style={{fontFamily: FONT_TEXT, fontSize: 30, fontWeight: 800, color: '#1d8f4a'}}>WhatsApp</div>
                  <div style={{fontFamily: FONT_TEXT, fontSize: 76, fontWeight: 900, color: '#0d1b38'}}>{CONFIG.whatsapp}</div>
                </div>
              </div>
            </Reveal>
          </>
        )}
      </AbsoluteFill>

      {/* presenter (always bottom-left, outside the camera move) */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(${210 - (1 - presenterIn) * 500} 1250) scale(0.95)`}>
          <circle cx={0} cy={110} r={230} fill="#ffffff" opacity={0.08} />
          <Presenter t={s} mouth={m.open} wide={m.wide} blink={blinkF} point={point} nod={nod} />
        </g>
      </svg>

      <Caption s={s} />
      <Wipe s={s} />

      {SCENES.map((k) => (
        <Sequence key={k} from={Math.round(S[k].voiceAt * fps)}>
          <Audio src={staticFile(VOICE[k].file)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
