import React from 'react';
import { OrbState } from '../../types/assistant';
import { AmbientVoxVisualizer } from './AmbientVoxVisualizer';

interface OrbVisualizerProps {
  state: OrbState;
  audioLevel?: number; // 0 to 2
  size?: 'sm' | 'md' | 'lg' | 'hero';
  interactive?: boolean;
  orbSpeed?: number; // 0.5 to 2.0 multiplier
  glowIntensity?: number; // 0.5 to 2.0 multiplier
  onClick?: () => void;
  className?: string;
}

export const OrbVisualizer: React.FC<OrbVisualizerProps> = ({
  state = 'IDLE',
  audioLevel = 0,
  size = 'hero',
  interactive = true,
  orbSpeed = 1.0,
  glowIntensity = 1.0,
  onClick,
  className = '',
}) => {
  return (
    <AmbientVoxVisualizer
      state={state}
      audioLevel={audioLevel}
      size={size}
      interactive={interactive}
      speedMultiplier={orbSpeed}
      glowIntensity={glowIntensity}
      onClick={onClick}
      className={className}
    />
  );
};
