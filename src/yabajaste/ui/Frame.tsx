import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "../fonts";

export const W = 1080, H = 1920;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const easeIO = (k: number) => { const x = clamp01(k); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
export const easeOut = (k: number) => 1 - Math.pow(1 - clamp01(k), 3);
/** 0..1 between a and b seconds, eased */
export const kf = (t: number, a: number, b: number, ease = easeIO) => ease((t - a) / Math.max(0.001, b - a));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/* A vertical stage: one SVG in 1080x1920 units with a slow camera (zoom z0->z1 around a focal point). */
export const Stage: React.FC<{ t: number; len: number; z?: [number, number]; f?: [number, number]; children: React.ReactNode; shake?: number }> = ({ t, len, z = [1, 1], f = [540, 960], children, shake = 0 }) => {
  const k = easeIO(t / Math.max(0.5, len));
  const zoom = z[0] + (z[1] - z[0]) * k;
  const sy = shake ? Math.sin(t * 60) * shake : 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      <g transform={`translate(${f[0]},${f[1] + sy}) scale(${zoom}) translate(${-f[0]},${-f[1]})`}>{children}</g>
    </svg>
  );
};

/* Finish shared by every shot (from the plugin player): soft vignette plus light film grain.
   tone: "frio" = present, cold glass reflections; "calido" = memory, warm side light from the bakery. */
export const Finish: React.FC<{ tone: "frio" | "calido" | "none" }> = ({ tone }) => {
  const f = useCurrentFrame();
  return (<>
    {tone === "frio" ? <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(70,110,170,0.10), rgba(20,40,90,0.16))", mixBlendMode: "multiply" }} /> : null}
    {tone === "calido" ? <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(255,176,90,0.20) 0%, rgba(255,176,90,0.06) 55%, rgba(40,50,90,0.14) 100%)", mixBlendMode: "soft-light" }} /> : null}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)" }} />
    <Img src={staticFile(`yabajaste/fx/grain${Math.floor(f / 2) % 6}.png`)} style={{ position: "absolute", width: W, height: H, opacity: 0.06, mixBlendMode: "overlay", objectFit: "cover" }} />
  </>);
};

/* Short subtitles, one or two lines, legible on a phone. Her lines carry a warm tint so voices stay distinct. */
export const Subtitle: React.FC<{ text: string; who: "el" | "ella"; y?: number; k?: number }> = ({ text, who, y = 1640, k = 1 }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top: y, display: "flex", justifyContent: "center", opacity: k }}>
    <div style={{
      fontFamily: FONT, fontWeight: 600, fontSize: 58, lineHeight: 1.18, textAlign: "center",
      color: who === "ella" ? "#ffd9c7" : "#ffffff", fontStyle: who === "ella" ? "italic" : "normal",
      background: "rgba(10,12,20,0.58)", padding: "14px 30px 18px", borderRadius: 26, maxWidth: 900,
      textShadow: "0 3px 0 rgba(0,0,0,0.35)", whiteSpace: "pre-line",
    }}>{text}</div>
  </div>
);
