import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAPTIONS, CONFIG, VOICE, Word, wordAt} from './config';
import {Presenter} from './Presenter';

type SceneKey = keyof typeof VOICE;
const SCENES: SceneKey[] = ['s1', 's2', 's3', 's4', 's5'];
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
const sceneAt = (s: number): SceneKey => SCENES.find((k) => s < CONFIG.scenes[k].end) ?? 's5';
const W = (k: SceneKey, i: number, e: 'start' | 'end' = 'start') => wordAt(k, i, e);

/** Mouth from word timings: one opening per syllable. */
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

const Reveal: React.FC<{p: number; children: React.ReactNode; style?: React.CSSProperties}> = ({p, children, style}) => (
  <div style={{...style, clipPath: `inset(0 ${100 - clamp(p) * 100}% 0 0)`}}>{children}</div>
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

const LogoCard: React.FC<{show: number; top?: number}> = ({show, top = 130}) => (
  <div style={{position: 'absolute', left: 300, top, width: 480, height: 190, background: '#fff', borderRadius: 26, boxShadow: '0 18px 40px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - show) * -260}px)`, opacity: show}}>
    <Img src={staticFile('pandero/logo-crop.png')} style={{width: 420, height: 'auto'}} />
  </div>
);

const Car: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w}}>
    <div style={{position: 'absolute', left: '6%', right: '6%', bottom: -14, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', filter: 'blur(10px)'}} />
    <Img src={staticFile('pandero/auto.png')} style={{width: '100%', height: 'auto', position: 'relative'}} />
  </div>
);

const PriceBadge: React.FC<{p: number; top: number; scale?: number}> = ({p, top, scale = 1}) =>
  CONFIG.price.show ? (
    <Reveal p={p} style={{position: 'absolute', left: 110, top, width: 860, transform: `scale(${scale})`, transformOrigin: '50% 0%'}}>
      <div style={{background: RED, borderRadius: 28, padding: '16px 20px', textAlign: 'center', color: '#fff', boxShadow: '0 16px 36px rgba(0,0,0,0.35)'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 72, lineHeight: 1.05}}>{CONFIG.price.big}</div>
        <div style={{fontFamily: TXT, fontWeight: 800, fontSize: 30, opacity: 0.92}}>{CONFIG.price.note}</div>
      </div>
    </Reveal>
  ) : null;

/** iPhone-style frame, thin bezel; children render inside the screen. */
const Phone: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
  <div style={{position: 'absolute', left: 260, top: 210, width: 560, height: 900, borderRadius: 76, background: '#0b0d12', padding: 12, boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 64, overflow: 'hidden', background: '#f3f6fc'}}>
      <div style={{position: 'absolute', left: 198, top: 16, width: 140, height: 38, borderRadius: 20, background: '#0b0d12'}} />
      <div style={{position: 'absolute', top: 74, left: 0, right: 0, textAlign: 'center', fontFamily: TXT, fontWeight: 900, fontSize: 34, color: BLUE}}>{title}</div>
      {children}
    </div>
  </div>
);

/** Scene 2: the two ways to reach 24 installments. */
const TwoWays: React.FC<{option: number; paid: number}> = ({option, paid}) => {
  const tab = (n: number, label: string) => (
    <div style={{flex: 1, borderRadius: 16, padding: '12px 6px', textAlign: 'center', fontFamily: TXT, fontWeight: 900, fontSize: 25, lineHeight: 1.15, background: option === n ? BLUE : '#dfe7f5', color: option === n ? '#fff' : '#33466b'}}>{label}</div>
  );
  return (
    <>
      <div style={{position: 'absolute', top: 126, left: 26, right: 26, display: 'flex', gap: 12}}>
        {tab(1, '1 cuota al mes')}
        {tab(2, 'Adelantar cuotas')}
      </div>
      <div style={{position: 'absolute', top: 214, left: 0, right: 0, textAlign: 'center', fontFamily: TXT, fontWeight: 900, fontSize: 30, color: '#33466b'}}>
        Cuotas pagadas: {Math.round(paid)} / 24
      </div>
      <div style={{position: 'absolute', top: 262, left: 26, right: 26, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10}}>
        {Array.from({length: 24}, (_, i) => i + 1).map((n) => {
          const done = paid >= n - 0.01;
          return (
            <div key={n} style={{height: 80, borderRadius: 16, background: done ? (option === 2 ? RED : BLUE) : '#fff', border: `3px solid ${done ? (option === 2 ? RED : BLUE) : '#c9d5ea'}`, color: done ? '#fff' : '#33466b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: TXT, fontWeight: 900}}>
              <div style={{fontSize: 18, opacity: 0.85}}>Cuota</div>
              <div style={{fontSize: 32, lineHeight: 1}}>{n}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

/** Scene 3: group months with a draw (1, 5, 10, 15, 20) drawn as ascending steps. */
const DrawSteps: React.FC<{lit: number[]; s: number}> = ({lit, s}) => {
  const months = [1, 5, 10, 15, 20];
  return (
    <>
      <div style={{position: 'absolute', top: 124, left: 30, right: 30, textAlign: 'center', fontFamily: TXT, fontWeight: 800, fontSize: 26, color: '#33466b'}}>
        Meses del grupo con sorteo
      </div>
      {months.map((m, i) => {
        const on = lit[i];
        const pulse = on > 0.5 ? 1 + 0.04 * Math.sin(s * 8 - i) : 1;
        return (
          <div
            key={m}
            style={{
              position: 'absolute',
              left: 34 + i * 34,
              top: 690 - i * 118,
              width: 330,
              height: 100,
              borderRadius: 20,
              background: on > 0.5 ? BLUE : '#e2e9f6',
              border: `4px solid ${on > 0.5 ? GOLD : '#c9d5ea'}`,
              color: on > 0.5 ? '#fff' : '#7a8aa8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 22px',
              boxSizing: 'border-box',
              transform: `scale(${(0.94 + 0.06 * on) * pulse})`,
              boxShadow: on > 0.5 ? '0 12px 26px rgba(10,61,143,0.45)' : 'none',
              fontFamily: TXT,
              fontWeight: 900,
            }}
          >
            <span style={{fontSize: 44}}>MES {m}</span>
            <span style={{fontSize: 34, opacity: on}}>★</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', bottom: 34, left: 30, right: 30, textAlign: 'center', fontFamily: TXT, fontWeight: 700, fontSize: 22, color: '#5a6b8c'}}>
        Son meses del grupo, no cuotas pagadas
      </div>
    </>
  );
};

const StepCard: React.FC<{n: number; title: string; active: number; reveal: number; top: number; icon: React.ReactNode}> = ({n, title, active, reveal, top, icon}) => (
  <Reveal p={reveal} style={{position: 'absolute', left: 110, width: 860, height: 210, top}}>
    <div style={{width: '100%', height: '100%', borderRadius: 30, background: `rgba(255,255,255,${0.16 + 0.84 * active})`, border: '3px solid rgba(255,255,255,0.7)', borderLeft: `18px solid ${active > 0.5 ? RED : 'rgba(255,255,255,0.7)'}`, display: 'flex', alignItems: 'center', gap: 28, padding: '0 36px', boxSizing: 'border-box', transform: `scale(${1 + 0.04 * active})`, boxShadow: active > 0.5 ? '0 20px 50px rgba(0,0,0,0.35)' : 'none'}}>
      <div style={{width: 110, height: 110, borderRadius: 55, background: active > 0.5 ? BLUE : 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: FONT, fontSize: 40}}>{icon}</div>
      <div style={{fontFamily: TXT, color: active > 0.5 ? BLUE : '#fff'}}>
        <div style={{fontSize: 30, fontWeight: 800, opacity: 0.8}}>Paso {n}</div>
        <div style={{fontSize: 48, fontWeight: 900, lineHeight: 1.08}}>{title}</div>
      </div>
    </div>
  </Reveal>
);

/** Large captions, max two lines, in a safe band clear of the car, price and WhatsApp. */
const Caption: React.FC<{s: number}> = ({s}) => {
  for (const k of SCENES) {
    for (const c of CAPTIONS[k]) {
      const a = W(k, c.from) - 0.05;
      const b = W(k, c.to, 'end') + 0.25;
      if (s >= a && s <= b) {
        const o = clamp((s - a) / 0.12) * clamp((b - s) / 0.12);
        return (
          <div style={{position: 'absolute', left: 400, top: 1350, width: 570, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o}}>
            <div style={{background: 'rgba(4,22,56,0.86)', borderRadius: 20, padding: '14px 22px', fontFamily: TXT, fontWeight: 900, fontSize: 46, lineHeight: 1.18, color: '#fff', textAlign: 'center', borderBottom: `6px solid ${RED}`}}>
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
  for (const k of ['s2', 's3', 's4', 's5'] as SceneKey[]) {
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
  const blink = [2.2, 6.1, 10.4, 14.0, 18.3, 22.9, 26.1, 31.0, 36.4, 41.5, 46.2, 50.8, 55.6, 60.2, 64.5].some((b) => s >= b && s < b + 0.13) ? 1 : 0;
  const point = Math.max(
    prog(s, W('s2', 3), W('s2', 4)) * (1 - prog(s, W('s2', 23, 'end'), W('s2', 23, 'end') + 0.4)),
    prog(s, W('s3', 4), W('s3', 5)) * (1 - prog(s, W('s3', 20, 'end'), W('s3', 21))),
    prog(s, W('s5', 5), W('s5', 6)) * (1 - prog(s, W('s5', 11), W('s5', 12))),
  );
  const nod = Math.max(...SCENES.flatMap((k) => (VOICE[k].words as Word[]).map((w, i) => (i % 4 === 0 ? Math.max(0, 1 - Math.abs(s - (S[k].voiceAt + w.start)) / 0.25) : 0))));

  // camera: move in on the information each scene is about
  let zoom = 1;
  let oy = 760;
  if (sc === 's1') {
    zoom = CONFIG.price.show ? interpolate(s, [0, W('s1', 16), W('s1', 23, 'end'), S.s1.end], [1, 1, 1.1, 1.1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : interpolate(s, [0, S.s1.end], [1, 1.05]);
    oy = 1000;
  }
  if (sc === 's2' || sc === 's3') {
    zoom = interpolate(s, [S[sc].start, S[sc].start + 1.0, S[sc].end], [0.9, 1.08, 1.12], {extrapolateRight: 'clamp'});
    oy = 660;
  }
  if (sc === 's4') zoom = interpolate(s, [S.s4.start, S.s4.end], [1, 1.04]);

  // scene 1
  const s1Car = sp(0);
  const nameP = prog(s, W('s1', 2) - 0.1, W('s1', 2) + 0.4);

  // scene 2
  const option = s >= W('s2', 16) - 0.1 ? 2 : 1;
  const paid =
    option === 1
      ? interpolate(s, [W('s2', 4), W('s2', 15, 'end')], [0, 24], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
      : interpolate(s, [W('s2', 22), W('s2', 23, 'end')], [0, 24], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const paid24 = prog(s, W('s2', 23, 'end'), W('s2', 23, 'end') + 0.45);

  // scene 3
  const lit = [7, 8, 9, 10, 12].map((i) => prog(s, W('s3', i) - 0.05, W('s3', i) + 0.2));
  const drawChip = prog(s, W('s3', 20) - 0.1, W('s3', 20) + 0.4);
  const chosen = prog(s, W('s3', 23) - 0.1, W('s3', 23) + 0.4);

  // scene 4
  const carBack = W('s4', 19) - 0.15;
  const stepsOut = prog(s, carBack - 0.1, carBack + 0.4);
  const st1 = prog(s, W('s4', 5) - 0.2, W('s4', 5) + 0.3);
  const req = prog(s, W('s4', 10) - 0.2, W('s4', 10) + 0.3);
  const st2 = prog(s, W('s4', 15) - 0.2, W('s4', 15) + 0.3);
  const s4Car = spring({frame: frame - Math.round(carBack * fps), fps, config: {damping: 16, stiffness: 120}});
  const keep = prog(s, W('s4', 26) - 0.2, W('s4', 26) + 0.4);

  // scene 5
  const card = prog(s, S.s5.start + 0.3, S.s5.start + 0.9);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Background s={s} />

      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `540px ${oy}px`}}>
        {sc === 's1' && (
          <>
            <LogoCard show={sp(0)} top={110} />
            <div style={{position: 'absolute', left: 60, top: 350, fontFamily: TXT, fontWeight: 900, fontSize: 40, color: '#fff', opacity: s1Car}}>{CONFIG.model}</div>
            <Car x={40 + (1 - s1Car) * 1100} y={400} w={1000} />
            {CONFIG.price.show ? (
              <PriceBadge p={prog(s, 0.2, 0.8)} top={800} scale={1 + 0.06 * prog(s, W('s1', 17), W('s1', 18))} />
            ) : (
              <Reveal p={prog(s, W('s1', 17) - 0.2, W('s1', 17) + 0.3)} style={{position: 'absolute', left: 110, top: 800, width: 860}}>
                <div style={{background: RED, borderRadius: 28, padding: '22px 20px', textAlign: 'center', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 70}}>Pandero Ya</div>
              </Reveal>
            )}
            <Reveal p={nameP} style={{position: 'absolute', left: 400, top: 1060, width: 570}}>
              <div style={{background: '#fff', borderRadius: 20, padding: '12px 22px', borderLeft: `14px solid ${RED}`, fontFamily: TXT}}>
                <div style={{fontSize: 40, fontWeight: 900, color: BLUE}}>{CONFIG.advisor}</div>
                <div style={{fontSize: 26, fontWeight: 800, color: '#33466b'}}>{CONFIG.role}</div>
              </div>
            </Reveal>
          </>
        )}

        {sc === 's2' && (
          <>
            <div style={{transform: `translateY(${(1 - sp(S.s2.start + 0.05)) * 1200}px)`}}>
              <Phone title="Pandero Ya">
                <TwoWays option={option} paid={paid} />
              </Phone>
            </div>
            <Reveal p={paid24} style={{position: 'absolute', left: 350, top: 1135, width: 500}}>
              <div style={{background: GOLD, color: NAVY, borderRadius: 30, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44}}>✓ 24 cuotas pagadas</div>
            </Reveal>
          </>
        )}

        {sc === 's3' && (
          <>
            <div style={{transform: `translateY(${(1 - sp(S.s3.start + 0.05)) * 1200}px)`}}>
              <Phone title="Sorteo del grupo">
                <DrawSteps lit={lit} s={s} />
              </Phone>
            </div>
            <Reveal p={chosen > 0 ? chosen : drawChip} style={{position: 'absolute', left: 350, top: 1135, width: 500}}>
              <div style={{background: chosen > 0.5 ? GOLD : RED, color: chosen > 0.5 ? NAVY : '#fff', borderRadius: 30, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: chosen > 0.5 ? 34 : 42, textAlign: 'center', lineHeight: 1.1}}>
                {chosen > 0.5 ? '¡Elegido! Trámites antes' : 'Participas en el sorteo'}
              </div>
            </Reveal>
          </>
        )}

        {sc === 's4' && (
          <>
            <div style={{opacity: 1 - stepsOut, transform: `translateX(${-stepsOut * 300}px)`}}>
              <Reveal p={prog(s, S.s4.start, S.s4.start + 0.6)} style={{position: 'absolute', left: 110, top: 300, width: 860}}>
                <div style={{color: '#fff', fontFamily: TXT, fontWeight: 900, fontSize: 46}}>Si no sales elegido:</div>
              </Reveal>
              <StepCard n={1} top={400} title="Completas 24 cuotas" active={st1 * (1 - st2)} reveal={prog(s, S.s4.start + 0.3, S.s4.start + 0.8)} icon="24" />
              <Reveal p={req} style={{position: 'absolute', left: 150, top: 640, width: 780}}>
                <div style={{color: '#fff', fontFamily: TXT, fontWeight: 900, fontSize: 36, textAlign: 'center'}}>+ requisitos del programa</div>
              </Reveal>
              <StepCard n={2} top={720} title="Inicias los trámites" active={st2} reveal={prog(s, W('s4', 15) - 0.3, W('s4', 15) + 0.2)} icon="✓" />
            </div>
            {s >= carBack && (
              <>
                <Reveal p={prog(s, carBack, carBack + 0.5)} style={{position: 'absolute', left: 110, top: 300, width: 860}}>
                  <div style={{color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 62, textAlign: 'center'}}>¡Te llevas tu auto!</div>
                </Reveal>
                <Car x={40 + (1 - s4Car) * 1100} y={430} w={1000} />
                <Reveal p={keep} style={{position: 'absolute', left: 110, top: 860, width: 860}}>
                  <div style={{background: RED, color: '#fff', borderRadius: 40, padding: '18px 26px', fontFamily: TXT, fontWeight: 900, fontSize: 38, textAlign: 'center'}}>Sigues pagando las cuotas que te quedan</div>
                </Reveal>
              </>
            )}
          </>
        )}

        {sc === 's5' && (
          <>
            <LogoCard show={sp(S.s5.start)} top={110} />
            <Car x={40} y={340} w={1000} />
            <Reveal p={card} style={{position: 'absolute', left: 50, top: 740, width: 980}}>
              <div style={{background: '#fff', borderRadius: 34, padding: '20px 16px', textAlign: 'center', boxShadow: '0 18px 40px rgba(0,0,0,0.35)', borderBottom: `10px solid ${RED}`}}>
                <div style={{fontFamily: TXT, fontSize: 56, fontWeight: 900, color: BLUE}}>{CONFIG.advisor}</div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 4}}>
                  <svg width={74} height={74} viewBox="0 0 64 64"><circle cx={32} cy={32} r={28} fill="#25d366" /><path d="M 22 20 Q 18 30 28 40 Q 38 50 46 44 L 42 37 L 37 39 Q 31 35 28 29 L 30 25 Z" fill="#fff" /></svg>
                  <div style={{fontFamily: TXT, fontSize: 30, fontWeight: 900, color: '#1d8f4a'}}>WhatsApp</div>
                  <div style={{fontFamily: TXT, fontSize: 84, fontWeight: 900, color: '#0d1b38'}}>{CONFIG.whatsapp}</div>
                </div>
              </div>
            </Reveal>
            <PriceBadge p={prog(s, S.s5.start + 0.7, S.s5.start + 1.2)} top={1000} scale={0.82} />
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

      {SCENES.map((k) => (
        <Sequence key={k} from={Math.round(S[k].voiceAt * fps)}>
          <Audio src={staticFile(VOICE[k].file)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
