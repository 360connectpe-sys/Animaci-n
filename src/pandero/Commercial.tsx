import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAPTIONS, CONFIG, VOICE, Word, wordAt} from './config';
import {Presenter} from './Presenter';
import {GenericCar} from './GenericCar';

type SceneKey = keyof typeof VOICE;
const SCENES: SceneKey[] = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];
const BLUE = '#0a3d8f';
const NAVY = '#062a66';
const RED = '#e31b23';
const GOLD = '#f5b52e';
const FONT = 'Arial Black, Arial, Helvetica, sans-serif';
const TXT = 'Arial, Helvetica, sans-serif';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const prog = (s: number, a: number, b: number) => ease((s - a) / (b - a));
const sceneAt = (s: number): SceneKey => SCENES.find((k) => s < CONFIG.scenes[k].end) ?? 's7';
const W = (k: SceneKey, i: number, e: 'start' | 'end' = 'start') => wordAt(k, i, e);
const lin = (s: number, a: number, b: number, v0: number, v1: number) =>
  interpolate(s, [a, b], [v0, v1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const mouthAt = (s: number) => {
  for (const k of SCENES) {
    const t = s - CONFIG.scenes[k].voiceAt;
    for (const w of VOICE[k].words as Word[]) {
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

/** Mask reveal: wipes in from the left. */
const Reveal: React.FC<{p: number; children: React.ReactNode; style?: React.CSSProperties}> = ({p, children, style}) => (
  <div style={{...style, clipPath: `inset(0 ${100 - clamp(p) * 100}% 0 0)`}}>{children}</div>
);

/** Big headline with a mask reveal and a red underline that draws after it. */
const Headline: React.FC<{p: number; text: string; top?: number; size?: number}> = ({p, text, top = 120, size = 64}) => (
  <div style={{position: 'absolute', left: 60, top, width: 960, textAlign: 'center'}}>
    <Reveal p={p}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: '#fff', textShadow: '0 6px 18px rgba(0,0,0,0.35)'}}>{text}</div>
    </Reveal>
    <div style={{margin: '14px auto 0', width: 260 * clamp((p - 0.6) / 0.4), height: 10, borderRadius: 5, background: RED}} />
  </div>
);

const Background: React.FC<{s: number}> = ({s}) => (
  <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 30%, #1556b8 0%, ${BLUE} 45%, ${NAVY} 100%)`}}>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {[0, 1, 2].map((i) => {
        const o = (s * 24) % 520;
        return <polygon key={i} points={`${-400 + i * 520 + o},1920 ${-100 + i * 520 + o},1920 ${500 + i * 520 + o},0 ${200 + i * 520 + o},0`} fill="#fff" opacity={0.04} />;
      })}
      <rect x={0} y={1880} width={1080} height={40} fill={RED} />
      <rect x={0} y={1868} width={1080} height={8} fill="#fff" />
    </svg>
  </AbsoluteFill>
);

const LogoCard: React.FC<{show: number; top?: number}> = ({show, top = 100}) => (
  <div style={{position: 'absolute', left: 320, top, width: 440, height: 172, background: '#fff', borderRadius: 24, boxShadow: '0 18px 40px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - show) * -260}px)`, opacity: show}}>
    <Img src={staticFile('pandero/logo-crop.png')} style={{width: 380, height: 'auto'}} />
  </div>
);

/** Car that drives in: `p` 0..1 (0 = off screen to the right). Wheels turn with the travel. */
const Car: React.FC<{p: number; top: number; width?: number; from?: number}> = ({p, top, width = 960, from = 1100}) => {
  const dx = (1 - p) * from;
  return (
    <div style={{position: 'absolute', left: (1080 - width) / 2 + dx, top}}>
      <GenericCar width={width} wheel={-dx * 0.9} />
    </div>
  );
};

const Phone: React.FC<{title: string; children: React.ReactNode; top?: number}> = ({title, children, top = 330}) => (
  <div style={{position: 'absolute', left: 280, top, width: 520, height: 790, borderRadius: 72, background: '#0b0d12', padding: 12, boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 60, overflow: 'hidden', background: '#f3f6fc'}}>
      <div style={{position: 'absolute', left: 184, top: 14, width: 128, height: 36, borderRadius: 20, background: '#0b0d12'}} />
      <div style={{position: 'absolute', top: 66, left: 0, right: 0, textAlign: 'center', fontFamily: TXT, fontWeight: 900, fontSize: 30, color: BLUE}}>{title}</div>
      {children}
    </div>
  </div>
);

/** 24-cell calendar. `filled` 0..24 cells done; `label` per cell; optional sparkles for draws. */
const Calendar24: React.FC<{filled: number; label: string; color?: string; top?: number; sparkle?: (n: number) => number; mark24?: number}> = ({
  filled,
  label,
  color = BLUE,
  top = 190,
  sparkle,
  mark24 = 0,
}) => (
  <div style={{position: 'absolute', top, left: 24, right: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 9}}>
    {Array.from({length: 24}, (_, i) => i + 1).map((n) => {
      const done = filled >= n - 0.01;
      const sp = sparkle ? sparkle(n) : 0;
      const is24 = n === 24 && mark24 > 0.5;
      return (
        <div
          key={n}
          style={{
            height: 72,
            borderRadius: 14,
            background: is24 || sp > 0.3 ? GOLD : done ? color : '#fff',
            border: `3px solid ${is24 ? GOLD : sp > 0.05 ? GOLD : done ? color : '#c9d5ea'}`,
            color: is24 || sp > 0.3 ? NAVY : done ? '#fff' : '#33466b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: TXT,
            fontWeight: 900,
            transform: `scale(${1 + 0.08 * sp})`,
            boxShadow: sp > 0.05 ? `0 0 ${18 * sp}px ${GOLD}` : 'none',
          }}
        >
          <div style={{fontSize: 16, opacity: 0.85}}>{label}</div>
          <div style={{fontSize: 30, lineHeight: 1}}>{n}</div>
        </div>
      );
    })}
  </div>
);

const Caption: React.FC<{s: number}> = ({s}) => {
  for (const k of SCENES) {
    for (const c of CAPTIONS[k]) {
      const a = W(k, c.from) - 0.05;
      const b = W(k, c.to, 'end') + 0.25;
      if (s >= a && s <= b) {
        const o = clamp((s - a) / 0.12) * clamp((b - s) / 0.12);
        return (
          <div style={{position: 'absolute', left: 400, top: 1350, width: 570, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o}}>
            <div style={{background: 'rgba(4,22,56,0.86)', borderRadius: 20, padding: '14px 22px', fontFamily: TXT, fontWeight: 900, fontSize: 44, lineHeight: 1.18, color: '#fff', textAlign: 'center', borderBottom: `6px solid ${RED}`}}>
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
  for (const k of SCENES.slice(1)) {
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

/** Scene 5 process: nodes connected by a line that draws as each step is named. */
const PROCESS = [
  {label: 'Asesoría personalizada', icon: '💬', word: 7},
  {label: 'Revisión de requisitos', icon: '✔', word: 11},
  {label: 'Documentación', icon: '📄', word: 14},
  {label: 'Proceso de adjudicación', icon: '★', word: 18},
  {label: 'Entrega del vehículo', icon: '🔑', word: 23},
];
const Process: React.FC<{s: number}> = ({s}) => {
  const ys = [330, 490, 650, 810, 970];
  const xs = [200, 540, 200, 540, 200];
  const on = PROCESS.map((p) => prog(s, W('s5', p.word) - 0.25, W('s5', p.word) + 0.2));
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {PROCESS.slice(1).map((_, i) => {
          const x0 = xs[i] + 60;
          const y0 = ys[i] + 60;
          const x1 = xs[i + 1] + 60;
          const y1 = ys[i + 1] + 60;
          const len = Math.hypot(x1 - x0, y1 - y0);
          return (
            <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={GOLD} strokeWidth={8} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - on[i + 1])} />
          );
        })}
      </svg>
      {PROCESS.map((p, i) => (
        <div key={p.label} style={{position: 'absolute', left: xs[i], top: ys[i], display: 'flex', alignItems: 'center', gap: 18, opacity: 0.25 + 0.75 * on[i], transform: `scale(${0.9 + 0.1 * on[i]})`, transformOrigin: '60px 60px'}}>
          <div style={{width: 120, height: 120, borderRadius: 60, background: on[i] > 0.5 ? '#fff' : 'rgba(255,255,255,0.2)', border: `5px solid ${on[i] > 0.5 ? GOLD : 'rgba(255,255,255,0.5)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54, color: BLUE}}>{p.icon}</div>
          <Reveal p={on[i]}>
            <div style={{fontFamily: TXT, fontWeight: 900, fontSize: 38, color: '#fff', width: 330, lineHeight: 1.1}}>{p.label}</div>
          </Reveal>
        </div>
      ))}
    </>
  );
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
  const blink = [2.2, 6.1, 10.4, 14.0, 18.3, 22.9, 26.1, 31.0, 36.4, 41.5, 46.2, 50.8, 55.6, 60.2, 64.5, 68.8, 73.1, 77.6, 81.9].some((b) => s >= b && s < b + 0.13) ? 1 : 0;
  const point = Math.max(
    prog(s, W('s2', 3), W('s2', 4)) * (1 - prog(s, W('s2', 20), W('s2', 21))),
    prog(s, W('s4', 11), W('s4', 12)) * (1 - prog(s, W('s4', 17, 'end'), W('s4', 18))),
    prog(s, W('s5', 6), W('s5', 7)) * (1 - prog(s, W('s5', 23), W('s5', 24))),
    prog(s, W('s7', 17), W('s7', 18)) * (1 - prog(s, W('s7', 22, 'end') + 0.6, W('s7', 22, 'end') + 1.0)),
  );
  const nod = Math.max(...SCENES.flatMap((k) => (VOICE[k].words as Word[]).map((w, i) => (i % 4 === 0 ? Math.max(0, 1 - Math.abs(s - (S[k].voiceAt + w.start)) / 0.25) : 0))));

  // purposeful camera: push toward what the narration is about
  let zoom = 1;
  let oy = 760;
  if (sc === 's1') zoom = lin(s, 0, S.s1.end, 1, 1.05);
  if (sc === 's2' || sc === 's3' || sc === 's6') {
    zoom = interpolate(s, [S[sc].start, S[sc].start + 1, S[sc].end], [0.92, 1.04, 1.08], {extrapolateRight: 'clamp'});
    oy = 700;
  }
  if (sc === 's4') {
    zoom = lin(s, W('s4', 12), W('s4', 17, 'end'), 1, 1.07);
    oy = 940;
  }

  // scene 2: advance installments in bursts, whenever you decide
  const adv = interpolate(
    s,
    [W('s2', 4), W('s2', 5), W('s2', 9), W('s2', 10), W('s2', 15), W('s2', 17), W('s2', 20, 'end')],
    [0, 6, 6, 14, 14, 20, 24],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  // scene 3: month by month up to month 24, then a new car
  const monthly = lin(s, W('s3', 5), W('s3', 14, 'end'), 0, 24);
  const s3CarAt = W('s3', 19);
  const phoneOut3 = prog(s, s3CarAt - 0.2, s3CarAt + 0.4);
  // scene 4: 60-installment timeline
  const firstDone = lin(s, S.s4.start + 0.3, S.s4.start + 1.6, 0, 24);
  const restOn = prog(s, W('s4', 12) - 0.1, W('s4', 13) + 0.2);
  const count36 = Math.round(lin(s, W('s4', 13), W('s4', 17, 'end'), 0, 36));
  // scene 6: draw months 1, 5, 10, 15 and 20 light up one after another
  const DRAW_MONTHS = [1, 5, 10, 15, 20];
  const drawOn = prog(s, W('s6', 15) - 0.2, W('s6', 15) + 0.4);
  const sparkle = (n: number) => {
    const i = DRAW_MONTHS.indexOf(n);
    if (i < 0) return 0;
    const lit = prog(s, W('s6', 3) + i * 0.45, W('s6', 3) + i * 0.45 + 0.3);
    return lit * (0.75 + 0.25 * Math.sin(s * 5 + i)) + drawOn * 0;
  };

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Background s={s} />

      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `540px ${oy}px`}}>
        {sc === 's1' && (
          <>
            <LogoCard show={sp(0)} />
            <Headline p={prog(s, 0.4, 1.2)} top={320} text="¡ESTRENA TU AUTO NUEVO!" size={66} />
            <Car p={sp(0.6)} top={540} />
            <Reveal p={prog(s, W('s1', 2) - 0.1, W('s1', 2) + 0.4)} style={{position: 'absolute', left: 140, top: 940, width: 800}}>
              <div style={{background: '#fff', borderRadius: 22, padding: '16px 28px', borderLeft: `16px solid ${RED}`, fontFamily: TXT}}>
                <div style={{fontSize: 50, fontWeight: 900, color: BLUE}}>{CONFIG.advisor}</div>
                <div style={{fontSize: 32, fontWeight: 800, color: '#33466b'}}>{CONFIG.role}</div>
              </div>
            </Reveal>
          </>
        )}

        {sc === 's2' && (
          <>
            <Headline p={prog(s, S.s2.start + 0.1, S.s2.start + 0.8)} top={140} text="ADELANTA TUS PRIMERAS 24 CUOTAS" size={56} />
            <div style={{transform: `translateY(${(1 - sp(S.s2.start + 0.2)) * 1200}px)`}}>
              <Phone title="Cuotas adelantadas" top={330}>
                <div style={{position: 'absolute', top: 104, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 64, color: RED, lineHeight: 1}}>
                  {Math.round(adv)} <span style={{fontSize: 32, color: '#33466b'}}>/ 24</span>
                </div>
                <Calendar24 filled={adv} label="Cuota" top={190} />
                <Reveal p={prog(s, W('s2', 9) - 0.1, W('s2', 9) + 0.4)} style={{position: 'absolute', bottom: 22, left: 24, right: 24}}>
                  <div style={{background: BLUE, color: '#fff', borderRadius: 14, padding: '8px 10px', textAlign: 'center', fontFamily: TXT, fontWeight: 900, fontSize: 24}}>Dentro de los primeros 24 meses</div>
                </Reveal>
              </Phone>
            </div>
            <Reveal p={prog(s, W('s2', 15) - 0.1, W('s2', 15) + 0.4)} style={{position: 'absolute', left: 350, top: 1135, width: 520}}>
              <div style={{background: GOLD, color: NAVY, borderRadius: 30, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 36}}>Cuando tú decidas</div>
            </Reveal>
          </>
        )}

        {sc === 's3' && (
          <>
            <Headline p={prog(s, S.s3.start + 0.1, S.s3.start + 0.8)} top={140} text="PAGA MES A MES HASTA EL MES 24" size={56} />
            <div style={{opacity: 1 - phoneOut3, transform: `translateY(${(1 - sp(S.s3.start + 0.2)) * 1200 - phoneOut3 * 200}px)`}}>
              <Phone title="Pago mensual" top={330}>
                <div style={{position: 'absolute', top: 104, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: BLUE, lineHeight: 1.1}}>
                  Mes {Math.max(1, Math.ceil(monthly))}
                </div>
                <Calendar24 filled={monthly} label="Mes" color="#2f6fd6" top={190} mark24={prog(s, W('s3', 14), W('s3', 14) + 0.3)} />
              </Phone>
            </div>
            {s >= s3CarAt - 0.2 && (
              <>
                <Car p={spring({frame: frame - Math.round(s3CarAt * fps), fps, config: {damping: 16, stiffness: 120}})} top={430} />
                <Reveal p={prog(s, s3CarAt + 0.3, s3CarAt + 0.8)} style={{position: 'absolute', left: 120, top: 830, width: 840}}>
                  <div style={{background: '#fff', color: BLUE, borderRadius: 26, padding: '16px 20px', textAlign: 'center', fontFamily: TXT, fontWeight: 900, fontSize: 38, borderLeft: `14px solid ${RED}`}}>
                    No necesitas adelantar todas las cuotas
                  </div>
                </Reveal>
              </>
            )}
          </>
        )}

        {sc === 's4' && (
          <>
            <Headline p={prog(s, S.s4.start + 0.1, S.s4.start + 0.8)} top={120} text="CONTINÚAS PAGANDO LAS 36 CUOTAS RESTANTES" size={52} />
            <Car p={sp(S.s4.start + 0.1)} top={370} width={720} />
            <Reveal p={prog(s, W('s4', 6), W('s4', 8, 'end'))} style={{position: 'absolute', left: 700, top: 330, width: 260}}>
              <div style={{background: GOLD, color: NAVY, borderRadius: 20, padding: '8px 12px', textAlign: 'center', fontFamily: TXT, fontWeight: 900, fontSize: 28}}>Vehículo entregado</div>
            </Reveal>
            <div style={{position: 'absolute', left: 100, top: 690, width: 880, display: 'flex', justifyContent: 'space-between', fontFamily: TXT, fontWeight: 900, fontSize: 32, color: '#fff'}}>
              <span>Plan total: 60 cuotas</span>
              <span style={{color: GOLD, opacity: restOn}}>Faltan: {count36}</span>
            </div>
            <div style={{position: 'absolute', left: 100, top: 750, width: 880, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8}}>
              {Array.from({length: 60}, (_, i) => i + 1).map((n) => {
                const done = n <= firstDone;
                const rest = n > 24;
                const pulse = rest ? restOn * (0.5 + 0.5 * Math.sin(s * 5 - n * 0.2)) : 0;
                return (
                  <div
                    key={n}
                    style={{
                      height: 52,
                      borderRadius: 10,
                      background: done ? '#ffffff' : rest ? `rgba(227,27,35,${0.35 + 0.55 * restOn})` : 'rgba(255,255,255,0.15)',
                      border: `3px solid ${rest ? (restOn > 0.3 ? GOLD : 'rgba(255,255,255,0.3)') : '#fff'}`,
                      color: done ? BLUE : '#fff',
                      fontFamily: TXT,
                      fontWeight: 900,
                      fontSize: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `scale(${1 + 0.06 * pulse})`,
                    }}
                  >
                    {done ? '✓' : n}
                  </div>
                );
              })}
            </div>
            <div style={{position: 'absolute', left: 420, top: 1110, width: 560, display: 'flex', gap: 16, fontFamily: TXT, fontWeight: 900, fontSize: 28}}>
              <div style={{background: '#fff', color: BLUE, borderRadius: 16, padding: '8px 16px'}}>24 pagadas</div>
              <div style={{background: RED, color: '#fff', borderRadius: 16, padding: '8px 16px', opacity: restOn}}>36 restantes</div>
            </div>
          </>
        )}

        {sc === 's5' && (
          <>
            <Headline p={prog(s, S.s5.start + 0.1, S.s5.start + 0.8)} top={100} text="TE ACOMPAÑO EN TODO EL PROCESO" size={54} />
            <Process s={s} />
          </>
        )}

        {sc === 's6' && (
          <>
            <Headline p={prog(s, W('s6', 3) - 0.3, W('s6', 3) + 0.4)} top={140} text="OPORTUNIDADES ADICIONALES DE ADJUDICACIÓN" size={50} />
            <div style={{transform: `translateY(${(1 - sp(S.s6.start + 0.2)) * 1200}px)`}}>
              <Phone title="Sorteos del programa" top={330}>
                <div style={{position: 'absolute', top: 104, left: 20, right: 20, textAlign: 'center', fontFamily: TXT, fontWeight: 900, fontSize: 25, color: RED}}>Sorteos: meses 1, 5, 10, 15 y 20</div>
                <Calendar24 filled={0} label="Mes" top={150} sparkle={sparkle} mark24={prog(s, W('s6', 25), W('s6', 26))} />
                <div style={{position: 'absolute', bottom: 22, left: 20, right: 20, textAlign: 'center', fontFamily: TXT, fontWeight: 800, fontSize: 20, color: '#5a6b8c'}}>Posibilidad sujeta a sorteo. No garantizada.</div>
              </Phone>
            </div>
          </>
        )}

        {sc === 's7' && (
          <>
            <LogoCard show={sp(S.s7.start)} top={90} />
            <Car p={sp(S.s7.start + 0.1)} top={300} width={900} />
            <Reveal p={prog(s, S.s7.start + 0.4, S.s7.start + 1.0)} style={{position: 'absolute', left: 60, top: 650, width: 960}}>
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 62, color: GOLD, textAlign: 'center'}}>¡CONTÁCTAME HOY!</div>
            </Reveal>
            <Reveal p={prog(s, S.s7.start + 0.6, S.s7.start + 1.2)} style={{position: 'absolute', left: 50, top: 750, width: 980}}>
              <div style={{background: '#fff', borderRadius: 32, padding: '18px 16px', textAlign: 'center', boxShadow: '0 18px 40px rgba(0,0,0,0.35)', borderBottom: `10px solid ${RED}`}}>
                <div style={{fontFamily: TXT, fontSize: 54, fontWeight: 900, color: BLUE}}>{CONFIG.advisor}</div>
                <div style={{fontFamily: TXT, fontSize: 30, fontWeight: 800, color: '#33466b'}}>{CONFIG.role}</div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 6}}>
                  <svg width={72} height={72} viewBox="0 0 64 64"><circle cx={32} cy={32} r={28} fill="#25d366" /><path d="M 22 20 Q 18 30 28 40 Q 38 50 46 44 L 42 37 L 37 39 Q 31 35 28 29 L 30 25 Z" fill="#fff" /></svg>
                  <div style={{fontFamily: TXT, fontSize: 30, fontWeight: 900, color: '#1d8f4a'}}>WhatsApp</div>
                  <div style={{fontFamily: TXT, fontSize: 82, fontWeight: 900, color: '#0d1b38'}}>{CONFIG.whatsapp}</div>
                </div>
              </div>
            </Reveal>
            <div style={{position: 'absolute', left: 80, top: 1060, width: 920, textAlign: 'center', fontFamily: TXT, fontWeight: 700, fontSize: 22, color: '#dce6f7', opacity: prog(s, S.s7.start + 1.0, S.s7.start + 1.6)}}>
              {CONFIG.legal}
            </div>
          </>
        )}
      </AbsoluteFill>

      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(${210 - (1 - sp(0.1)) * 500} 1250) scale(0.95)`}>
          <circle cx={0} cy={110} r={230} fill="#fff" opacity={0.08} />
          <Presenter t={s} mouth={m.open} wide={m.wide} blink={blink} point={point} nod={nod} />
        </g>
      </svg>

      <Caption s={s} />
      <Wipe s={s} />

      <Audio src={staticFile('pandero/musica.mp3')} volume={(f) => interpolate(f / fps, [0, 1, CONFIG.scenes.s7.end - 2, CONFIG.scenes.s7.end], [0, 0.1, 0.1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      {SCENES.map((k) => (
        <Sequence key={k} from={Math.round(S[k].voiceAt * fps)}>
          <Audio src={staticFile(VOICE[k].file)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
