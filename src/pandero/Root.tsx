import React from 'react';
import {Composition} from 'remotion';
import {PanderoCommercial} from './Commercial';
import {TOTAL_SECONDS} from './config';

export const PanderoRoot: React.FC = () => (
  <Composition id="PanderoAuto" component={PanderoCommercial} durationInFrames={Math.round(TOTAL_SECONDS * 30)} fps={30} width={1080} height={1920} />
);
