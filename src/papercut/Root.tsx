import React from 'react';
import {Composition, Still} from 'remotion';
import {CharacterSheet} from './scenes/CharacterSheet';
import {WalkTest, WALK_TEST_FRAMES} from './scenes/WalkTest';

export const PaperRoot: React.FC = () => (
  <>
    <Composition id="PaperWalkTest" component={WalkTest} durationInFrames={WALK_TEST_FRAMES} fps={30} width={1080} height={1920} />
    <Still id="PaperPersonajes" component={CharacterSheet} width={1080} height={1920} />
  </>
);
