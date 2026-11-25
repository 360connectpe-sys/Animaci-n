import { continueRender, delayRender, staticFile } from "remotion";

/* Fredoka (the Stick-Story label font), served locally so renders never depend on the network. */
export const FONT = "Fredoka";
let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("Cargando Fredoka");
  const faces = (["500", "600", "700"] as const).map((w) =>
    new FontFace(FONT, `url(${staticFile(`yabajaste/fx/fredoka-latin-${w}-normal.woff2`)}) format("woff2")`, { weight: w }));
  Promise.all(faces.map((f) => f.load()))
    .then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(handle); })
    .catch((e) => { console.error(e); continueRender(handle); });
};
