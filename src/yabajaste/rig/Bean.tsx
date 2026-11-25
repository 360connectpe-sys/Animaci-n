import React from "react";

/* Bean stick figure rig, adapted from the Stick-Story-Animation plugin (Lumenstick Studio, MIT; see
   tools/yabajaste/LICENSE-stick-story). Same look: big round head, dot eyes under lids, tapered bean torso
   with the outfit drawn on, thin stick limbs, one dark outline OL, flat colour plus one shade.
   Local units: feet at (0,0), ~400 units tall, head centre (0,-290) r 88.
   Added for «¿Ya bajaste?»: casaca / chompa outfits, backpack strap, sneakers, hand targets (two-bone IK),
   head turn and tilt, one-brow raise, nose-laugh puff, shoulder dip, per-leg angles. */

export const OL = "#2b2522";
export const SKIN = { a: "#f2c9a0", b: "#e8b48a", c: "#c98d5e", d: "#8d5a3b", e: "#f6d7b8" } as const;
export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

export type Expr = "calm" | "neutral" | "listen" | "smile" | "happy" | "snort" | "raise" | "shock" | "worried" | "think" | "smug" | "soft" | "laugh" | "chew";
export type ArmName = "down" | "hips" | "point" | "wave" | "up" | "hold" | "shrug" | "chin" | "phone" | "reach";
/** an arm is a named pose, or a hand target in body space (x right, y up negative) */
export type Arm = ArmName | { hand: [number, number]; bend?: 1 | -1 };

export type BeanProps = {
  T: number;
  x: number; y: number; s?: number;
  skin?: string; hair?: string; hairColor?: string; outfit?: string; color?: string;
  expr?: Expr; look?: number; lookY?: number; turn?: number; tilt?: number;
  armL?: Arm; armR?: Arm;
  legL?: number; legR?: number;          // leg angles in degrees, positive = foot outward/back
  shoes?: string; shoeOffL?: number;      // shoe colour; heel half out of the left shoe (0..1)
  flip?: boolean; seed?: number; holdR?: React.ReactNode; holdL?: React.ReactNode;
  strap?: string;                         // backpack strap colour over the right shoulder
  dipR?: number;                          // right shoulder pushed down (units)
  puff?: number;                          // nose-laugh puff 0..1
  blush?: boolean; noLegs?: boolean; noShadow?: boolean; breath?: number; bob?: number;
  open?: number;                          // mouth open level for lines (0..2)
  headBack?: boolean;                     // head turned the other way (looks behind), body stays
};

const POSE: Record<ArmName, [number, number]> = {
  down: [10, 4], hips: [62, -48], point: [98, 92], wave: [108, 150], up: [118, 148],
  hold: [22, -72], shrug: [55, 125], chin: [18, -160], phone: [12, -128], reach: [80, 80],
};
const U = 60, L = 56;
const rad = (a: number) => (a * Math.PI) / 180;

const Limb: React.FC<{ side: 1 | -1; pose: Arm; T: number; skin: string; seed: number; w: number; dip?: number; children?: React.ReactNode }> = ({ side, pose, T, skin, seed, w, dip = 0, children }) => {
  const sx = side * 40, sy = -192 + dip;
  let ex: number, ey: number, hx: number, hy: number;
  if (typeof pose === "string") {
    let [u, l] = POSE[pose];
    if (pose === "wave") l += Math.sin(T * 9 + seed) * 22;
    if (pose === "down" || pose === "hips") u += Math.sin(T * 1.6 + seed) * 2;
    ex = sx + side * U * Math.sin(rad(u)); ey = sy + U * Math.cos(rad(u));
    hx = ex + side * L * Math.sin(rad(l)); hy = ey + L * Math.cos(rad(l));
  } else {
    // two-bone IK toward the hand target; the elbow bends outward (bend=1) or inward
    const [tx, ty] = pose.hand;
    let dx = tx - sx, dy = ty - sy;
    let d = Math.hypot(dx, dy);
    const maxD = U + L - 2;
    if (d > maxD) { dx *= maxD / d; dy *= maxD / d; d = maxD; }
    const a = Math.atan2(dy, dx);
    const c = Math.max(-1, Math.min(1, (U * U + d * d - L * L) / (2 * U * d)));
    const b = Math.acos(c) * side * (pose.bend ?? 1);
    ex = sx + U * Math.cos(a + b); ey = sy + U * Math.sin(a + b);
    hx = sx + dx; hy = sy + dy;
  }
  return (
    <g>
      <path d={`M${sx},${sy} Q${ex},${ey} ${hx},${hy}`} stroke={OL} strokeWidth={w} fill="none" strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={11} fill={skin} stroke={OL} strokeWidth={4} />
      {children ? <g transform={`translate(${hx},${hy})`}>{children}</g> : null}
    </g>
  );
};

const BODY = "M -40,-218 C -52,-170 -64,-120 -62,-92 C -60,-62 -36,-52 0,-52 C 36,-52 60,-62 62,-92 C 64,-120 52,-170 40,-218 Z";

const Outfit: React.FC<{ kind: string; color: string; id: string; strap?: string }> = ({ kind, color, id, strap }) => {
  const sh = <ellipse cx={48} cy={-110} rx={34} ry={90} fill="#000" opacity={0.16} clipPath={`url(#b${id})`} />;
  const hl = <path d="M -30,-200 C -42,-160 -48,-120 -46,-95" stroke="#fff" strokeOpacity={0.22} strokeWidth={6} fill="none" strokeLinecap="round" />;
  let inner: React.ReactNode = null;
  if (kind === "casaca") {
    // zip-up jacket: stand collar, zipper, two slanted pockets, cuffs drawn by the arm ends
    inner = (<>
      <path d="M -30,-220 L -22,-198 L 0,-206 L 22,-198 L 30,-220" fill={shade(color, 0.82)} stroke={OL} strokeWidth={3.5} strokeLinejoin="round" />
      <path d="M 0,-205 L 0,-54" stroke={OL} strokeWidth={3} />
      <path d="M 0,-205 L 0,-54" stroke="#c9ced6" strokeWidth={1.6} strokeDasharray="3 4" />
      <rect x={-4} y={-176} width={8} height={12} rx={2} fill="#c9ced6" stroke={OL} strokeWidth={2} />
      <path d="M -44,-118 L -22,-108 M 44,-118 L 22,-108" stroke={OL} strokeWidth={3} strokeLinecap="round" />
      <path d="M -60,-74 C -30,-64 30,-64 60,-74" stroke={shade(color, 0.7)} strokeWidth={8} fill="none" />
    </>);
  } else if (kind === "chompa") {
    // knitted sweater: ribbed crew neck and hem, a few knit marks
    inner = (<>
      <path d="M -26,-219 C -16,-198 16,-198 26,-219" fill="none" stroke={shade(color, 0.75)} strokeWidth={10} />
      <path d="M -26,-219 C -16,-198 16,-198 26,-219" fill="none" stroke={OL} strokeWidth={3} />
      <path d="M -60,-72 C -30,-60 30,-60 60,-72" stroke={shade(color, 0.75)} strokeWidth={12} fill="none" />
      {[-34, -14, 6, 26].map((x, i) => <path key={i} d={`M ${x},-170 l 5,7 l 5,-7 M ${x + 6},-130 l 5,7 l 5,-7`} stroke={shade(color, 0.78)} strokeWidth={2.5} fill="none" strokeLinecap="round" />)}
    </>);
  } else {
    inner = <path d="M -24,-217 C -14,-202 14,-202 24,-217" stroke={OL} strokeWidth={3.5} fill="none" />;
  }
  return (
    <g>
      <clipPath id={`b${id}`}><path d={BODY} /></clipPath>
      <path d={BODY} fill={color} />
      <g clipPath={`url(#b${id})`}>{inner}{sh}{hl}</g>
      <path d={BODY} fill="none" stroke={OL} strokeWidth={5} />
      {strap ? (<g>
        <path d="M 20,-222 C 36,-196 44,-150 42,-108" stroke={OL} strokeWidth={19} fill="none" strokeLinecap="round" />
        <path d="M 20,-222 C 36,-196 44,-150 42,-108" stroke={strap} strokeWidth={13} fill="none" strokeLinecap="round" />
        <path d="M 26,-206 C 37,-186 42,-160 41,-130" stroke="#000" strokeOpacity={0.18} strokeWidth={3} strokeDasharray="5 6" fill="none" />
      </g>) : null}
    </g>
  );
};

const HairBack: React.FC<{ kind: string; c: string }> = ({ kind, c }) => {
  if (kind === "long") return <path d="M -96,-196 C -114,-350 -60,-398 0,-398 C 60,-398 114,-350 96,-196 C 80,-178 50,-190 40,-210 L -40,-210 C -50,-190 -80,-178 -96,-196 Z" fill={c} stroke={OL} strokeWidth={5} />;
  if (kind === "pony") return (<g>
    <path d="M 70,-350 C 130,-340 150,-270 128,-205 C 116,-180 98,-196 104,-220 C 116,-262 108,-312 66,-330 Z" fill={c} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
  </g>);
  return null;
};

const HairFront: React.FC<{ kind: string; c: string }> = ({ kind, c }) => {
  const st = { stroke: OL, strokeWidth: 5, strokeLinejoin: "round" as const };
  const lines = { stroke: shade(c, 0.72), strokeWidth: 3.5, fill: "none", strokeLinecap: "round" as const };
  switch (kind) {
    case "side":
      return (<g><path d="M -90,-282 C -98,-366 -46,-392 4,-392 C 56,-392 98,-364 90,-282 C 84,-316 60,-334 30,-338 C 10,-322 -30,-316 -60,-318 C -78,-310 -86,-298 -90,-282 Z" fill={c} {...st} />
        <path d="M 28,-338 C 10,-362 -20,-372 -50,-364" {...lines} /></g>);
    case "long": case "pony":
      return (<g><path d="M -92,-268 C -96,-360 -40,-394 6,-392 C 60,-390 98,-350 92,-268 C 84,-300 70,-318 48,-326 C 20,-312 -20,-300 -56,-306 C -76,-298 -88,-286 -92,-268 Z" fill={c} {...st} />
        <path d="M 40,-372 C 10,-360 -30,-344 -60,-318" {...lines} />
        {kind === "pony" ? <rect x={62} y={-352} width={16} height={22} rx={5} fill="#d8c25a" stroke={OL} strokeWidth={3} transform="rotate(28,70,-341)" /> : null}
      </g>);
    case "short": default:
      return <path d="M -90,-284 C -96,-366 -46,-390 0,-390 C 50,-390 96,-366 90,-284 C 82,-318 52,-334 4,-334 C -46,-334 -80,-318 -90,-284 Z" fill={c} {...st} />;
  }
};

const EX = 27, EY = -290;
const Eyes: React.FC<{ e: Expr; look: number; lookY: number; blink: boolean; skin: string }> = ({ e, look, lookY, blink, skin }) => {
  const lx = look * 6, ly = lookY * 4;
  return (<g>{[-1, 1].map((sd) => {
    const x = sd * EX;
    if (blink) return <path key={sd} d={`M${x - 11},${EY + 1} L${x + 11},${EY + 1}`} stroke={OL} strokeWidth={4.5} strokeLinecap="round" />;
    if (e === "happy" || e === "snort" || e === "laugh") return <path key={sd} d={`M${x - 12},${EY + 4} Q${x},${EY - 12} ${x + 12},${EY + 4}`} stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round" />;
    if (e === "shock") return (<g key={sd}>
      <circle cx={x} cy={EY - 2} r={18} fill="#fff" stroke={OL} strokeWidth={4} />
      <circle cx={x + lx * 0.6} cy={EY - 1 + ly} r={6.5} fill={OL} /></g>);
    if (e === "raise" && sd === 1) return <circle key={sd} cx={x + lx} cy={EY - 1 + ly} r={8} fill={OL} />;
    if (e === "calm" || e === "smile" || e === "smug" || e === "listen" || e === "raise" || e === "soft" || e === "chew") {
      const lid = e === "listen" || e === "soft" ? 16 : 12;
      return (<g key={sd}>
        <circle cx={x + lx} cy={EY + 2 + ly} r={7.5} fill={OL} />
        <rect x={x - 14} y={EY - 14} width={28} height={lid} fill={skin} />
        <path d={`M${x - 12},${EY - 14 + lid} Q${x},${EY - 17 + lid} ${x + 12},${EY - 14 + lid}`} stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" /></g>);
    }
    return <circle key={sd} cx={x + lx} cy={EY + ly} r={7.5} fill={OL} />;
  })}</g>);
};

const Brows: React.FC<{ e: Expr }> = ({ e }) => {
  const p = (d: string, k: number) => <path key={k} d={d} stroke={OL} strokeWidth={6} strokeLinecap="round" fill="none" />;
  const by = EY - 30;
  switch (e) {
    case "shock": return <g>{p(`M-40,${by - 14} Q-27,${by - 24} -14,${by - 14}`, 1)}{p(`M14,${by - 14} Q27,${by - 24} 40,${by - 14}`, 2)}</g>;
    case "worried": return <g>{p(`M-42,${by - 2} L-14,${by - 12}`, 1)}{p(`M14,${by - 12} L42,${by - 2}`, 2)}</g>;
    case "raise": return <g>{p(`M-40,${by + 2} L-16,${by + 2}`, 1)}{p(`M14,${by - 14} Q28,${by - 28} 42,${by - 14}`, 2)}</g>;
    case "think": case "smug": return <g>{p(`M-40,${by} L-16,${by}`, 1)}{p(`M14,${by - 6} Q28,${by - 18} 42,${by - 8}`, 2)}</g>;
    case "neutral": case "listen": return <g>{p(`M-38,${by} L-18,${by - 2}`, 1)}{p(`M18,${by - 2} L38,${by}`, 2)}</g>;
    case "soft": case "snort": case "laugh": return <g>{p(`M-38,${by - 4} Q-28,${by - 10} -18,${by - 6}`, 1)}{p(`M18,${by - 6} Q28,${by - 10} 38,${by - 4}`, 2)}</g>;
    default: return null;
  }
};

const MY = -248;
const Mouth: React.FC<{ e: Expr; open: number; T: number }> = ({ e, open, T }) => {
  const red = "#7a2228";
  if (open > 0 && e !== "happy" && e !== "laugh") return <ellipse cx={0} cy={MY} rx={open > 1 ? 11 : 8} ry={open > 1 ? 10 : 5.5} fill={red} stroke={OL} strokeWidth={3} />;
  switch (e) {
    case "happy": case "laugh": return (<g><path d={`M-24,${MY - 6} Q0,${MY + 30} 24,${MY - 6} Z`} fill={red} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M-20,${MY - 4} L20,${MY - 4} L18,${MY + 2} L-18,${MY + 2} Z`} fill="#fff" /></g>);
    case "smile": case "snort": return <path d={`M-18,${MY - 5} Q0,${MY + 12} 18,${MY - 5}`} stroke={OL} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    case "soft": return <path d={`M-12,${MY - 2} Q0,${MY + 5} 12,${MY - 2}`} stroke={OL} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    case "smug": case "raise": return <path d={`M-14,${MY + 1} Q4,${MY + 5} 16,${MY - 6}`} stroke={OL} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    case "shock": return <ellipse cx={0} cy={MY + 2} rx={10} ry={13} fill={red} stroke={OL} strokeWidth={3.5} />;
    case "worried": return <path d={`M-16,${MY + 2} Q-8,${MY - 5} 0,${MY + 2} Q8,${MY + 9} 16,${MY + 2}`} stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />;
    case "think": return <path d={`M-6,${MY + 2} L14,${MY - 2}`} stroke={OL} strokeWidth={4.5} strokeLinecap="round" />;
    case "chew": { const k = Math.abs(Math.sin(T * 9)); return <ellipse cx={0} cy={MY} rx={12 - k * 3} ry={3 + k * 4} fill={red} stroke={OL} strokeWidth={3} />; }
    default: return <path d={`M-9,${MY} L9,${MY}`} stroke={OL} strokeWidth={4.5} strokeLinecap="round" />;
  }
};

const Shoe: React.FC<{ x: number; y: number; dir: 1 | -1; c: string; off?: number }> = ({ x, y, dir, c, off = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${off * -16 * dir})`}>
    <path d={`M ${-10 * dir},-12 C ${-14 * dir},2 ${-12 * dir},6 0,6 L ${30 * dir},6 C ${38 * dir},6 ${38 * dir},-6 ${28 * dir},-10 C ${18 * dir},-14 ${8 * dir},-18 ${-10 * dir},-12 Z`} fill={c} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d={`M ${-12 * dir},2 L ${32 * dir},2`} stroke={shade(c, 0.78)} strokeWidth={4} />
  </g>
);

export const Bean: React.FC<BeanProps> = (p) => {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const { T } = p;
  const seed = p.seed ?? 1;
  const skin = p.skin ?? SKIN.a, hairC = p.hairColor ?? "#2a211c", outfit = p.outfit ?? "tee", color = p.color ?? "#4f7cac";
  const expr = p.expr ?? "calm";
  const breathe = 1 + Math.sin(T * 2.1 + seed) * (p.breath ?? 0.008);
  const open = p.open ?? 0;
  const headTilt = Math.sin(T * 1.3 + seed * 2) * 1.5 + (open ? Math.sin(T * 7) * 2 : 0) + (p.tilt ?? 0);
  const cyc = 3.4 + (seed % 5) * 0.37;
  const blink = ((T + seed * 0.71) % cyc) < 0.12;
  const look = p.look ?? 0, lookY = p.lookY ?? 0;
  const s = p.s ?? 1;
  const flip = p.flip ? -1 : 1;
  const armW = 7;
  const fx = (p.turn ?? look * 0.6) * 16;
  const dip = p.dipR ?? 0;
  const puff = p.puff ?? 0;
  return (
    <g transform={`translate(${p.x},${p.y + (p.bob ?? 0)}) scale(${s * flip},${s})`}>
      {p.noShadow ? null : <ellipse cx={0} cy={2} rx={58} ry={9} fill="#000" opacity={0.2} />}
      {p.noLegs ? null : [-1, 1].map((sd) => {
        const ang = sd === -1 ? (p.legL ?? 0) : (p.legR ?? 0);
        const a = rad(ang) * sd;
        const hx = sd * 15, fx2 = hx + Math.sin(a) * 62, fy = -60 + Math.cos(a) * 62;
        return <g key={sd}><path d={`M${hx},-62 L${fx2},${fy}`} stroke={OL} strokeWidth={armW} strokeLinecap="round" />
          {p.shoes ? <Shoe x={fx2} y={fy} dir={sd === -1 ? -1 : 1} c={p.shoes} off={sd === -1 ? p.shoeOffL : 0} />
            : <path d={`M${fx2},${fy} L${fx2 + sd * 10},${fy}`} stroke={OL} strokeWidth={armW} strokeLinecap="round" />}</g>;
      })}
      <g transform={`scale(1,${breathe})`} style={{ transformOrigin: "0px -55px" }}>
        <Outfit kind={outfit} color={color} id={uid} strap={p.strap} />
        <Limb side={-1} pose={p.armL ?? "down"} T={T} skin={skin} seed={seed} w={armW}>{p.holdL}</Limb>
        <Limb side={1} pose={p.armR ?? "down"} T={T} skin={skin} seed={seed + 1} w={armW} dip={dip}>{p.holdR}</Limb>
        <g transform={`rotate(${headTilt},0,-215)${p.headBack ? " scale(-1,1)" : ""}`}>
          <HairBack kind={p.hair ?? "short"} c={hairC} />
          <clipPath id={`h${uid}`}><circle cx={0} cy={-290} r={88} /></clipPath>
          <circle cx={0} cy={-290} r={88} fill={shade(skin, 0.86)} />
          <circle cx={-16 + fx * 0.4} cy={-300} r={86} fill={skin} clipPath={`url(#h${uid})`} />
          <ellipse cx={-40} cy={-330} rx={18} ry={10} fill="#fff" opacity={0.25} transform="rotate(-30,-40,-330)" />
          <circle cx={0} cy={-290} r={88} fill="none" stroke={OL} strokeWidth={5} />
          <g transform={`translate(${fx},0)`}>
            {p.blush || expr === "happy" || expr === "snort" || expr === "laugh" ? <g opacity={0.32}><ellipse cx={-50} cy={-262} rx={14} ry={7} fill="#e8646b" /><ellipse cx={50} cy={-262} rx={14} ry={7} fill="#e8646b" /></g> : null}
            <Eyes e={expr} look={look} lookY={lookY} blink={blink && expr !== "happy" && expr !== "snort" && expr !== "laugh"} skin={skin} />
            <Brows e={expr} />
            <Mouth e={expr} open={open} T={T} />
            {puff > 0 ? <g opacity={Math.sin(Math.min(1, puff) * Math.PI)} stroke={OL} strokeWidth={3.5} strokeLinecap="round" fill="none">
              <path d={`M -14,${-266 - puff * 4} q -10,-4 -${16 + puff * 10},2`} />
              <path d={`M 14,${-266 - puff * 4} q 10,-4 ${16 + puff * 10},2`} />
            </g> : null}
          </g>
          <HairFront kind={p.hair ?? "short"} c={hairC} />
        </g>
      </g>
    </g>
  );
};

/* Cast for «¿Ya bajaste?»: he wears a blue-grey zip jacket and a canvas backpack; she wears a brick sweater
   and light sneakers. Same hair, scale and stroke in every shot. */
export const EL: Partial<BeanProps> = { hair: "side", hairColor: "#231b17", outfit: "casaca", color: "#62748a", skin: SKIN.b, seed: 3, shoes: "#3a3d45" };
export const ELLA: Partial<BeanProps> = { hair: "pony", hairColor: "#3a2419", outfit: "chompa", color: "#b4553d", skin: SKIN.c, seed: 7, shoes: "#efe9dc" };
export const LONA = "#9b8a63";
