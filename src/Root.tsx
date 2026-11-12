import React from 'react';
import {Composition} from 'remotion';
import {Dialogue, DIALOGUE_DURATION} from './scenes/Dialogue';
import {CharacterIdle, IDLE_DURATION, IDLE_SHORT_DURATION} from './scenes/CharacterIdle';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="PersonajeRespira5s"
    component={CharacterIdle}
    durationInFrames={IDLE_SHORT_DURATION}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{blinking: false}}
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
