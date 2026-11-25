import React from "react";
import { AbsoluteFill } from "remotion";
import { Bean, EL, ELLA, OL } from "../rig/Bean";
import { BreadBag, Corner } from "../sets/Corner";
import { Finish, Stage, kf, mix } from "../ui/Frame";

/* Escena 4 · Los veinte minutos. The click of the voice note becomes her door latch. */

/* Close-up on her door from the sidewalk: the key turns inside, the lever drops, a line of warm light. */
export const ShotPestillo: React.FC<{ t: number; len: number }> = ({ t, len }) => {
  const turn = kf(t, 0.0, 0.12);
  const lever = t < 0.1 ? 0 : t < 0.3 ? kf(t, 0.1, 0.18) : 1 - kf(t, 0.45, 0.65);
  const gap = kf(t, 0.5, len);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage t={t} len={len} z={[1.04, 1.0]} f={[540, 960]}>
        <rect width={1080} height={1920} fill="#2f6a69" />
        {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M0,${200 + i * 260} H1080`} stroke="#2a5f5e" strokeWidth={10} />)}
        <rect x={120} y={160} width={700} height={620} fill="none" stroke="#24524f" strokeWidth={14} />
        <rect x={120} y={1120} width={700} height={620} fill="none" stroke="#24524f" strokeWidth={14} />
        {/* door edge with warm light from inside */}
        <rect x={1000 - gap * 40} y={0} width={80 + gap * 40} height={1920} fill="#ffcf86" opacity={0.25 + 0.6 * gap} />
        <rect x={996 - gap * 40} y={0} width={10} height={1920} fill={OL} />
        {/* lock plate */}
        <g transform="translate(700,960)">
          <rect x={-90} y={-240} width={180} height={480} rx={22} fill="#c9c2a6" stroke={OL} strokeWidth={8} />
          <rect x={-90} y={-240} width={60} height={480} rx={22} fill="#fff" opacity={0.18} />
          <circle cx={0} cy={110} r={52} fill="#a59c80" stroke={OL} strokeWidth={7} />
          <g transform={`rotate(${turn * 90},0,110)`}><rect x={-10} y={70} width={20} height={80} rx={6} fill={OL} /></g>
          {/* lever handle */}
          <g transform={`rotate(${lever * 24},0,-110)`}>
            <circle cx={0} cy={-110} r={46} fill="#b5ad92" stroke={OL} strokeWidth={7} />
            <rect x={-280} y={-134} width={290} height={48} rx={24} fill="#d8d1b8" stroke={OL} strokeWidth={7} />
            <rect x={-270} y={-128} width={240} height={12} rx={6} fill="#fff" opacity={0.4} />
          </g>
        </g>
        {/* warm side light from the bakery */}
        <rect width={1080} height={1920} fill="#ffb562" opacity={0.08} />
      </Stage>
      <Finish tone="calido" />
    </AbsoluteFill>
  );
};

/* Wide on the sidewalk. He waits with two breads in a paper bag; the door opens and she hurries out,
   her heel still half out of a sneaker; she checks inside; he raises an eyebrow. */
export const ShotVereda: React.FC<{ t: number; len: number; doorAt: number; outAt: number; backAt: number; browAt: number }> = ({ t, len, doorAt, outAt, backAt, browAt }) => {
  const door = kf(t, doorAt, doorAt + 0.7);
  const step = kf(t, outAt, outAt + 1.0);
  const herX = mix(780, 690, step);
  const hop = t > outAt && t < outAt + 1.6 ? -Math.abs(Math.sin((t - outAt) * 8)) * 10 : 0;
  const heel = t < outAt + 1.55 ? 1 : 1 - kf(t, outAt + 1.55, outAt + 1.85);
  const legL = heel > 0.05 ? 28 * heel + Math.sin(t * 14) * 4 * heel : 0;
  const back = t > backAt && t < backAt + 0.9;
  const sheLook = back ? -1 : 1;
  const raise = t > browAt;
  const herOut = t > outAt + 0.45;
  const crinkle = t > browAt - 0.1 && t < browAt + 0.4 ? Math.abs(Math.sin((t - browAt) * 30)) : 0;
  const her = (
    <Bean {...ELLA} T={t + 4} x={herX} y={1532} s={1.25} flip bob={hop}
      expr={back ? "think" : "smile"} look={sheLook} headBack={back} turn={back ? 1.1 : 0.4} tilt={back ? 6 : 0}
      legL={legL} shoeOffL={heel}
      armR={herOut ? "down" : { hand: [96, -200] }} armL={back ? "hips" : "down"} />
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage t={t} len={len} z={[1.18, 1.26]} f={[540, 1330]}>
        <Corner t={t} doorK={door} inside={!herOut && t > doorAt + 0.35 ? her : null} />
        <Bean {...EL} T={t + 2} x={420} y={1556} s={1.25} strap="#9b8a63"
          expr={raise ? "raise" : t > doorAt + 0.2 ? "calm" : "neutral"} look={1} turn={0.7} lookY={t > doorAt + 0.2 ? 0 : 0.4}
          armL={{ hand: [-10, -110] }} holdL={<g transform="translate(-2,98) scale(0.78)"><BreadBag k={crinkle} /></g>} armR="down" />
        {herOut ? her : null}
      </Stage>
      <Finish tone="calido" />
    </AbsoluteFill>
  );
};
