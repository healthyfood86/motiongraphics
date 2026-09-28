import React from 'react';
import { Composition } from 'remotion';
import { Ad } from './Ad';
import beatmap from './beatmap.json';

const FPS = 60;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="EdenDesignAd"
    component={Ad}
    durationInFrames={Math.round(beatmap.duration * FPS)}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
