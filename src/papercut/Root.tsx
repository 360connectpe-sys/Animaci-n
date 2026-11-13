import React from 'react';
import {Composition, Still} from 'remotion';
import {CharacterSheet} from './scenes/CharacterSheet';
import {WalkTest, WALK_TEST_FRAMES} from './scenes/WalkTest';
import {EpisodeView} from './episode/Episode';
import {EP01} from './episode/ep01';

export const PaperRoot: React.FC = () => (
  <>
    <Composition id="PaperEp01" component={EpisodeView} durationInFrames={Math.round(EP01.seconds * 30)} fps={30} width={1080} height={1920} defaultProps={{ep: EP01}} />
    <Composition id="PaperWalkTest" component={WalkTest} durationInFrames={WALK_TEST_FRAMES} fps={30} width={1080} height={1920} />
    <Still id="PaperPersonajes" component={CharacterSheet} width={1080} height={1920} />
  </>
);
