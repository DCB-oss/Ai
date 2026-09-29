import React, { useEffect, useRef } from 'react';
import { OrbState } from '../../types/assistant';

interface AmbientWaveBackgroundProps {
  state?: OrbState;
  audioLevel?: number;
  className?: string;
}

export const AmbientWaveBackground: React.FC<AmbientWaveBackgroundProps> = ({
  state = 'IDLE',
  audioLevel = 0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Subtle background ambient float particles
    const particleCount = 28;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: 1 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.2 - Math.random() * 0.4,
      alpha: 0.1 + Math.random() * 0.35,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }));

    const render = () => {
      time += 0.015;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Soft Dynamic Gradient Mesh Glows
      let glow1Color = 'rgba(0, 242, 255, 0.05)';
      let glow2Color = 'rgba(99, 102, 241, 0.04)';
      let glow3Color = 'rgba(168, 85, 247, 0.03)';

      if (state === 'LISTENING') {
        const boost = Math.min(0.12, (audioLevel || 0.1) * 0.15);
        glow1Color = `rgba(0, 242, 255, ${0.08 + boost})`;
        glow2Color = `rgba(14, 165, 233, ${0.06 + boost})`;
      } else if (state === 'THINKING') {
        glow1Color = 'rgba(168, 85, 247, 0.09)';
        glow2Color = 'rgba(217, 70, 239, 0.06)';
        glow3Color = 'rgba(99, 102, 241, 0.05)';
      } else if (state === 'SPEAKING') {
        glow1Color = 'rgba(16, 185, 129, 0.08)';
        glow2Color = 'rgba(6, 182, 212, 0.07)';
      }

      // Top-center ambient aura
      const cx1 = w * 0.5 + Math.sin(time * 0.5) * (w * 0.1);
      const cy1 = h * 0.35 + Math.cos(time * 0.4) * (h * 0.08);
      const grad1 = ctx.createRadialGradient(cx1, cy1, 10, cx1, cy1, w * 0.45);
      grad1.addColorStop(0, glow1Color);
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      // Bottom ambient aura
      const cx2 = w * 0.5 - Math.sin(time * 0.6) * (w * 0.15);
      const cy2 = h * 0.75;
      const grad2 = ctx.createRadialGradient(cx2, cy2, 10, cx2, cy2, w * 0.5);
      grad2.addColorStop(0, glow2Color);
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      // 2. Subtle Harmonic Waves at Bottom
      const waveCount = 2;
      for (let i = 0; i < waveCount; i++) {
        ctx.save();
        ctx.beginPath();
        const yBase = h * (0.88 + i * 0.06);
        ctx.moveTo(0, yBase);

        for (let x = 0; x <= w; x += 15) {
          const waveY =
            yBase +
            Math.sin(x * 0.003 + time * 1.2 + i * 1.5) * 12 +
            Math.cos(x * 0.006 - time * 0.8) * 8;
          ctx.lineTo(x, waveY);
        }

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        ctx.fillStyle = i === 0 ? 'rgba(0, 242, 255, 0.015)' : 'rgba(99, 102, 241, 0.012)';
        ctx.fill();
        ctx.restore();
      }

      // 3. Ambient Floating Star Particles
      ctx.save();
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const currentAlpha = p.alpha * (0.6 + Math.sin(time * 3 + p.x) * 0.4);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [state, audioLevel]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block opacity-80" />
    </div>
  );
};
