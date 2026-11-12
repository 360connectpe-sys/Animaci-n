import React from 'react';
import {Composition} from 'remotion';
import {Dialogue, DIALOGUE_DURATION} from './scenes/Dialogue';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ReflexionDialogo"
    component={Dialogue}
    durationInFrames={DIALOGUE_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);
