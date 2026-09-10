"use client";
import { useEffect, useRef } from "react";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface ClickSparkProps {
  sparkColor?: string;
  sparkCount?: number;
  sparkLength?: number;
  sparkSpeed?: number;
}

export default function ClickSpark({
  sparkColor = "#22d3ee",
  sparkCount = 9,
  sparkLength = 12,
  sparkSpeed = 4,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (sparksRef.current.length === 0) {
        animFrameRef.current = null;
        return;
      }

      ctx.save();
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const s = sparksRef.current[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94;
        s.vy *= 0.94;
        s.alpha = Math.max(0, 1 - s.life / s.maxLife);

        const heading = Math.atan2(s.vy, s.vx);
        const tailX = s.x - Math.cos(heading) * s.length * s.alpha;
        const tailY = s.y - Math.sin(heading) * s.length * s.alpha;

        ctx.strokeStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.lineWidth = 2;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        if (s.life >= s.maxLife) {
          sparksRef.current.splice(i, 1);
        }
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(animate);
    };

    const handlePointerDown = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      const colors = [sparkColor, "#ffffff", "#67e8f9"];
      const newSparks: Spark[] = [];

      for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.5;
        const speed = sparkSpeed * (0.6 + Math.random() * 0.8);
        const maxLife = 22 + Math.floor(Math.random() * 12);

        newSparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          length: sparkLength * (0.7 + Math.random() * 0.6),
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 0,
          maxLife,
        });
      }

      sparksRef.current.push(...newSparks);

      if (!animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", handlePointerDown);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [sparkColor, sparkCount, sparkLength, sparkSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9998]"
      aria-hidden="true"
    />
  );
}
