import React, { useEffect, useRef } from 'react';
import { OrbState } from '../../types/assistant';

interface AmbientVoxVisualizerProps {
  state: OrbState;
  audioLevel?: number; // 0 to 2
  size?: 'sm' | 'md' | 'lg' | 'hero';
  interactive?: boolean;
  speedMultiplier?: number;
  glowIntensity?: number;
  onClick?: () => void;
  className?: string;
}

export const AmbientVoxVisualizer: React.FC<AmbientVoxVisualizerProps> = ({
  state = 'IDLE',
  audioLevel = 0,
  size = 'hero',
  interactive = true,
  speedMultiplier = 1.0,
  glowIntensity = 1.0,
  onClick,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dimensions based on size preset
  const config = {
    sm: { width: 44, height: 44, radius: 15, waveCount: 3, particles: 12 },
    md: { width: 90, height: 90, radius: 30, waveCount: 4, particles: 20 },
    lg: { width: 180, height: 180, radius: 58, waveCount: 5, particles: 36 },
    hero: { width: 280, height: 280, radius: 88, waveCount: 6, particles: 54 },
  }[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Particle seed
    const particleList = Array.from({ length: config.particles }, (_, i) => ({
      angle: (i / config.particles) * Math.PI * 2 + Math.random() * 0.5,
      dist: (0.2 + Math.random() * 0.8) * config.radius,
      baseDist: (0.2 + Math.random() * 0.8) * config.radius,
      speed: 0.005 + Math.random() * 0.015,
      size: 1.2 + Math.random() * 2.4,
      alpha: 0.25 + Math.random() * 0.75,
      wobbleSpeed: 0.02 + Math.random() * 0.04,
      driftAngle: (Math.random() - 0.5) * 0.02,
    }));

    // Wave ring history for audio ripple propagation
    const ripples: { radius: number; alpha: number; maxRadius: number; color: string }[] = [];
    let lastRippleTime = 0;

    const render = () => {
      time += 0.03 * Math.max(0.3, Math.min(3.0, speedMultiplier));
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // -------------------------------------------------------------
      // Color Palettes & Harmonic Config based on AI state
      // -------------------------------------------------------------
      let coreColor = '#00f2ff';
      let midColor = '#3b82f6';
      let outerColor = '#1e1b4b';
      let glowColor = 'rgba(0, 242, 255, 0.4)';
      let energyRingColor = 'rgba(56, 189, 248, 0.6)';
      let baseScale = 1.0;
      let waveSpeed = 1.0;
      let harmonicAmp = 3.0;

      if (state === 'LISTENING') {
        coreColor = '#38bdf8';
        midColor = '#0284c7';
        outerColor = '#082f49';
        glowColor = 'rgba(14, 165, 233, 0.55)';
        energyRingColor = 'rgba(56, 189, 248, 0.85)';
        const volBoost = Math.min(1.2, (audioLevel || 0.1) * 1.5);
        baseScale = 1.05 + volBoost * 0.35 + Math.sin(time * 6) * 0.04;
        waveSpeed = 2.4;
        harmonicAmp = 6.0 + volBoost * 14.0;

        // Spawn voice ripple waves on amplitude spike
        if (time - lastRippleTime > 0.4 && (audioLevel > 0.15 || Math.random() < 0.2)) {
          lastRippleTime = time;
          ripples.push({
            radius: config.radius * 0.8,
            alpha: 0.7,
            maxRadius: config.radius * 1.8,
            color: 'rgba(56, 189, 248, ',
          });
        }
      } else if (state === 'THINKING') {
        coreColor = '#c084fc';
        midColor = '#8b5cf6';
        outerColor = '#311042';
        glowColor = 'rgba(168, 85, 247, 0.5)';
        energyRingColor = 'rgba(216, 180, 254, 0.8)';
        baseScale = 0.96 + Math.sin(time * 4) * 0.08;
        waveSpeed = 3.2;
        harmonicAmp = 4.0;
      } else if (state === 'SEARCHING') {
        coreColor = '#38bdf8';
        midColor = '#6366f1';
        outerColor = '#1e1b4b';
        glowColor = 'rgba(99, 102, 241, 0.5)';
        energyRingColor = 'rgba(129, 140, 248, 0.75)';
        baseScale = 1.0 + Math.sin(time * 3) * 0.05;
        waveSpeed = 2.8;
        harmonicAmp = 5.0;
      } else if (state === 'SPEAKING') {
        coreColor = '#34d399';
        midColor = '#06b6d4';
        outerColor = '#064e3b';
        glowColor = 'rgba(16, 185, 129, 0.5)';
        energyRingColor = 'rgba(52, 211, 153, 0.85)';
        const speakAmp = 0.5 + Math.sin(time * 8) * 0.3 + Math.cos(time * 3.5) * 0.2;
        baseScale = 1.04 + speakAmp * 0.15;
        waveSpeed = 2.2;
        harmonicAmp = 7.0 + speakAmp * 8.0;

        if (time - lastRippleTime > 0.35) {
          lastRippleTime = time;
          ripples.push({
            radius: config.radius * 0.9,
            alpha: 0.65,
            maxRadius: config.radius * 1.7,
            color: 'rgba(52, 211, 153, ',
          });
        }
      } else if (state === 'ERROR') {
        coreColor = '#f87171';
        midColor = '#dc2626';
        outerColor = '#450a0a';
        glowColor = 'rgba(239, 68, 68, 0.45)';
        energyRingColor = 'rgba(248, 113, 113, 0.6)';
        baseScale = 1.0 + Math.sin(time * 2) * 0.03;
        waveSpeed = 1.2;
        harmonicAmp = 2.5;
      } else {
        // IDLE: Calm, gentle breathing aura
        coreColor = '#00f2ff';
        midColor = '#6366f1';
        outerColor = '#0b0f19';
        glowColor = 'rgba(0, 242, 255, 0.3)';
        energyRingColor = 'rgba(99, 102, 241, 0.4)';
        baseScale = 1.0 + Math.sin(time * 1.2) * 0.04;
        waveSpeed = 1.0;
        harmonicAmp = 2.2;
      }

      const activeRadius = config.radius * baseScale;

      // -------------------------------------------------------------
      // 1. Expanding Ambient Audio Ripples
      // -------------------------------------------------------------
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += 1.8 * waveSpeed;
        rip.alpha *= 0.94;

        if (rip.alpha < 0.02 || rip.radius > rip.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = rip.color + rip.alpha + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, rip.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 2. Multi-Layer Outer Ambient Glow
      // -------------------------------------------------------------
      const outerGlowRadius = activeRadius * (1.65 * Math.max(0.5, Math.min(2.0, glowIntensity)));
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        activeRadius * 0.1,
        centerX,
        centerY,
        outerGlowRadius
      );
      glowGrad.addColorStop(0, glowColor);
      glowGrad.addColorStop(0.5, glowColor.replace(/[\d\.]+\)$/, '0.15)'));
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerGlowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // -------------------------------------------------------------
      // 3. Fluid Multi-Harmonic Wave Layers
      // -------------------------------------------------------------
      const layers = size === 'sm' ? 2 : config.waveCount;
      for (let l = 0; l < layers; l++) {
        const layerRatio = (l + 1) / layers;
        const layerRadius = activeRadius * (0.65 + layerRatio * 0.35);
        const layerPhase = (l * Math.PI) / 3;
        const points = size === 'sm' ? 12 : 28;

        ctx.save();
        ctx.beginPath();

        for (let p = 0; p <= points; p++) {
          const theta = (p / points) * Math.PI * 2;
          // Harmonic wave equation
          const wave1 = Math.sin(theta * 3 + time * waveSpeed + layerPhase) * (harmonicAmp * layerRatio);
          const wave2 = Math.cos(theta * 5 - time * waveSpeed * 0.7) * (harmonicAmp * 0.5);
          const wave3 = Math.sin(theta * 2 + time * 1.5) * (harmonicAmp * 0.3);
          const r = layerRadius + wave1 + wave2 + wave3;
          const px = centerX + Math.cos(theta) * r;
          const py = centerY + Math.sin(theta) * r;

          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        if (l === layers - 1) {
          // Inner-most core fill
          const coreGrad = ctx.createRadialGradient(
            centerX - activeRadius * 0.25,
            centerY - activeRadius * 0.25,
            activeRadius * 0.05,
            centerX,
            centerY,
            activeRadius
          );
          coreGrad.addColorStop(0, '#ffffff');
          coreGrad.addColorStop(0.2, coreColor);
          coreGrad.addColorStop(0.65, midColor);
          coreGrad.addColorStop(1, outerColor);

          ctx.fillStyle = coreGrad;
          ctx.fill();

          ctx.strokeStyle = coreColor;
          ctx.lineWidth = 1.4;
          ctx.globalAlpha = 0.8;
          ctx.stroke();
        } else {
          // Translucent fluid aura shells
          ctx.strokeStyle = energyRingColor;
          ctx.lineWidth = 1.0 + layerRatio * 0.8;
          ctx.globalAlpha = 0.25 + layerRatio * 0.35;
          ctx.stroke();
        }
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 4. Orbital Neural Rings & Flux Beams
      // -------------------------------------------------------------
      if (size !== 'sm') {
        // Orbit 1: Elliptical flux ring
        ctx.save();
        ctx.strokeStyle = energyRingColor;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = state === 'THINKING' ? 0.85 : state === 'SEARCHING' ? 0.75 : 0.35;

        const rx = activeRadius * 1.28;
        const ry = activeRadius * 0.42;
        const rotAngle = time * 0.4 * (state === 'THINKING' ? 2.5 : state === 'SEARCHING' ? 2.0 : 1.0);

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, rx, ry, rotAngle, 0, Math.PI * 2);
        ctx.stroke();

        // Orbit 2: Reverse angled ring
        ctx.strokeStyle = coreColor;
        ctx.globalAlpha = state === 'THINKING' ? 0.7 : 0.25;
        const rotAngle2 = -time * 0.55 * (state === 'THINKING' ? 2.2 : 1.0);

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, rx * 0.88, ry * 1.25, rotAngle2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Radar/Scanner beam during SEARCHING
        if (state === 'SEARCHING') {
          ctx.save();
          const sweepAngle = time * 2.5;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, activeRadius * 1.35, sweepAngle, sweepAngle + 0.5);
          ctx.closePath();
          const sweepGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, activeRadius * 1.35);
          sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
          sweepGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = sweepGrad;
          ctx.fill();
          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // 5. Intelligent Quantum Particles
      // -------------------------------------------------------------
      ctx.save();
      particleList.forEach((p) => {
        const orbitMul = state === 'THINKING' ? 3.0 : state === 'SEARCHING' ? 2.2 : 1.0;
        p.angle += p.speed * orbitMul;
        p.dist = p.baseDist + Math.sin(time * 2 + p.angle) * (activeRadius * 0.15);

        const px = centerX + Math.cos(p.angle) * p.dist;
        const py = centerY + Math.sin(p.angle) * p.dist;

        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = p.alpha * (0.4 + Math.sin(time * 3 + p.angle) * 0.6);
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // -------------------------------------------------------------
      // 6. Holographic Specular Lens Shimmer
      // -------------------------------------------------------------
      ctx.save();
      const lensGrad = ctx.createRadialGradient(
        centerX - activeRadius * 0.32,
        centerY - activeRadius * 0.32,
        2,
        centerX - activeRadius * 0.28,
        centerY - activeRadius * 0.28,
        activeRadius * 0.48
      );
      lensGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      lensGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
      lensGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = lensGrad;
      ctx.beginPath();
      ctx.arc(
        centerX - activeRadius * 0.28,
        centerY - activeRadius * 0.28,
        activeRadius * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, audioLevel, config, size, speedMultiplier, glowIntensity]);

  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`relative flex items-center justify-center select-none ${
        interactive ? 'cursor-pointer group active:scale-95 transition-transform' : ''
      } ${className}`}
      style={{ width: config.width, height: config.height }}
      role="button"
      aria-label={`Vox AI Presence - State: ${state}`}
    >
      <canvas
        ref={canvasRef}
        width={config.width * 2}
        height={config.height * 2}
        style={{
          width: config.width,
          height: config.height,
        }}
        className="block drop-shadow-[0_0_25px_rgba(0,242,255,0.2)]"
      />
      {interactive && (
        <div className="absolute inset-0 rounded-full border border-white/0 group-hover:border-cyan-400/30 transition-colors pointer-events-none" />
      )}
    </div>
  );
};
