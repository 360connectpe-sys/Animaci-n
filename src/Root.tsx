import React from 'react';
import {Composition} from 'remotion';
import {Dialogue, DIALOGUE_DURATION} from './scenes/Dialogue';
import {Pilot, PILOT_DURATION} from './scenes/Pilot';
import {CharacterIdle, IDLE_DURATION, IDLE_SHORT_DURATION} from './scenes/CharacterIdle';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="PilotoReflexion"
    component={Pilot}
    durationInFrames={PILOT_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
  <Composition
    id="PersonajeHabitacion"
    component={CharacterIdle}
    durationInFrames={IDLE_SHORT_DURATION}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{scene: 'room' as const}}
  />
  <Composition
    id="PersonajeCalle"
    component={CharacterIdle}
    durationInFrames={IDLE_SHORT_DURATION}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{scene: 'street' as const}}
  />
  <Composition
    id="ExpresionesTransicion"
    component={CharacterIdle}
    durationInFrames={240}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{
      expressionTimeline: [
        {at: 0, expression: 'neutral' as const},
        {at: 50, expression: 'sad' as const},
        {at: 110, expression: 'thoughtful' as const},
        {at: 170, expression: 'neutral' as const},
      ],
    }}
  />
  <Composition
    id="ExpresionTriste"
    component={CharacterIdle}
    durationInFrames={IDLE_SHORT_DURATION}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{expression: 'sad' as const}}
  />
  <Composition
    id="ExpresionPensativo"
    component={CharacterIdle}
    durationInFrames={IDLE_SHORT_DURATION}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{expression: 'thoughtful' as const}}
  />
  <Composition
    id="PersonajeRespira5s"
    component={CharacterIdle}
    durationInFrames={IDLE_SHORT_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
  <Composition
    id="PersonajeRespira"
    component={CharacterIdle}
    durationInFrames={IDLE_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
  <Composition
    id="ReflexionDialogo"
    component={Dialogue}
    durationInFrames={DIALOGUE_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
  </>
);
