"use client";
import { useEffect, useRef } from "react";

// Hacker charset for the falling glyphs
const GLYPHS = [
  "0", "1", "▲", "▼", "◆", "░", "█", "⌘", "$", "#", "@", "!", ">", "<",
  "λ", "Ω", "∑", "∆", "π", "μ", "∞", "≠", "≡", "←", "→", "↑", "↓",
  "⚡", "◉", "◈", "⬡", "⬢", "/", "\\", "|", "~", "^", "*", "%",
];

const HTB_GREEN = "#9fef00";

interface Glyph {
  x: number;
  y: number;
  char: string;
  speed: number;
  opacity: number;
  size: number;
  depth: number;       // 0..1 — used for parallax layering
  driftPhase: number;  // random phase for lateral sine drift
  driftAmp: number;    // lateral amplitude (px)
}

export default function GlyphField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const isMobile = () => window.innerWidth < 768;
    const particleCount = () => (isMobile() ? 38 : 90);

    // Mouse state — normalised -0.5..0.5
    const mouse = { nx: 0, ny: 0, smoothNx: 0, smoothNy: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.nx = e.clientX / width - 0.5;
      mouse.ny = e.clientY / height - 0.5;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Build initial glyphs
    let glyphs: Glyph[] = [];

    function buildGlyphs() {
      glyphs = [];
      const count = particleCount();
      for (let i = 0; i < count; i++) {
        glyphs.push(makeGlyph(Math.random() * width, Math.random() * height));
      }
    }

    function makeGlyph(x: number, startY: number): Glyph {
      const depth = 0.2 + Math.random() * 0.8; // deeper = more parallax shift & larger
      const mobile = isMobile();
      return {
        x,
        y: startY,
        char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        speed: 0.4 + depth * 0.6,                            // smooth, steady descent
        opacity: 0.12 + depth * 0.26,                        // 12–38% (richer presence)
        size: mobile ? 11 + depth * 9 : 13 + depth * 15,    // 13–28px desktop
        depth,
        driftPhase: Math.random() * Math.PI * 2,
        driftAmp: 0.8 + depth * 1.8,                         // graceful lateral float
      };
    }

    buildGlyphs();

    let time = 0;
    let rafId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse
      mouse.smoothNx += (mouse.nx - mouse.smoothNx) * 0.06;
      mouse.smoothNy += (mouse.ny - mouse.smoothNy) * 0.06;

      time += 0.01;

      const mobile = isMobile();
      const parallaxScale = mobile ? 0 : 18; // 0 on mobile

      for (const g of glyphs) {
        // Parallax offset: deeper glyphs shift more
        const px = mouse.smoothNx * parallaxScale * g.depth;
        const py = mouse.smoothNy * parallaxScale * g.depth * 0.5;

        // Lateral drift
        const lateralDrift = Math.sin(time * 0.6 + g.driftPhase) * g.driftAmp;

        const drawX = g.x + lateralDrift + px;
        const drawY = g.y + py;

        ctx.globalAlpha = g.opacity;
        ctx.fillStyle = HTB_GREEN;

        // Subtle phosphor glow on foreground glyphs
        if (g.depth > 0.55) {
          ctx.shadowColor = HTB_GREEN;
          ctx.shadowBlur = 6 * g.depth;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.font = `${g.size}px monospace`;
        ctx.fillText(g.char, drawX, drawY);

        // Move downward
        g.y += g.speed;

        // Occasionally swap character mid-fall for flicker effect
        if (Math.random() < 0.005) {
          g.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }

        // Reset when off-screen bottom
        if (g.y > height + g.size) {
          const reset = makeGlyph(Math.random() * width, -g.size);
          Object.assign(g, reset);
          g.x = Math.random() * width;
          g.y = -g.size;
        }
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      buildGlyphs();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  );
}
