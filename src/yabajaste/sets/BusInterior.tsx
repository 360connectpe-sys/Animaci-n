import React from "react";
import { OL, shade } from "../rig/Bean";
import { BakerySign } from "./Corner";
import { rnd } from "../ui/Frame";
import { Droplets } from "./Bus";

/* Inside the micro at night, camera facing him: the window band behind him (facades drift right to left),
   the rear door on the right, the seat in front of him in the foreground.
   Window glass x 130..840, y 300..1060. Street speed in px/s; `ride` = metres travelled (s * speed). */
export const GX0 = 130, GX1 = 840, GY0 = 300, GY1 = 1060;
export const SPEED = 170;

const SHOPW = 300;
const SHOP_COLS = ["#5b6b7c", "#7a6a5a", "#6b5b6f", "#4f6a63", "#7b6f52", "#5c5f73"];

/* one storefront of the generic street; i = shop index along the street */
const Shop: React.FC<{ i: number; x: number }> = ({ i, x }) => {
  const c = SHOP_COLS[Math.floor(rnd(i * 3.1) * SHOP_COLS.length)];
  const open = rnd(i * 7.3) > 0.45;
  const lit = ["#ffd38a", "#f4f0e0", "#bfe3ff", "#ffb08a"][Math.floor(rnd(i * 5.7) * 4)];
  return (
    <g transform={`translate(${x},0)`}>
      <rect x={0} y={420} width={SHOPW - 6} height={620} fill={shade(c, 0.62)} stroke={OL} strokeWidth={4} />
      {[0, 1].map((k) => <rect key={k} x={40 + k * 130} y={480} width={80} height={110} fill={rnd(i * 13 + k) > 0.5 ? "#ffd68a" : "#1c2433"} opacity={0.85} stroke={OL} strokeWidth={3} />)}
      {open
        ? <g><rect x={20} y={760} width={SHOPW - 46} height={250} fill={lit} opacity={0.75} stroke={OL} strokeWidth={4} />
            <rect x={20} y={730} width={SHOPW - 46} height={34} fill={shade(c, 1.1)} stroke={OL} strokeWidth={3} /></g>
        : <g><rect x={20} y={730} width={SHOPW - 46} height={280} fill="#59606a" stroke={OL} strokeWidth={4} />
            {Array.from({ length: 9 }).map((_, k) => <path key={k} d={`M20,${760 + k * 28} H${SHOPW - 26}`} stroke="#474d56" strokeWidth={4} />)}</g>}
    </g>
  );
};

const Pole: React.FC<{ x: number; t: number }> = ({ x }) => (
  <g transform={`translate(${x},0)`}>
    <rect x={-9} y={300} width={18} height={760} fill="#2f343c" stroke={OL} strokeWidth={4} />
    <path d="M0,330 Q 40,300 90,320" stroke="#2f343c" strokeWidth={10} fill="none" />
    <ellipse cx={92} cy={330} rx={26} ry={12} fill="#ffcf7a" stroke={OL} strokeWidth={3} />
    <circle cx={92} cy={360} r={120} fill="#ffb24a" opacity={0.10} />
  </g>
);

/* the street behind the glass. bakeryAt = time the bakery sign centre passes x = 470 (null: no bakery) */
export const Street: React.FC<{ t: number; bakeryAt?: number | null; farBakery?: number }> = ({ t, bakeryAt = null, farBakery = 0 }) => {
  const off = t * SPEED;
  const first = Math.floor(off / SHOPW) - 1;
  const bx = bakeryAt === null ? -9999 : 470 + (bakeryAt - t) * SPEED;   // bakery centre on screen
  return (
    <g>
      <defs>
        <linearGradient id="bsky" x1={0} y1={0} x2={0} y2={1}><stop offset={0} stopColor="#0d1324" /><stop offset={1} stopColor="#26304a" /></linearGradient>
        <clipPath id="glass"><rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} rx={24} /></clipPath>
      </defs>
      <g clipPath="url(#glass)">
        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="url(#bsky)" />
        {/* far rooftops, slow parallax */}
        {Array.from({ length: 10 }).map((_, k) => {
          const i = Math.floor(t * SPEED * 0.3 / 160) + k - 1;
          const x = i * 160 - t * SPEED * 0.3 + 60;
          const h = 120 + rnd(i * 2.3) * 160;
          return <rect key={i} x={x} y={430 - h} width={150} height={h + 20} fill="#18203a" />;
        })}
        {farBakery > 0 ? <g opacity={farBakery}><circle cx={GX0 + 40} cy={640} r={60} fill="#ffcf6b" opacity={0.25} /><rect x={GX0 + 10} y={630} width={46} height={12} rx={3} fill="#ffe39a" /></g> : null}
        {Array.from({ length: 6 }).map((_, k) => {
          const i = first + k;
          const x = i * SHOPW - off;
          if (bakeryAt !== null && Math.abs(x + SHOPW / 2 - bx) < SHOPW * 0.9) return null;  // the bakery takes this lot
          return <Shop key={i} i={i} x={x} />;
        })}
        {bakeryAt !== null && bx > -400 && bx < 1300 ? (
          <g transform={`translate(${bx - 220},0)`}>
            <rect x={0} y={420} width={440} height={620} fill="#d9c49a" stroke={OL} strokeWidth={5} />
            <rect x={30} y={760} width={380} height={260} fill="#ffcf86" stroke={OL} strokeWidth={5} />
            {[830, 910, 990].map((y) => <rect key={y} x={40} y={y} width={360} height={8} fill="#8a5a32" />)}
            <path d="M0,700 L440,700 L452,740 L-12,740 Z" fill="#a8452f" stroke={OL} strokeWidth={4} />
            <BakerySign x={220} y={600} s={0.95} t={t} />
            {/* the same green door next to it */}
            <rect x={460} y={700} width={120} height={330} fill="#2f6a69" stroke={OL} strokeWidth={5} />
            <rect x={-140} y={700} width={120} height={330} fill="#4b5560" stroke={OL} strokeWidth={4} />
          </g>) : null}
        {Array.from({ length: 4 }).map((_, k) => {
          const i = Math.floor((off * 1.0) / 520) + k - 1;
          return <Pole key={i} x={i * 520 + 140 - off} t={t} />;
        })}
        {/* wet road and its reflections */}
        <rect x={GX0} y={1010} width={GX1 - GX0} height={60} fill="#1b1f28" />
        {Array.from({ length: 8 }).map((_, k) => {
          const x = ((k * 190 - off * 1.0) % 1520 + 1520) % 1520 - 200;
          return <rect key={k} x={x} y={1016} width={36} height={40} fill={k % 3 ? "#ffcf86" : "#9fc6ff"} opacity={0.18} />;
        })}
        {/* cold glass: tint, droplets, a reflection of the ceiling light */}
        <rect x={GX0} y={GY0} width={GX1 - GX0} height={GY1 - GY0} fill="#6f9bd6" opacity={0.16} />
        <Droplets t={t} x0={GX0} x1={GX1} y0={GY0} y1={GY1} n={60} seed={5} />
        <path d={`M${GX0},${GY0 + 40} L${GX1},${GY0 + 10} L${GX1},${GY0 + 40} L${GX0},${GY0 + 70} Z`} fill="#dff0ff" opacity={0.07} />
      </g>
    </g>
  );
};

/* the bus body around the glass. doorK: rear door opening (0..1), light: street light pouring in (0..1) */
export const BusShell: React.FC<{ t: number; doorK?: number }> = ({ t, doorK = 0 }) => (
  <g>
    <path fillRule="evenodd" d={`M0,0 H1080 V1920 H0 Z M${GX0 + 24},${GY0} H${GX1 - 24} Q${GX1},${GY0} ${GX1},${GY0 + 24} V${GY1 - 24} Q${GX1},${GY1} ${GX1 - 24},${GY1} H${GX0 + 24} Q${GX0},${GY1} ${GX0},${GY1 - 24} V${GY0 + 24} Q${GX0},${GY0} ${GX0 + 24},${GY0} Z`} fill="#2b3442" />
    <rect x={GX0 - 12} y={GY0 - 12} width={GX1 - GX0 + 24} height={GY1 - GY0 + 24} rx={32} fill="none" stroke="#14171c" strokeWidth={20} />
    <rect x={GX0 - 12} y={GY0 - 12} width={GX1 - GX0 + 24} height={GY1 - GY0 + 24} rx={32} fill="none" stroke={OL} strokeWidth={5} />
    <rect x={GX0} y={540} width={GX1 - GX0} height={16} fill="#9aa3ad" stroke={OL} strokeWidth={4} />
    {/* ceiling + light strip + grab rail */}
    <rect x={0} y={0} width={1080} height={200} fill="#1f2631" />
    <rect x={60} y={70} width={960} height={36} rx={12} fill="#cfe4ff" opacity={0.55} stroke={OL} strokeWidth={4} />
    <rect x={-20} y={226} width={1120} height={24} rx={12} fill="#d8b23a" stroke={OL} strokeWidth={5} />
    {[300, 700].map((x) => <rect key={x} x={x - 9} y={190} width={18} height={44} fill="#8f969e" stroke={OL} strokeWidth={4} />)}
    {/* lower wall panel */}
    <rect x={0} y={GY1 + 14} width={880} height={40} fill="#3a4450" stroke={OL} strokeWidth={5} />
    {/* rear door (folding, glass panels) */}
    <g>
      <rect x={880} y={270} width={220} height={1300} fill="#161a20" stroke={OL} strokeWidth={6} />
      <rect x={880} y={270} width={220} height={1300} fill="#ffe2b0" opacity={doorK * 0.85} />
      {[0, 1].map((k) => {
        const w = 104 * (1 - 0.82 * doorK);
        const x = k === 0 ? 886 : 1094 - w;
        return (<g key={k}>
          <rect x={x} y={276} width={w} height={1288} fill="#3a4553" stroke={OL} strokeWidth={5} />
          <rect x={x + w * 0.15} y={320} width={w * 0.7} height={560} fill="#6f9bd6" opacity={0.25} stroke={OL} strokeWidth={3} />
          <rect x={x + w * 0.15} y={920} width={w * 0.7} height={560} fill="#6f9bd6" opacity={0.2} stroke={OL} strokeWidth={3} />
        </g>);
      })}
      <rect x={862} y={260} width={20} height={1320} fill="#d8b23a" stroke={OL} strokeWidth={4} />
    </g>
    {/* floor in the aisle */}
    <rect x={700} y={1560} width={400} height={400} fill="#3c4048" />
    {Array.from({ length: 8 }).map((_, k) => <path key={k} d={`M700,${1580 + k * 40} H1080`} stroke="#33363d" strokeWidth={6} />)}
  </g>
);

/* his seat behind him and the seat back in front of him (foreground) */
export const SeatBack: React.FC = () => (
  <g>
    <rect x={250} y={860} width={440} height={520} rx={60} fill="#2a3b63" stroke={OL} strokeWidth={6} />
    <rect x={270} y={880} width={400} height={60} rx={30} fill="#33477a" />
  </g>
);
export const SeatFront: React.FC = () => (
  <g>
    <path d="M -40,1330 Q -40,1270 30,1270 L 690,1270 Q 760,1270 760,1330 L 760,1960 L -40,1960 Z" fill="#26365c" stroke={OL} strokeWidth={7} />
    {Array.from({ length: 12 }).map((_, k) => <path key={k} d={`M${k * 66 - 10},1300 L${k * 66 - 40},1960`} stroke="#2e4272" strokeWidth={6} />)}
    <rect x={180} y={1240} width={400} height={30} rx={15} fill="#c9ced6" stroke={OL} strokeWidth={5} />
    <path d="M 0,1290 H 740" stroke="#fff" strokeOpacity={0.12} strokeWidth={6} />
  </g>
);

/* canvas backpack on his lap */
export const Backpack: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-120,0 Q-125,-150 -90,-170 L90,-170 Q125,-150 120,0 Z" fill="#9b8a63" stroke={OL} strokeWidth={6} />
    <path d="M-100,-120 Q0,-150 100,-120 L100,-60 Q0,-80 -100,-60 Z" fill="#8a7a56" stroke={OL} strokeWidth={4} />
    <rect x={-20} y={-104} width={40} height={22} rx={5} fill="#c9b27a" stroke={OL} strokeWidth={3} />
    <path d="M-80,-165 Q-60,-215 -20,-215 L20,-215 Q60,-215 80,-165" fill="none" stroke={OL} strokeWidth={12} />
    <path d="M-80,-165 Q-60,-215 -20,-215 L20,-215 Q60,-215 80,-165" fill="none" stroke="#6f6243" strokeWidth={6} />
    <path d="M-110,-30 H110" stroke="#000" strokeOpacity={0.12} strokeWidth={10} />
  </g>
);

/* a phone in his hand (small, in the wide shots); glow = screen light */
export const SmallPhone: React.FC<{ glow?: number; rot?: number }> = ({ glow = 1, rot = 0 }) => (
  <g transform={`rotate(${rot})`}>
    <circle cx={0} cy={-40} r={90} fill="#cfe8ff" opacity={0.12 * glow} />
    <rect x={-24} y={-70} width={48} height={92} rx={9} fill="#17191f" stroke={OL} strokeWidth={4} />
    <rect x={-18} y={-63} width={36} height={76} rx={5} fill="#2c4f57" opacity={0.4 + 0.6 * glow} />
  </g>
);
