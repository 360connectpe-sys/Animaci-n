import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import C from "../corto.json";
import { loadFonts } from "../fonts";
import { Subtitle, kf } from "../ui/Frame";
import { ShotReflejo } from "./Escena3";
import { PhoneShot, ShotBusBack, ShotBusMedium, ShotBusWide, ShotTira } from "./Presente";
import { ShotMano, ShotManija, ShotPareja, ShotVereda } from "./Recuerdo";

loadFonts();

/* «¿Ya bajaste?» — the whole short. One <Sequence> per shot (editable in Studio); each shot reads global time,
   so every cue stays in step with the voices placed by tools/yabajaste/timeline.py. Sound: one mixed track
   (tools/yabajaste/audio.py corto), built from the same timeline. */

type Shot = (typeof C.shots)[number];

const ShotView: React.FC<{ sh: Shot }> = ({ sh }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = sh.a + f / fps;
  const p = { T, a: sh.a, b: sh.b };
  switch (sh.kind) {
    case "busWide": return <ShotBusWide {...p} />;
    case "busMedium": return <ShotBusMedium {...p} />;
    case "chat": return <PhoneShot {...p} mode="chat" />;
    case "reflejo": return <ShotReflejo t={T - sh.a} mamaAt={C.t.mama - sh.a} keysAt={C.t.keys - sh.a} />;
    case "manija": return <ShotManija {...p} />;
    case "vereda": return <ShotVereda {...p} />;
    case "dialogo": case "pan": case "dialogo2": case "pasos": return <ShotPareja {...p} cam={sh.kind} />;
    case "mano": return <ShotMano {...p} />;
    case "tira": return <ShotTira {...p} />;
    case "busBack": return <ShotBusBack {...p} mode="back" />;
    case "audioFin": return <PhoneShot {...p} mode="fin" />;
    case "busWait": return <ShotBusBack {...p} mode="wait" />;
    case "pulgar": return <PhoneShot {...p} mode="pulgar" />;
    case "busEnd": return <ShotBusBack {...p} mode="end" />;
    default: return <AbsoluteFill style={{ background: "#000" }} />;
  }
};

/* Subtitles: one or two short lines; her lines warm and italic. Low on the phone shots so the search stays clear. */
const Subs: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = f / fps;
  const s = C.subs.find((c) => T >= c.a && T < c.b);
  if (!s || T >= C.t.black) return null;
  const sh = C.shots.find((x) => T >= x.a && T < x.b);
  const phone = sh && ["chat", "audioFin", "pulgar"].includes(sh.kind);
  const k = Math.min(kf(T, s.a, s.a + 0.12), 1 - kf(T, s.b - 0.12, s.b));
  const top = sh && sh.kind === "pasos";
  return <Subtitle text={s.text} who={s.who as "el" | "ella"} y={phone ? 1690 : top ? 230 : 1600} k={k} />;
};

export const Corto: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {C.shots.map((sh, i) => (
        <Sequence key={i} name={sh.name} from={Math.round(sh.a * fps)} durationInFrames={Math.max(1, Math.round(sh.b * fps) - Math.round(sh.a * fps))}>
          <ShotView sh={sh} />
        </Sequence>
      ))}
      <Subs />
      <Audio src={staticFile("yabajaste/mix_corto.wav")} />
    </AbsoluteFill>
  );
};
