"use client";
import React, { useRef, useState, useCallback } from "react";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
  className?: string;
}

export default function SpotlightCard({
  children,
  spotlightColor = "rgba(159, 239, 0, 0.14)",
  className = "",
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setOpacity(1);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Radial surface spotlight */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Radial glowing border spotlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-300 z-0"
        style={{
          opacity,
          border: "1px solid rgba(159, 239, 0, 0.5)",
          boxShadow: `inset 0 0 20px rgba(159, 239, 0, 0.1)`,
          maskImage: `radial-gradient(320px circle at ${position.x}px ${position.y}px, black 30%, transparent 80%)`,
          WebkitMaskImage: `radial-gradient(320px circle at ${position.x}px ${position.y}px, black 30%, transparent 80%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row gap-4 items-start md:items-center">
        {children}
      </div>
    </div>
  );
}
