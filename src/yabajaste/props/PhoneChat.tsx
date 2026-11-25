import React from "react";
import { OL } from "../rig/Bean";
import { FONT } from "../fonts";

/* Phone seen over his shoulder: an old chat in search mode. Drawn in phone units (screen 640 x 1300, origin at
   the screen's top-left). Generic messenger look, no brand. Matches of the search term are highlighted. */

export type ChatItem =
  | { kind: "date"; text: string }
  | { kind: "me"; text: string; time: string; match?: boolean }
  | { kind: "note"; dur: string; time: string };

export const SCREEN_W = 640, SCREEN_H = 1300;
const BG = "#0e1a20", ME = "#1d5a4c", HER = "#24313a", TXT = "#eef3f1", SUB = "#8fa3a8", HIT = "#f4c84a";

const Hi: React.FC<{ text: string; term: string; on: boolean }> = ({ text, term, on }) => {
  if (!on || !term) return <>{text}</>;
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (<>{text.slice(0, i)}<tspan fill={HIT} textDecoration="underline" style={{ fontWeight: 700 }}>{text.slice(i, i + term.length)}</tspan>{text.slice(i + term.length)}</>);
};

export const Wave: React.FC<{ x: number; y: number; w: number; progress: number }> = ({ x, y, w, progress }) => {
  const n = 28;
  return (<g>{Array.from({ length: n }).map((_, i) => {
    const h = 10 + Math.abs(Math.sin(i * 1.7) * 26 + Math.sin(i * 0.6) * 14);
    const on = i / n < progress;
    return <rect key={i} x={x + (i * w) / n} y={y - h / 2} width={w / n - 5} height={h} rx={3} fill={on ? "#7fd6b8" : "#6b7d84"} />;
  })}</g>);
};

/* term: what is typed in the search field; items: the visible messages from the top; scroll in px;
   noteIdx: index of the voice note that plays; playK: 0..1 progress (-1 = not started); pressK: 0..1 press flash */
export const PhoneChat: React.FC<{
  term: string; caret?: boolean; count?: string; items: ChatItem[]; scroll?: number;
  playK?: number; pressK?: number; matchesShown?: number;
}> = ({ term, caret, count, items, scroll = 0, playK = -1, pressK = 0, matchesShown = 99 }) => {
  let y = 210 - scroll;
  let m = 0;
  const rows: React.ReactNode[] = [];
  items.forEach((it, i) => {
    if (it.kind === "date") {
      const w = it.text.length * 15 + 40;
      rows.push(<g key={i}><rect x={SCREEN_W / 2 - w / 2} y={y} width={w} height={46} rx={14} fill="#1d2a31" />
        <text x={SCREEN_W / 2} y={y + 31} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={22} fill={SUB} style={{ letterSpacing: 1.5 }}>{it.text}</text></g>);
      y += 78;
    } else if (it.kind === "me") {
      const shown = !it.match || m < matchesShown;
      if (it.match) m++;
      const w = Math.max(250, it.text.length * 20 + 150);
      const x = SCREEN_W - 28 - w;
      rows.push(<g key={i}>
        <rect x={x} y={y} width={w} height={96} rx={26} fill={ME} />
        <text x={x + 28} y={y + 50} fontFamily={FONT} fontWeight={500} fontSize={36} fill={TXT}><Hi text={it.text} term={term} on={!!it.match && shown} /></text>
        <text x={x + w - 24} y={y + 82} textAnchor="end" fontFamily={FONT} fontWeight={500} fontSize={20} fill="#a9cfc2">{it.time}  ✓✓</text>
      </g>);
      y += 124;
    } else {
      const x = 28, w = 470, k = Math.max(0, playK);
      rows.push(<g key={i}>
        <rect x={x} y={y} width={w} height={118} rx={26} fill={HER} />
        <circle cx={x + 66} cy={y + 56} r={38 + pressK * 6} fill={pressK > 0 ? "#3d8f78" : "#2f6f5e"} />
        {playK >= 0 && playK < 1
          ? <g fill="#fff"><rect x={x + 52} y={y + 38} width={10} height={36} rx={3} /><rect x={x + 70} y={y + 38} width={10} height={36} rx={3} /></g>
          : <path d={`M${x + 54},${y + 34} L${x + 86},${y + 56} L${x + 54},${y + 78} Z`} fill="#fff" />}
        <Wave x={x + 124} y={y + 52} w={300} progress={k} />
        <circle cx={x + 124 + 300 * k} cy={y + 52} r={11} fill="#7fd6b8" />
        <text x={x + 124} y={y + 102} fontFamily={FONT} fontWeight={500} fontSize={22} fill={SUB}>{it.dur}</text>
        <text x={x + w - 24} y={y + 102} textAnchor="end" fontFamily={FONT} fontWeight={500} fontSize={20} fill={SUB}>{it.time}</text>
      </g>);
      y += 150;
    }
  });
  return (
    <g>
      <clipPath id="screenclip"><rect x={0} y={0} width={SCREEN_W} height={SCREEN_H} rx={40} /></clipPath>
      <g clipPath="url(#screenclip)">
        <rect width={SCREEN_W} height={SCREEN_H} fill={BG} />
        {/* faint pattern so the wallpaper reads as a chat */}
        {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={(i * 137) % SCREEN_W} cy={(i * 251) % SCREEN_H} r={3} fill="#fff" opacity={0.035} />)}
        {rows}
        {/* search header */}
        <rect width={SCREEN_W} height={190} fill="#15242b" />
        <text x={40} y={58} fontFamily={FONT} fontWeight={600} fontSize={26} fill={TXT}>22:47</text>
        <rect x={SCREEN_W - 90} y={36} width={46} height={24} rx={5} fill="none" stroke={TXT} strokeWidth={3} />
        <rect x={SCREEN_W - 87} y={39} width={26} height={18} rx={2} fill={TXT} />
        <path d="M44,132 L28,118 L44,104" stroke={TXT} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x={74} y={92} width={SCREEN_W - 104} height={64} rx={32} fill="#24363f" />
        <circle cx={110} cy={122} r={13} stroke={SUB} strokeWidth={4} fill="none" /><path d="M119,131 L130,142" stroke={SUB} strokeWidth={4} strokeLinecap="round" />
        <text x={146} y={135} fontFamily={FONT} fontWeight={600} fontSize={34} fill={TXT}>{term}{caret ? "|" : ""}</text>
        {count ? <text x={SCREEN_W - 46} y={133} textAnchor="end" fontFamily={FONT} fontWeight={500} fontSize={24} fill={SUB}>{count}</text> : null}
      </g>
    </g>
  );
};

/* the handset around the screen; children = screen contents in screen units */
export const Handset: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g>
    <rect x={-34} y={-34} width={SCREEN_W + 68} height={SCREEN_H + 68} rx={70} fill="#17191f" stroke={OL} strokeWidth={8} />
    <rect x={-22} y={-22} width={SCREEN_W + 44} height={SCREEN_H + 44} rx={60} fill="none" stroke="#3a3f4a" strokeWidth={4} />
    {children}
    {/* cold glass sheen from the bus lights */}
    <path d={`M 0,0 L ${SCREEN_W * 0.55},0 L ${SCREEN_W * 0.2},${SCREEN_H} L 0,${SCREEN_H} Z`} fill="#bfe3ff" opacity={0.045} />
  </g>
);
