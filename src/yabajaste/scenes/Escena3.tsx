import React from "react";
import { AbsoluteFill } from "remotion";
import { Bean, EL, LONA, OL, SKIN } from "../rig/Bean";
import { Handset, PhoneChat, ChatItem } from "../props/PhoneChat";
import { BusWindowFrame, Droplets, NightBokeh } from "../sets/Bus";
import { Finish, Stage, kf, mix, easeOut } from "../ui/Frame";

/* Escena 3 · Su voz. Shots take t = seconds since the shot started; `at` values are shot-local too. */

export const CHAT: ChatItem[] = [
  { kind: "date", text: "SÁBADO 2 DE MARZO" },
  { kind: "me", text: "¿ya bajaste?", time: "19:52", match: true },
  { kind: "date", text: "SÁBADO 9 DE MARZO" },
  { kind: "me", text: "¿ya bajaste?", time: "20:05", match: true },
  { kind: "note", dur: "0:05", time: "20:06" },
  { kind: "date", text: "SÁBADO 16 DE MARZO" },
  { kind: "me", text: "afuera, ¿ya bajaste?", time: "19:47", match: true },
];
const PLAY = { x: 94, y: 670 }; // play button centre in screen units (see PhoneChat layout)

/* Inside the bus, behind the phone: seat back and cold light sweeping across. */
const BusDark: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={1080} height={1920} fill="#1a2029" />
    <rect x={-40} y={1200} width={1160} height={800} rx={60} fill="#27324a" stroke={OL} strokeWidth={6} />
    {Array.from({ length: 18 }).map((_, i) => <path key={i} d={`M${i * 64},1210 L${i * 64 - 30},1920`} stroke="#222b3f" strokeWidth={6} />)}
    {[0, 1, 2].map((i) => {
      const x = ((1500 - ((t * 700 + i * 620) % 2100)));
      return <path key={i} d={`M${x},0 L${x + 260},0 L${x - 140},1920 L${x - 400},1920 Z`} fill={i === 1 ? "#ffcf86" : "#bfe0ff"} opacity={0.06} />;
    })}
  </g>
);

export const ShotTap: React.FC<{ t: number; len: number; tapAt: number; noteAt: number; noteLen: number }> = ({ t, len, tapAt, noteAt, noteLen }) => {
  const reach = kf(t, tapAt - 0.55, tapAt, easeOut);
  const back = kf(t, tapAt + 0.25, tapAt + 0.75);
  const press = t >= tapAt && t < tapAt + 0.22 ? 1 - (t - tapAt) / 0.22 : 0;
  const playK = t < noteAt ? -1 : Math.min(1, (t - noteAt) / noteLen);
  const fx = mix(mix(560, PLAY.x + 18, reach), 620, back), fy = mix(mix(1560, PLAY.y + 24, reach), 1500, back) + press * 6;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage t={t} len={len} z={[1.16, 1.22]} f={[430, 820]}>
        <BusDark t={t} />
        <g transform="translate(232,330) rotate(-3)">
          <Handset>
            <PhoneChat term="ya bajaste" count="2 de 41" items={CHAT} playK={playK} pressK={press} />
          </Handset>
          {/* his left hand holding the phone, jacket cuff */}
          <path d="M-150,1500 C-120,1380 -60,1300 10,1290 L60,1420 C10,1450 -40,1520 -60,1600 Z" fill="#62748a" stroke={OL} strokeWidth={7} />
          <circle cx={20} cy={1250} r={92} fill={SKIN.b} stroke={OL} strokeWidth={7} />
          <path d="M-6,1180 C 30,1150 60,1160 70,1190" stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} />
          {/* tapping finger (right hand) */}
          <g transform={`translate(${fx},${fy}) rotate(-28)`}>
            <path d="M-36,0 C-36,-30 36,-30 36,0 L40,170 L-40,170 Z" fill={SKIN.b} stroke={OL} strokeWidth={7} strokeLinejoin="round" />
            <path d="M-18,-6 C-18,-20 18,-20 18,-6 L16,26 L-16,26 Z" fill="#f6e2cf" stroke={OL} strokeWidth={3} />
            <circle cx={10} cy={230} r={96} fill={SKIN.b} stroke={OL} strokeWidth={7} />
            <path d="M-80,300 L100,300 L120,700 L-100,700 Z" fill="#62748a" stroke={OL} strokeWidth={7} />
          </g>
          {press > 0 ? <circle cx={PLAY.x} cy={PLAY.y} r={60 + (1 - press) * 50} fill="none" stroke="#bff3e0" strokeWidth={6} opacity={press} /> : null}
        </g>
      </Stage>
      <Finish tone="frio" />
    </AbsoluteFill>
  );
};

/* His reflection in the glass while the voice note plays. The camera does not move.
   Acting order: phone to the ear, eyes drift up on «Oye», he hears «mi mamá», then the eyes soften,
   then a laugh through the nose, then the real smile, which stays. */
export const ShotReflejo: React.FC<{ t: number; mamaAt: number; keysAt: number }> = ({ t, mamaAt, keysAt }) => {
  const lift = kf(t, 0.0, 0.6);
  const handX = mix(30, 112, lift), handY = mix(-96, -258, lift);
  const eyesUp = kf(t, 0.75, 1.25);
  const soft = t > mamaAt + 0.18;
  const puffK = (t - (mamaAt + 0.38)) / 0.5;
  const snort = puffK > 0 && puffK < 1;
  const smile = t > mamaAt + 0.62;
  const bob = snort ? -Math.abs(Math.sin(puffK * Math.PI * 2)) * 5 : 0;
  const expr = smile ? (t > mamaAt + 0.62 && t < mamaAt + 1.1 ? "snort" : "smile") : snort ? "snort" : soft ? "soft" : "listen";
  const lookY = mix(0.6, -0.2, eyesUp) + (t > keysAt ? kf(t, keysAt, keysAt + 0.5) * 0.5 : 0);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="rsky" x1={0} y1={0} x2={0} y2={1}><stop offset={0} stopColor="#0c1222" /><stop offset={0.6} stopColor="#1a2238" /><stop offset={1} stopColor="#2a2a3a" /></linearGradient>
          <filter id="cool" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.45 0.25 0.15 0 0.02  0.30 0.50 0.20 0 0.05  0.35 0.40 0.45 0 0.12  0 0 0 1 0" />
          </filter>
        </defs>
        <rect width={1080} height={1920} fill="url(#rsky)" />
        <NightBokeh t={t + 3} speed={240} o={0.7} />
        {/* the reflection (mirrored, cold, see-through) */}
        <g opacity={0.72} filter="url(#cool)">
          <Bean {...EL} T={t + 10} x={540} y={1630} s={2.55} flip noLegs noShadow strap={LONA}
            expr={expr as any} lookY={lookY} look={-0.3} turn={-0.2} tilt={smile ? -3 : 0} puff={snort ? puffK : 0} bob={bob}
            armR={{ hand: [handX, handY], bend: -1 }}
            holdR={<g transform="rotate(-20)"><rect x={-24} y={-70} width={48} height={100} rx={10} fill="#17191f" stroke={OL} strokeWidth={4} /></g>} />
          {/* at the ear the phone and hand sit in front of the cheek (mirrored: his right hand reads on the left) */}
          {lift > 0.55 ? <g opacity={kf(t, 0.5, 0.65)} transform={`translate(${540 - 104 * 2.55},${1630 - 262 * 2.55}) scale(2.55) rotate(14)`}>
            <rect x={-20} y={-62} width={40} height={92} rx={9} fill="#17191f" stroke={OL} strokeWidth={4} />
            <rect x={-15} y={-55} width={6} height={70} rx={3} fill="#5c6b80" opacity={0.6} />
            <circle cx={6} cy={24} r={13} fill={EL.skin} stroke={OL} strokeWidth={4} />
            <path d="M6,37 Q 30,90 40,150" stroke={OL} strokeWidth={7} fill="none" strokeLinecap="round" />
          </g> : null}
        </g>
        {/* lights outside pass over the reflection too */}
        <g style={{ mixBlendMode: "screen" }}><NightBokeh t={t + 7} speed={300} seed={9} o={0.3} /></g>
        <Droplets t={t} />
        <BusWindowFrame />
      </svg>
      <Finish tone="frio" />
    </AbsoluteFill>
  );
};
