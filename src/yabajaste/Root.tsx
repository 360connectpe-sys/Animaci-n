import React from "react";
import { Composition } from "remotion";
import P from "./prueba.json";
import { PruebaEscena3 } from "./scenes/Prueba";

export const YaBajasteRoot: React.FC = () => (
  <>
    <Composition id="YaBajastePrueba" component={PruebaEscena3} durationInFrames={Math.round(P.total * 30)} fps={30} width={1080} height={1920} />
  </>
);
