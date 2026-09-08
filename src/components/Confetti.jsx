import { useEffect, useRef } from 'react';
import { randomFloat } from '../utils/random.js';

const COLORS = ['#ff2d95', '#22e7ff', '#b6ff3c', '#ffc53d', '#ffffff'];

/**
 * Confetes em canvas. Um unico requestAnimationFrame, encerrado sozinho
 * quando as particulas somem e cancelado no unmount.
 */
export default function Confetti({ calm = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const count = calm ? 40 : 140;
    const width = () => canvas.offsetWidth;
    const height = () => canvas.offsetHeight;

    const particles = Array.from({ length: count }, () => ({
      x: width() * randomFloat(),
      y: -20 - randomFloat() * height() * 0.6,
      w: 6 + randomFloat() * 8,
      h: 8 + randomFloat() * 12,
      vy: 1.6 + randomFloat() * 3.2,
      vx: -1.4 + randomFloat() * 2.8,
      rot: randomFloat() * Math.PI,
      vr: -0.12 + randomFloat() * 0.24,
      color: COLORS[Math.floor(randomFloat() * COLORS.length)],
      life: 1,
    }));

    let raf = 0;
    let frames = 0;
    const maxFrames = calm ? 140 : 340;

    const tick = () => {
      frames += 1;
      ctx.clearRect(0, 0, width(), height());
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.rot += p.vr;
        if (frames > maxFrames * 0.6) p.life -= 0.012;
        if (p.y > height() + 40 && p.life > 0) {
          p.y = -20;
          p.x = width() * randomFloat();
        }
        if (p.life <= 0) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (frames < maxFrames) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width(), height());
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [calm]);

  return <canvas ref={canvasRef} className="confetti" aria-hidden="true" />;
}
