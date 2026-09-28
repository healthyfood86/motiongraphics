import React from 'react';
import { Composition } from 'remotion';
import { Showreel } from './Showreel';

const FPS = 60;
const DURATION_SECONDS = 15;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Showreel"
        component={Showreel}
        durationInFrames={Math.round(DURATION_SECONDS * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
