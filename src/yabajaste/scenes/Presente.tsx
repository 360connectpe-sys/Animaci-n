import React from "react";
import { AbsoluteFill } from "remotion";
import { Bean, EL, LONA, OL, SKIN } from "../rig/Bean";
import { Backpack, BusShell, SeatBack, SeatFront, SmallPhone, Street } from "../sets/BusInterior";
import { ChatItem, Handset, PhoneChat } from "../props/PhoneChat";
import { Finish, Stage, clamp01, kf, mix, easeOut } from "../ui/Frame";
import C from "../corto.json";

/* Present-day shots on the micro. Every shot gets global time T (seconds) and its [a, b] range; all cue times
   come from corto.json (built from the real voice lengths by tools/yabajaste/timeline.py). */
const t = C.t;
export type ShotP = { T: number; a: number; b: number };

const PAX = { hair: "short", hairColor: "#3b2a1e", outfit: "tee", color: "#7a8a5a", skin: SKIN.d, seed: 21 } as const;

/* Him seated by the window with the backpack on his lap, seen from the aisle. */
const Seated: React.FC<{
  T: number; look?: number; lookY?: number; turn?: number; tilt?: number; expr?: any; headBack?: boolean;
  armR?: any; armL?: any; holdR?: React.ReactNode; bob?: number; warm?: number;
}> = (p) => (
  <g>
    <SeatBack />
    <Bean {...EL} T={p.T} x={470} y={1300} s={1.6} noLegs noShadow strap={LONA}
      expr={p.expr ?? "calm"} look={p.look ?? 0} lookY={p.lookY ?? 0} turn={p.turn} tilt={p.tilt} headBack={p.headBack}
      armR={p.armR ?? { hand: [52, -96] }} armL={p.armL ?? { hand: [-52, -96] }} holdR={p.holdR} bob={p.bob} />
    <Backpack x={470} y={1290} s={1.05} />
    {p.warm ? <ellipse cx={470} cy={836} rx={260} ry={260} fill="#ffb562" opacity={0.22 * p.warm} style={{ mixBlendMode: "screen" }} /> : null}
  </g>
);

/* bus sway: small, constant; bump = a jolt at a time */
const sway = (T: number, bump?: number) => {
  let y = Math.sin(T * 2.3) * 2 + Math.sin(T * 5.1) * 1;
  if (bump !== undefined && T > bump && T < bump + 0.6) y += Math.sin((T - bump) * 28) * 16 * (1 - (T - bump) / 0.6);
  return y;
};

/* 1 · La cuadra. The bakery passes behind him; eyes first, then the head follows it until it is gone. */
export const ShotBusWide: React.FC<ShotP> = ({ T, a, b }) => {
  const signX = 470 + (t.sign - T) * 170;             // same speed as the street
  const follow = clamp01((signX - 470) / 500);          // +1 right .. -1 left
  const k = (signX - 470) / 420;
  const eyes = T > t.eyes ? Math.max(-1.3, Math.min(1.3, k * 1.3 + 0.4)) : 0;
  const head = T > t.eyes + 0.4 ? Math.max(-2.4, Math.min(1.6, k * 1.8)) : 0;
  const warm = Math.max(0, 1 - Math.abs(signX - 470) / 420);
  void follow;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage t={T - a} len={b - a} z={[1.22, 1.3]} f={[470, 960]} shake={0}>
        <g transform={`translate(0,${sway(T)})`}>
          <Street t={T} bakeryAt={t.sign} />
          <BusShell t={T} />
          <Seated T={T} look={eyes} turn={head} tilt={head * -5} lookY={T > t.eyes ? -0.2 : 0.3} warm={warm} expr={T > t.eyes + 0.2 ? "listen" : "calm"} />
        </g>
        <SeatFront />
      </Stage>
      <Finish tone="frio" />
    </AbsoluteFill>
  );
};

/* 2 · The warm light leaves his face; he looks down and takes the phone out. */
export const ShotBusMedium: React.FC<ShotP> = ({ T, a, b }) => {
  const warm = 1 - kf(T, a, a + 0.8);
  const out = kf(T, t.phone_out, t.phone_out + 0.6);
  const dip = T < t.phone_out ? kf(T, t.phone_out - 0.4, t.phone_out) : 1;
  const hand: [number, number] = out > 0 ? [mix(70, 24, out), mix(-70, -150, out)] : [mix(52, 70, dip), mix(-96, -70, dip)];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage t={T - a} len={b - a} z={[1.55, 1.62]} f={[470, 920]}>
        <g transform={`translate(0,${sway(T)})`}>
          <Street t={T} bakeryAt={t.sign} />
          <BusShell t={T} />
          <Seated T={T} look={mix(-1, 0, kf(T, a, a + 0.6))} turn={mix(-1.2, 0, kf(T, a + 0.1, a + 0.7))} lookY={mix(0, 1.1, kf(T, a + 0.5, a + 0.9))}
            warm={warm} expr="listen" armR={{ hand }} holdR={out > 0.2 ? <SmallPhone glow={out} rot={-10} /> : null} />
          {out > 0.3 ? <ellipse cx={470} cy={850} rx={200} ry={200} fill="#cfe8ff" opacity={0.10 * out} /> : null}
        </g>
        <SeatFront />
      </Stage>
      <Finish tone="frio" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- the chat */
const LATER = ["23 DE MARZO", "30 DE MARZO", "6 DE ABRIL", "13 DE ABRIL", "20 DE ABRIL", "27 DE ABRIL", "4 DE MAYO", "11 DE MAYO", "18 DE MAYO", "25 DE MAYO", "1 DE JUNIO", "8 DE JUNIO"];
const VARIANTS = ["¿ya bajaste?", "afuera, ¿ya bajaste?", "¿ya bajaste?", "ya llegué, ¿ya bajaste?"];
export const CHAT_ALL: ChatItem[] = [
  { kind: "date", text: "SÁBADO 2 DE MARZO" },
  { kind: "me", text: "¿ya bajaste?", time: "19:52", match: true },
  { kind: "date", text: "SÁBADO 9 DE MARZO" },
  { kind: "me", text: "¿ya bajaste?", time: "20:05", match: true },
  { kind: "note", dur: "0:05", time: "20:06" },
  { kind: "date", text: "SÁBADO 16 DE MARZO" },
  { kind: "me", text: "afuera, ¿ya bajaste?", time: "19:47", match: true },
  ...LATER.flatMap((d, i): ChatItem[] => [{ kind: "date", text: `SÁBADO ${d}` }, { kind: "me", text: VARIANTS[i % 4], time: `19:${(40 + i * 3) % 60}`.padEnd(5, "0"), match: true }]),
];
const H_DATE = 78, H_ME = 124;
const END_SCROLL = LATER.length * (H_DATE + H_ME) - 200;   // shows the latest messages
const PLAY = { x: 94, y: 670 };                            // play button at scroll 0

/* Phone close-up. `phase` picks the state: search typed, results, scroll back to March, finger on the note, tap. */
export const PhoneShot: React.FC<{ T: number; a: number; b: number; mode: "chat" | "fin" | "pulgar" }> = ({ T, a, b, mode }) => {
  const term = "ya bajaste";
  let typed = term, caret = false, count: string | undefined, scroll = 0, matches = 99, playK = -1;
  let fx = 620, fy = 1700, press = 0;
  let z: [number, number] = [1.16, 1.22], f: [number, number] = [430, 820];
  if (mode === "chat") {
    const n = Math.round(clamp01((T - t.type_a) / (t.type_b - t.type_a)) * term.length);
    typed = term.slice(0, n);
    caret = T < t.results && Math.floor(T * 2.5) % 2 === 0;
    const res = T >= t.results;
    const sk = kf(T, t.scroll_a, t.scroll_b);
    scroll = res ? mix(END_SCROLL, 0, sk) : END_SCROLL;
    matches = res ? 99 : 0;
    count = res ? `${Math.max(2, Math.round(mix(41, 2, sk)))} de 41` : undefined;
    // the finger comes in, stops over the note, then presses play
    const reach = kf(T, t.finger_in, t.hover, easeOut);
    const back = kf(T, t.tap + 0.25, t.tap + 0.75);
    press = T >= t.tap && T < t.tap + 0.22 ? 1 - (T - t.tap) / 0.22 : 0;
    fx = mix(mix(620, PLAY.x + 18, reach), 640, back); fy = mix(mix(1700, PLAY.y + 60, reach), 1600, back) - (T > t.hover - 0.05 && T < t.tap ? 30 * (1 - kf(T, t.tap - 0.25, t.tap)) : 0) + press * 6;
    playK = T < C.voices.nota ? -1 : Math.min(1, (T - C.voices.nota) / 5.35);
    z = [mix(1.16, 1.3, 0), 1.3]; f = [400, 720];
  } else if (mode === "fin") {
    count = "2 de 41"; playK = 1; fx = 560; fy = 1500;
    z = [1.45, 1.55]; f = [330, 780];
  } else {
    count = "2 de 41";
    const reach = kf(T, a, t.tap2, easeOut);
    press = T >= t.tap2 && T < t.tap2 + 0.22 ? 1 - (T - t.tap2) / 0.22 : 0;
    playK = T < C.voices.nota2 ? 1 : Math.min(1, (T - C.voices.nota2) / 5.35);
    fx = mix(400, PLAY.x + 22, reach); fy = mix(1100, PLAY.y + 30, reach) + press * 8;
    z = [1.9, 2.0]; f = [300, 900];
  }
  const thumb = mode === "pulgar";
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage t={T - a} len={b - a} z={z} f={f}>
        <rect width={1080} height={1920} fill="#1a2029" />
        <rect x={-40} y={1200} width={1160} height={800} rx={60} fill="#27324a" stroke={OL} strokeWidth={6} />
        {[0, 1, 2].map((i) => {
          const x = 1500 - ((T * 700 + i * 620) % 2100);
          return <path key={i} d={`M${x},0 L${x + 260},0 L${x - 140},1920 L${x - 400},1920 Z`} fill={i === 1 ? "#ffcf86" : "#bfe0ff"} opacity={0.06} />;
        })}
        <g transform="translate(232,330) rotate(-3)">
          <Handset>
            <PhoneChat term={typed} caret={caret} count={count} items={CHAT_ALL} scroll={scroll} matchesShown={matches} playK={playK} pressK={press} />
          </Handset>
          <path d="M-150,1500 C-120,1380 -60,1300 10,1290 L60,1420 C10,1450 -40,1520 -60,1600 Z" fill="#62748a" stroke={OL} strokeWidth={7} />
          <circle cx={20} cy={1250} r={92} fill={SKIN.b} stroke={OL} strokeWidth={7} />
          {/* finger or thumb */}
          <g transform={`translate(${fx},${fy}) rotate(${thumb ? -48 : -28})`}>
            <path d={`M-${thumb ? 44 : 36},0 C-${thumb ? 44 : 36},-32 ${thumb ? 44 : 36},-32 ${thumb ? 44 : 36},0 L40,170 L-40,170 Z`} fill={SKIN.b} stroke={OL} strokeWidth={7} strokeLinejoin="round" />
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

/* 6 · Same shoulder, same place in the frame: now the backpack strap. The bus jolts; he fixes the strap. */
export const ShotTira: React.FC<ShotP> = ({ T, a, b }) => {
  const fix = kf(T, t.fix, t.fix + 0.5);
  const fixBack = kf(T, t.fix + 0.7, t.fix + 1.1);
  const slip = T > t.bump ? Math.min(1, (T - t.bump) / 0.3) * (1 - fix) : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage t={T - a} len={b - a} z={[1, 1.03]} f={[540, 960]}>
        <g transform={`translate(0,${sway(T, t.bump) * 1.5})`}>
          <ShoulderCU T={T} tone="frio" strapSlip={slip} handIn={mix(fix, 0, fixBack)} />
        </g>
      </Stage>
      <Finish tone="frio" />
    </AbsoluteFill>
  );
};

/* Shoulder close-up used by both times: the jacket shoulder occupies the same place. */
export const ShoulderCU: React.FC<{ T: number; tone: "frio" | "calido"; hand?: React.ReactNode; strapSlip?: number; handIn?: number; sink?: number }> = ({ T, tone, hand, strapSlip, handIn = 0, sink = 0 }) => {
  const jacket = "#62748a";
  const cold = tone === "frio";
  const sy = sink;
  return (
    <g>
      <defs>
        <linearGradient id={`cu${tone}`} x1={0} y1={0} x2={1} y2={0}>
          {cold ? <><stop offset={0} stopColor="#16203a" /><stop offset={1} stopColor="#2a3554" /></> : <><stop offset={0} stopColor="#6a4a2a" /><stop offset={1} stopColor="#2a2a3a" /></>}
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill={`url(#cu${tone})`} />
      {/* out-of-focus lights behind */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = cold ? ((i * 211 - T * 160) % 1400 + 1400) % 1400 - 160 : (i * 173) % 1080;
        const y = 200 + ((i * 137) % 700);
        return <circle key={i} cx={x} cy={y} r={50 + (i % 4) * 30} fill={cold ? (i % 3 ? "#9fc6ff" : "#ffcf86") : "#ffcf86"} opacity={0.12} />;
      })}
      {/* his cheek and hair at the top-left, to anchor where we are */}
      <circle cx={40} cy={420} r={300} fill={SKIN.b} stroke={OL} strokeWidth={10} />
      <path d="M-280,330 C-270,20 0,-80 220,20 C320,70 360,150 346,250 C260,190 170,160 80,170 C-40,180 -160,250 -280,330 Z" fill="#231b17" stroke={OL} strokeWidth={10} />
      <ellipse cx={300} cy={470} rx={34} ry={56} fill={SKIN.b} stroke={OL} strokeWidth={8} />
      {/* the shoulder: jacket slope with seam and collar */}
      <g transform={`translate(0,${sy})`}>
        <path d="M-60,1920 L-60,980 C 80,900 300,860 560,880 C 820,900 1000,980 1140,1080 L1140,1920 Z" fill={jacket} stroke={OL} strokeWidth={10} />
        <path d="M-60,760 C 60,820 150,900 200,1000 L 140,1060 C 90,960 20,900 -60,860 Z" fill="#53637a" stroke={OL} strokeWidth={8} />
        <path d="M 330,885 C 420,1000 520,1180 560,1500" stroke="#4f5f75" strokeWidth={8} fill="none" />
        <path d="M 600,920 C 760,950 900,1010 1040,1100" stroke="#fff" strokeOpacity={0.14} strokeWidth={16} fill="none" strokeLinecap="round" />
        {/* fold lines where the weight presses */}
        {sy > 2 ? <path d={`M 470,${930} q 40,${10 + sy} 90,0 M 600,${940} q 30,${8 + sy} 70,0`} stroke="#4a596e" strokeWidth={6} fill="none" strokeLinecap="round" opacity={Math.min(1, sy / 12)} /> : null}
        {strapSlip !== undefined ? (
          <g transform={`translate(${(strapSlip ?? 0) * 70},${(strapSlip ?? 0) * 26}) rotate(${(strapSlip ?? 0) * 6},560,900)`}>
            <path d="M 450,1920 C 470,1400 520,1040 560,880 C 600,760 680,640 760,520" stroke={OL} strokeWidth={150} fill="none" />
            <path d="M 450,1920 C 470,1400 520,1040 560,880 C 600,760 680,640 760,520" stroke={LONA} strokeWidth={136} fill="none" />
            <path d="M 450,1920 C 470,1400 520,1040 560,880 C 600,760 680,640 760,520" stroke="#7d6e4c" strokeWidth={4} strokeDasharray="14 12" fill="none" transform="translate(-44,0)" />
            <path d="M 450,1920 C 470,1400 520,1040 560,880 C 600,760 680,640 760,520" stroke="#7d6e4c" strokeWidth={4} strokeDasharray="14 12" fill="none" transform="translate(44,0)" />
          </g>) : null}
        {hand}
      </g>
      {handIn > 0 ? (
        <g transform={`translate(${mix(1250, 760, handIn)},${mix(1500, 1040, handIn)})`}>
          <path d="M 40,60 L 420,420 L 260,600 L -80,200 Z" fill="#62748a" stroke={OL} strokeWidth={10} />
          <circle cx={0} cy={0} r={120} fill={SKIN.b} stroke={OL} strokeWidth={10} />
        </g>) : null}
    </g>
  );
};

/* 6 · Wide on the bus: he looks back for the bakery, then down to the phone. busWait: a passenger gets up.
   7 · busEnd: the rear door opens, street light pours in for a moment, the passenger gets off; he stays. */
export const ShotBusBack: React.FC<ShotP & { mode: "back" | "wait" | "end" }> = ({ T, a, b, mode }) => {
  const back = mode === "back" ? kf(T, t.lookBack, t.lookBack + 0.8) * (1 - kf(T, t.lookDown - 0.6, t.lookDown)) : 0;
  const down = mode === "back" ? kf(T, t.lookDown - 0.5, t.lookDown) : 1;
  const paxK = kf(T, t.paxUp, t.paxUp + 1.6);
  const doorK = mode === "end" ? kf(T, t.doorOpen, t.doorOpen + 0.35) * (1 - kf(T, t.doorOpen + 0.9, t.doorOpen + 1.3)) : 0;
  const leave = mode === "end" ? kf(T, t.doorOpen + 0.25, t.doorOpen + 0.85) : 0;
  const paxX = mode === "end" ? mix(930, 1160, leave) : mode === "wait" ? mix(760, 930, paxK) : 760;
  const walking = (mode === "wait" && paxK > 0 && paxK < 1) || (mode === "end" && leave > 0 && leave < 1);
  const lg = walking ? Math.sin(T * 11) * 22 : 0;
  const z: [number, number] = mode === "back" ? [1.22, 1.32] : mode === "wait" ? [1.3, 1.34] : [1.12, 1.12];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage t={T - a} len={b - a} z={z} f={[540, 960]}>
        <g transform={`translate(0,${sway(T)})`}>
          <Street t={T} farBakery={mode === "back" ? back * (1 - kf(T, t.lookBack + 3, t.lookBack + 6)) : 0} />
          <BusShell t={T} doorK={doorK} />
          {mode !== "back" || T > t.lookBack ? (
            <g opacity={mode === "end" ? 1 - leave * 0.9 : 1}>
              <Bean {...PAX} T={T + 7} x={paxX} y={1580} s={1.25} legL={lg} legR={-lg} look={1} turn={0.6}
                armR={mode === "end" ? "down" : { hand: [40, -230] }} />
            </g>) : null}
          <Seated T={T} turn={mix(0, -2.4, back)} look={mix(0, -1.4, back)} tilt={back * -9}
            lookY={back > 0.5 ? -0.2 : mix(0, 1.1, down)} expr={mode === "end" ? "soft" : "listen"}
            armR={{ hand: [24, -132] }} holdR={<SmallPhone glow={mode === "end" ? 1 : 0.7} rot={-10} />} />
          {doorK > 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#ffe2b0" opacity={0.16 * doorK} /> : null}
        </g>
        <SeatFront />
      </Stage>
      <Finish tone="frio" />
    </AbsoluteFill>
  );
};
