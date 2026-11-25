import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import P from "../prueba.json";
import NOTA from "../nota.json";
import { loadFonts } from "../fonts";
import { Subtitle, kf } from "../ui/Frame";
import { ShotReflejo, ShotTap } from "./Escena3";
import { ShotPestillo, ShotVereda } from "./Escena4";

loadFonts();

/* Each shot reads its own local time in seconds. */
const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
const Tap = () => { const t = useT(); const [a, b] = P.shots.tap; return <ShotTap t={t} len={b - a} tapAt={P.tap - a} noteAt={P.nota - a} noteLen={NOTA.length} />; };
const Reflejo = () => { const t = useT(); const a = P.shots.reflejo[0]; return <ShotReflejo t={t} mamaAt={P.nota + NOTA.mamaEnd - a} keysAt={P.nota + NOTA.keys - a} />; };
const Pestillo = () => { const t = useT(); const [a, b] = P.shots.pestillo; return <ShotPestillo t={t} len={b - a} />; };
const Vereda = () => { const t = useT(); const [a, b] = P.shots.vereda; return <ShotVereda t={t} len={b - a} doorAt={P.puerta - a} outAt={P.sale - a} backAt={P.miraAtras - a} browAt={P.ceja - a} />; };

/* Her voice-note subtitles: above the phone while we see the chat, low on the glass after. */
const NoteSubs: React.FC = () => {
  const T = useT();
  const s = NOTA.subs.find((c) => T >= P.nota + c.a && T < P.nota + c.b);
  if (!s) return null;
  const k = Math.min(kf(T, P.nota + s.a, P.nota + s.a + 0.12), 1 - kf(T, P.nota + s.b - 0.12, P.nota + s.b));
  return <Subtitle text={s.text} who="ella" y={T < P.shots.tap[1] ? 120 : 1650} k={k} />;
};

export const PruebaEscena3: React.FC = () => {
  const { fps } = useVideoConfig();
  const seq = (k: keyof typeof P.shots) => ({ from: Math.round(P.shots[k][0] * fps), durationInFrames: Math.round((P.shots[k][1] - P.shots[k][0]) * fps) });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence name="Tap · dedo en reproducir" {...seq("tap")}><Tap /></Sequence>
      <Sequence name="Reflejo en el vidrio" {...seq("reflejo")}><Reflejo /></Sequence>
      <Sequence name="Pestillo" {...seq("pestillo")}><Pestillo /></Sequence>
      <Sequence name="Vereda · la puerta" {...seq("vereda")}><Vereda /></Sequence>
      <NoteSubs />
      <Audio src={staticFile("yabajaste/mix_prueba.wav")} />
    </AbsoluteFill>
  );
};
