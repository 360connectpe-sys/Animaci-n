import React from "react";
import { AbsoluteFill } from "remotion";
import { Bean, EL, ELLA, OL, SKIN } from "../rig/Bean";
import { Bread, BreadBag, Corner } from "../sets/Corner";
import { Finish, Stage, kf, mix } from "../ui/Frame";
import { ShotP, ShoulderCU } from "./Presente";
import C from "../corto.json";
import LIPS from "../lips.json";

/* The memory: the corner by the bakery, warm light from its window. Global time T, cues from corto.json. */
const t = C.t, V = C.voices;
const FPS = 30;
const lip = (line: "r1" | "r2", T: number) => {
  const arr = LIPS[line] as number[];
  const i = Math.floor((T - V[line]) * FPS);
  return i >= 0 && i < arr.length ? arr[i] : 0;
};

/* 4 · The keys go on over the green handle: the key turns inside, the lever drops, a line of warm light. */
export const ShotManija: React.FC<ShotP> = ({ T, a, b }) => {
  const turn = kf(T, t.click - 0.35, t.click - 0.05);
  const lever = T < t.click ? 0 : T < t.click + 0.2 ? kf(T, t.click, t.click + 0.08) : 1 - kf(T, t.click + 0.35, t.click + 0.55);
  const gap = kf(T, t.click + 0.25, b);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage t={T - a} len={b - a} z={[1.06, 1.0]} f={[700, 900]}>
        <rect width={1080} height={1920} fill="#2f6a69" />
        {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M0,${200 + i * 260} H1080`} stroke="#2a5f5e" strokeWidth={10} />)}
        <rect x={120} y={160} width={700} height={620} fill="none" stroke="#24524f" strokeWidth={14} />
        <rect x={120} y={1120} width={700} height={620} fill="none" stroke="#24524f" strokeWidth={14} />
        <rect x={1000 - gap * 40} y={0} width={80 + gap * 40} height={1920} fill="#ffcf86" opacity={0.25 + 0.6 * gap} />
        <rect x={996 - gap * 40} y={0} width={10} height={1920} fill={OL} />
        <g transform="translate(700,960)">
          <rect x={-90} y={-240} width={180} height={480} rx={22} fill="#c9c2a6" stroke={OL} strokeWidth={8} />
          <rect x={-90} y={-240} width={60} height={480} rx={22} fill="#fff" opacity={0.18} />
          <circle cx={0} cy={110} r={52} fill="#a59c80" stroke={OL} strokeWidth={7} />
          <g transform={`rotate(${turn * 90},0,110)`}><rect x={-10} y={70} width={20} height={80} rx={6} fill={OL} /></g>
          <g transform={`rotate(${lever * 24},0,-110)`}>
            <circle cx={0} cy={-110} r={46} fill="#b5ad92" stroke={OL} strokeWidth={7} />
            <rect x={-280} y={-134} width={290} height={48} rx={24} fill="#d8d1b8" stroke={OL} strokeWidth={7} />
            <rect x={-270} y={-128} width={240} height={12} rx={6} fill="#fff" opacity={0.4} />
          </g>
        </g>
        <rect width={1080} height={1920} fill="#ffb562" opacity={0.08} />
      </Stage>
      <Finish tone="calido" />
    </AbsoluteFill>
  );
};

/* Who stands where on the sidewalk, at any time (shared by the wide, the two-shot and the walk). */
const HIM_Y = 1556;
const herPos = (T: number) => {
  const step = kf(T, t.out, t.out + 1.0);
  const walk = kf(T, t.walk_a, t.walk_b);
  return { x: mix(mix(780, 650, step), 545, walk), y: mix(1532, HIM_Y, kf(T, t.out + 0.5, t.out + 0.9)), walk };
};
const himX = (T: number) => mix(420, 320, kf(T, t.walk_a, t.walk_b));

const People: React.FC<{ T: number }> = ({ T }) => {
  const her = herPos(T);
  const hx = himX(T);
  const walking = T > t.walk_a && T < t.walk_b;
  const lg = walking ? Math.sin((T - t.walk_a) * 11) * 22 : 0;
  // ---- her
  const hop = T > t.out && T < t.out + 1.6 ? -Math.abs(Math.sin((T - t.out) * 8)) * 10 : 0;
  const heel = T < t.out + 1.55 ? 1 : 1 - kf(T, t.out + 1.55, t.out + 1.85);
  const checking = T > t.back && T < t.back + 0.95;
  const toBag = T > t.bagLook && T < t.lookUp;
  const reach = kf(T, t.reach, t.reach + 0.4), take = T > t.take, biting = T > t.bite - 0.2 && T < t.chewEnd;
  const chewing = T > t.bite && T < t.chewEnd;
  const lace = T > t.lace - 1.5 ? 1 : 0;
  const tie = kf(T, t.tie, t.tie + 0.5);
  const touch = kf(T, t.touch - 0.2, t.touch + 0.15);
  let herArmR: any = T < t.out + 0.45 ? { hand: [96, -200] } : "down";
  if (reach > 0 && T < t.bite) herArmR = { hand: [mix(10, 100, reach), mix(-80, -120, reach)] };
  if (biting) herArmR = { hand: [36, -205] };
  if (T > t.chewEnd) herArmR = { hand: [30, -150] };
  if (T > t.walk_a - 0.2) herArmR = "down";
  if (touch > 0) herArmR = { hand: [mix(40, 138, touch), mix(-120, -178, touch)] };
  const herArmL: any = tie > 0 ? { hand: [-80, -72] } : checking ? "hips" : "down";
  const herExpr = chewing ? "chew" : T > V.r2 && T < V.r2 + 2 ? "smile" : T > t.laugh && T < t.s4_end ? "happy" : checking ? "think" : toBag ? "smug" : T > t.lace && T < t.touch + 0.3 ? "neutral" : "smile";
  const herLookY = toBag && T < t.chewEnd ? 1.0 : T > t.lace && T < t.touch ? 1.2 : tie > 0 ? 1.2 : -0.1;
  const herBob = hop + (T > t.laugh && T < t.s4_end ? -Math.abs(Math.sin((T - t.laugh) * 9)) * 4 : 0);
  // ---- him
  const follow = T > t.follow;
  const offer = kf(T, t.offer, t.offer + 0.4) * (1 - kf(T, t.walk_a - 0.3, t.walk_a));
  const swap = kf(T, t.swap, t.swap + 0.5);
  const laughing = T > t.laugh && T < t.s4_end;
  const bagInLeft = swap > 0.5;
  let himArmR: any = { hand: [mix(22, 78, offer), mix(-108, -130, offer)] };
  let himArmL: any = "down";
  if (swap > 0 && swap < 1) { himArmR = { hand: [mix(22, 4, swap * 2 > 1 ? 1 : swap * 2), -118] }; himArmL = { hand: [-6, -118] }; }
  if (bagInLeft) { himArmL = { hand: [-24, -106] }; himArmR = { hand: [40, -150 + 8] }; }
  if (bagInLeft && swap >= 1) himArmR = { hand: [mix(30, 56, kf(T, t.brace, t.brace + 0.3)), -120] };
  const crinkle = (k0: number) => (T > k0 && T < k0 + 0.45 ? Math.abs(Math.sin((T - k0) * 30)) : 0);
  const bagK = Math.max(crinkle(t.offer), crinkle(t.reach), crinkle(t.take), laughing ? Math.abs(Math.sin(T * 14)) * 0.6 : 0, crinkle(t.swap));
  const bag = <g transform="translate(-2,98) scale(0.78)"><BreadBag k={bagK} breads={take ? 1 : 2} /></g>;
  let himExpr: any = T > t.door + 0.2 ? "calm" : "neutral";
  if (follow) himExpr = "calm";
  if (T > V.r1 - 0.1 && T < V.r1 + 4) himExpr = "raise";
  if (T > V.r1 + 4 && T < t.serious) himExpr = "smug";
  if (T > t.serious && T < t.laugh) himExpr = "think";
  if (laughing) himExpr = "laugh";
  if (T > t.walk_a) himExpr = "soft";
  const himLookY = follow && T < V.r1 - 0.1 ? 0.9 : T > t.reach && T < t.chewEnd ? 0.3 : 0;
  const himBob = laughing ? -Math.abs(Math.sin((T - t.laugh) * 10)) * 6 : 0;
  const brace = kf(T, t.brace, t.brace + 0.3);
  const pull = tie > 0 ? 4 + Math.abs(Math.sin((T - t.tie) * 6)) * 5 : 0;
  const herEl = (
    <Bean {...ELLA} T={T + 4} x={her.x} y={her.y} s={1.25} flip bob={herBob}
      expr={herExpr} look={checking ? -1 : 1} headBack={checking} turn={checking ? 1.1 : 0.4} tilt={checking ? 6 : tie > 0 ? -6 : 0}
      lookY={herLookY} open={lip("r2", T)}
      legL={tie > 0 ? 95 * tie : heel > 0.05 ? 28 * heel + Math.sin(T * 14) * 4 * heel : walking ? lg : 0} legR={walking ? -lg : 0}
      shoeOffL={heel} lace={lace} lean={tie > 0 ? -10 * tie : 0}
      armR={herArmR} armL={herArmL}
      holdR={take && !biting && T < t.walk_a - 0.2 ? <Bread x={0} y={-6} s={0.8} r={-20} /> : null} />
  );
  return (
    <g>
      <Bean {...EL} T={T + 2} x={hx} y={HIM_Y} s={1.25} strap="#9b8a63" bob={himBob}
        expr={himExpr} look={1} turn={T > t.touch && T < t.lookHer ? 0 : 0.7} lookY={himLookY} open={lip("r1", T)}
        legL={walking ? -lg : 0} legR={walking ? lg : 0} dipR={(brace * 8 + (tie > 0 ? pull : 0))} tilt={brace * 3}
        armL={himArmL} holdL={bagInLeft ? bag : undefined} armR={himArmR} holdR={!bagInLeft ? bag : undefined} />
      {herEl}
      {/* the bite: bread at her mouth, in front of the face */}
      {biting ? <g transform={`translate(${her.x - 46},${her.y - 238 * 1.25})`}>
        <Bread x={0} y={0} s={1.5} r={-28} />
        {T > t.bite ? <circle cx={38} cy={-18} r={16} fill="#f6e7c8" stroke={OL} strokeWidth={3} /> : null}
      </g> : null}
    </g>
  );
};

/* 4 · The door opens; she hurries out, checks inside, looks at the bag; he follows her eyes and offers it. */
export const ShotVereda: React.FC<ShotP> = ({ T, a, b }) => {
  const door = kf(T, t.door, t.door + 0.7);
  const herOut = T > t.out + 0.45;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage t={T - a} len={b - a} z={[1.18, 1.26]} f={[540, 1330]}>
        <Corner t={T} doorK={door} inside={!herOut ? <People T={T} /> : null} />
        {herOut ? <People T={T} /> : null}
        {!herOut ? <HimOnly T={T} /> : null}
      </Stage>
      <Finish tone="calido" />
    </AbsoluteFill>
  );
};
/* before she is out she is drawn inside the doorway (behind the frame), and he is drawn on top separately */
const HimOnly: React.FC<{ T: number }> = ({ T }) => (
  <Bean {...EL} T={T + 2} x={420} y={HIM_Y} s={1.25} strap="#9b8a63" expr={T > t.door + 0.2 ? "calm" : "neutral"} look={1} turn={0.7}
    lookY={T > t.door + 0.2 ? 0 : 0.5} armR={{ hand: [22, -108] }} holdR={<g transform="translate(-2,98) scale(0.78)"><BreadBag /></g>} />
);

/* 4 · Two-shot for the dialogue; `pan` = closer on her taking the bread. 5 · `pasos` = the walk and the lace. */
export const ShotPareja: React.FC<ShotP & { cam: "dialogo" | "pan" | "dialogo2" | "pasos" }> = ({ T, a, b, cam }) => {
  const Z: Record<string, { z: [number, number]; f: [number, number] }> = {
    dialogo: { z: [1.72, 1.78], f: [540, 1230] },
    pan: { z: [2.25, 2.35], f: [600, 1190] },
    dialogo2: { z: [1.78, 1.86], f: [540, 1230] },
    pasos: { z: [1.45, 1.6], f: [450, 1270] },
  };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage t={T - a} len={b - a} z={Z[cam].z} f={Z[cam].f}>
        <Corner t={T} doorK={1 - kf(T, t.walk_a + 0.4, t.walk_a + 1.4) * 0.0} />
        <People T={T} />
      </Stage>
      <Finish tone="calido" />
    </AbsoluteFill>
  );
};

/* 5 · Her hand on his jacket. The shoulder takes a little of her weight with each pull of the lace. */
export const ShotMano: React.FC<ShotP> = ({ T, a, b }) => {
  const pull = Math.abs(Math.sin((T - t.tie) * 6));
  const sink = 8 + pull * 7;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage t={T - a} len={b - a} z={[1.0, 1.06]} f={[560, 940]}>
        <ShoulderCU T={T} tone="calido" sink={sink} hand={
          <g transform={`translate(600,${905 + pull * 4})`}>
            <path d="M 60,-40 L 560,-420 L 700,-250 L 150,90 Z" fill="#b4553d" stroke={OL} strokeWidth={10} strokeLinejoin="round" />
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${200 + i * 110},${-120 - i * 82} l 20,24 l 20,-24`} stroke="#8f3f2c" strokeWidth={6} fill="none" />)}
            <path d="M 40,-60 L 130,60" stroke="#8f3f2c" strokeWidth={22} />
            <circle cx={0} cy={0} r={112} fill={SKIN.c} stroke={OL} strokeWidth={10} />
            <path d="M -60,40 q 20,26 50,30 M -20,58 q 22,20 52,18" stroke={OL} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.5} />
          </g>} />
        <rect width={1080} height={1920} fill="#ffb562" opacity={0.08} />
      </Stage>
      <Finish tone="calido" />
    </AbsoluteFill>
  );
};
