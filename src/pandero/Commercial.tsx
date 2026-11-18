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

/** Thin-bezel front-facing phone that only shows the payment calendar. */
const Phone: React.FC<{s: number; paid: number; scroll: number}> = ({paid, scroll}) => {
  const cells = Array.from({length: 24}, (_, i) => i + 1);
  return (
    <div style={{position: 'absolute', left: 270, top: 230, width: 540, height: 880, borderRadius: 74, background: '#0b0d12', padding: 12, boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 62, overflow: 'hidden', background: '#f3f6fc'}}>
        <div style={{position: 'absolute', left: 190, top: 16, width: 136, height: 38, borderRadius: 20, background: '#0b0d12'}} />
        <div style={{position: 'absolute', top: 78, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_TEXT, fontWeight: 800, fontSize: 30, color: BLUE}}>Calendario de pagos</div>
        <div style={{position: 'absolute', top: 124, left: 40, right: 40, height: 76, borderRadius: 18, background: BLUE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_TEXT, fontWeight: 700, fontSize: 30}}>
          Cuotas pagadas: {Math.round(paid)}
        </div>
        <div style={{position: 'absolute', top: 226, left: 28, right: 28, bottom: 30, overflow: 'hidden'}}>
          <div style={{transform: `translateY(${-scroll * 560}px)`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14}}>
            {cells.map((n) => {
              const done = paid >= n - 0.01;
              return (
                <div
                  key={n}
                  style={{
                    height: 126,
                    borderRadius: 18,
                    background: done ? BLUE : '#fff',
                    border: `3px solid ${done ? BLUE : '#c9d5ea'}`,
                    color: done ? '#fff' : '#33466b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: FONT_TEXT,
                    fontWeight: 700,
                  }}
                >
                  <div style={{fontSize: 22, opacity: 0.85}}>Cuota</div>
                  <div style={{fontSize: 40}}>{n}</div>
                  <div style={{fontSize: 24, height: 26}}>{done ? '✓' : ''}</div>
                </div>
              );
            })}
          </div>
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
  const blinkF = [1.8, 5.2, 9.9, 13.6, 17.4, 22.3, 26.0, 30.9, 35.2, 38.8].some((b) => s >= b && s < b + 0.13) ? 1 : 0;
  const point = Math.max(
    prog(s, wordAt('s2', 3), wordAt('s2', 4)) * (1 - prog(s, wordAt('s2', 6), wordAt('s2', 7))),
    prog(s, wordAt('s3', 1), wordAt('s3', 2)) * (1 - prog(s, wordAt('s3', 12), wordAt('s3', 13))),
    prog(s, wordAt('s4', 5), wordAt('s4', 6)) * (1 - prog(s, wordAt('s4', 10), wordAt('s4', 11))),
  );
  const nod = Math.max(...SCENES.flatMap((k) => (VOICE[k].words as Word[]).map((w, i) => (i % 4 === 0 ? Math.max(0, 1 - Math.abs(s - (S[k].voiceAt + w.start)) / 0.25) : 0))));
  const presenterIn = sp(0.15);

  // camera follows the focus of each scene
  let zoom = 1;
  let ox = 540;
  let oy = 760;
  if (sc === 's1') zoom = interpolate(s, [0, S.s1.end], [1, 1.05]);
  if (sc === 's2') {
    zoom = interpolate(s, [S.s2.start, S.s2.start + 1.2, S.s2.end], [0.9, 1.08, 1.12], {extrapolateRight: 'clamp'});
    oy = 680;
  }
  if (sc === 's3') zoom = interpolate(s, [S.s3.start, S.s3.end], [1, 1.03]);

  // scene 1
  const s1Car = sp(S.s1.start + 0.2);
  const nameReveal = prog(s, wordAt('s1', 5) - 0.1, wordAt('s1', 5) + 0.5);
  const priceReveal = prog(s, wordAt('s1', 11) - 0.05, wordAt('s1', 11) + 0.5);

  // scene 2
  const phoneIn = sp(S.s2.start + 0.1);
  const paid = interpolate(s, [wordAt('s2', 4), wordAt('s2', 8)], [0, 24], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scroll = prog(s, wordAt('s2', 6), wordAt('s2', 8) - 0.2);
  const badge = prog(s, wordAt('s2', 8), wordAt('s2', 8) + 0.45);

  // scene 3: the "24 cuotas pagadas" box grows into the steps panel
  const morph = prog(s, S.s3.start, S.s3.start + 0.7);
  const step1 = prog(s, wordAt('s3', 2) - 0.3, wordAt('s3', 2) + 0.2);
  const step2 = prog(s, wordAt('s3', 7) - 0.3, wordAt('s3', 7) + 0.2);
  const note = prog(s, wordAt('s3', 13) - 0.2, wordAt('s3', 13) + 0.4);

  // scene 4
  const s4Car = sp(S.s4.start + 0.15);
  const s4Text = prog(s, S.s4.start + 0.6, S.s4.start + 1.2);
  const wa = prog(s, S.s4.start + 1.0, S.s4.start + 1.5);

  const badgeBox =
    sc === 's3'
      ? {left: interpolate(morph, [0, 1], [300, 90]), top: interpolate(morph, [0, 1], [1150, 360]), width: interpolate(morph, [0, 1], [500, 900]), height: interpolate(morph, [0, 1], [96, 760])}
      : {left: 300, top: 1150, width: 500, height: 96};

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Background s={s} />

      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${ox}px ${oy}px`}}>
        {sc === 's1' && (
          <>
            <LogoCard s={s} show={sp(0)} />
            <Car x={40 + (1 - s1Car) * 1100} y={520} w={1000} />
            {CONFIG.showPrice ? (
              <Reveal p={priceReveal} style={{position: 'absolute', left: 90, top: 960, width: 900}}>
                <div style={{background: RED, borderRadius: 22, padding: '22px 30px', color: '#fff', fontFamily: FONT, fontSize: 52, textAlign: 'center'}}>{CONFIG.priceText}</div>
              </Reveal>
            ) : (
              <Reveal p={nameReveal} style={{position: 'absolute', left: 140, top: 960, width: 800}}>
                <div style={{background: '#fff', borderRadius: 22, padding: '18px 30px', borderLeft: `16px solid ${RED}`, fontFamily: FONT_TEXT}}>
                  <div style={{fontSize: 52, fontWeight: 900, color: BLUE}}>{CONFIG.advisor}</div>
                  <div style={{fontSize: 34, fontWeight: 700, color: '#33466b'}}>Asesor vehicular · Pandero Auto</div>
                </div>
              </Reveal>
            )}
          </>
        )}

        {sc === 's2' && <div style={{transform: `translateY(${(1 - phoneIn) * 1200}px)`}}><Phone s={s} paid={paid} scroll={scroll} /></div>}

        {(sc === 's2' || sc === 's3') && (badge > 0 || sc === 's3') && (
          <div style={{position: 'absolute', ...badgeBox, borderRadius: 30, background: sc === 's3' ? 'rgba(255,255,255,0.08)' : RED, border: sc === 's3' ? '3px solid rgba(255,255,255,0.35)' : 'none', clipPath: sc === 's2' ? `inset(0 ${100 - badge * 100}% 0 0 round 30px)` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.35)'}}>
            {sc === 's2' && <div style={{color: '#fff', fontFamily: FONT, fontSize: 40}}>24 cuotas pagadas</div>}
          </div>
        )}

        {sc === 's3' && (
          <>
            <Reveal p={morph} style={{position: 'absolute', left: 120, top: 390, width: 840}}>
              <div style={{color: '#fff', fontFamily: FONT_TEXT, fontWeight: 800, fontSize: 40, opacity: 0.9}}>Después de adjudicar</div>
            </Reveal>
            <StepCard n={1} title="Adjudicación del certificado" active={step1} reveal={prog(s, S.s3.start + 0.5, S.s3.start + 1.0)} icon={<svg width={64} height={64} viewBox="0 0 64 64"><rect x={10} y={8} width={44} height={50} rx={6} fill="#fff" /><rect x={18} y={18} width={28} height={5} fill={RED} /><rect x={18} y={29} width={28} height={4} fill={BLUE} /><rect x={18} y={38} width={20} height={4} fill={BLUE} /></svg>} />
            <StepCard n={2} title="Trámites de entrega" active={step2} reveal={prog(s, S.s3.start + 0.8, S.s3.start + 1.3)} icon={<svg width={64} height={64} viewBox="0 0 64 64"><circle cx={22} cy={32} r={12} fill="none" stroke="#fff" strokeWidth={6} /><rect x={32} y={29} width={26} height={6} fill="#fff" /><rect x={48} y={35} width={6} height={10} fill="#fff" /></svg>} />
            <Reveal p={note} style={{position: 'absolute', left: 170, top: 1010, width: 740}}>
              <div style={{background: RED, color: '#fff', borderRadius: 40, padding: '16px 26px', fontFamily: FONT_TEXT, fontWeight: 800, fontSize: 34, textAlign: 'center'}}>Continúas pagando las cuotas pendientes</div>
            </Reveal>
          </>
        )}

        {sc === 's4' && (
          <>
            <LogoCard s={s} show={sp(S.s4.start)} />
            <Car x={40 - (1 - s4Car) * 1100} y={400} w={1000} />
            <Reveal p={s4Text} style={{position: 'absolute', left: 90, top: 805, width: 900, textAlign: 'center'}}>
              <div style={{fontFamily: FONT_TEXT, color: '#fff'}}>
                <div style={{fontSize: 54, fontWeight: 900}}>{CONFIG.advisor}</div>
                <div style={{fontSize: 34, fontWeight: 700, opacity: 0.9}}>{CONFIG.role}</div>
              </div>
            </Reveal>
            <Reveal p={wa} style={{position: 'absolute', left: 110, top: 955, width: 860}}>
              <div style={{background: '#25d366', borderRadius: 34, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, boxShadow: '0 18px 40px rgba(0,0,0,0.35)'}}>
                <svg width={84} height={84} viewBox="0 0 64 64"><circle cx={32} cy={32} r={26} fill="#fff" /><path d="M 14 54 L 18 41 Q 12 29 20 19" stroke="#fff" strokeWidth={6} fill="none" /><path d="M 24 22 Q 22 30 30 38 Q 38 46 44 42 L 40 36 L 36 38 Q 30 34 28 28 L 30 24 Z" fill="#25d366" /></svg>
                <div style={{fontFamily: FONT_TEXT, color: '#fff'}}>
                  <div style={{fontSize: 30, fontWeight: 800}}>WhatsApp</div>
                  <div style={{fontSize: 80, fontWeight: 900, lineHeight: 1}}>{CONFIG.whatsapp}</div>
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
