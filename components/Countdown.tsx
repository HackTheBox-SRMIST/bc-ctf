"use client";
import { useState, useEffect } from "react";

// Event date: 19 September 2026, 10:00 AM IST (UTC+5:30)
const EVENT_DATE = new Date("2026-09-19T10:00:00+05:30");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function getTimeLeft(): TimeLeft {
  const now = new Date();
  const diff = EVENT_DATE.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, expired: false };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface UnitProps {
  value: string;
  label: string;
}

function TimeUnit({ value, label }: UnitProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
      {/* Translucent glassmorphism scoreboard card */}
      <div
        className="cursor-target relative flex items-center justify-center rounded-xl overflow-hidden select-none transition-all duration-200 hover:border-[#9fef00]/40 hover:shadow-[0_0_18px_rgba(159,239,0,0.2)]"
        style={{
          width: "clamp(3.25rem, 10vw, 5.5rem)",
          height: "clamp(3.25rem, 10vw, 5.5rem)",
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 4px 16px rgba(0, 0, 0, 0.2)",
          perspective: "300px",
        }}
      >
        {/* Flip digit - inside number with slight greenish color matching HTB theme */}
        <span
          key={value}
          className="animate-flip-in font-tech tabular-nums tracking-widest text-[#bbfb52] inline-block"
          style={{
            fontSize: "clamp(1.25rem, 5vw, 2.25rem)",
            textShadow: "0 0 20px rgba(159, 239, 0, 0.5)",
          }}
        >
          {value}
        </span>

        {/* Subtle scoreboard mid-divider */}
        <div
          className="absolute inset-x-0 top-1/2 h-px pointer-events-none"
          style={{ background: "rgba(255, 255, 255, 0.08)" }}
        />
      </div>

      {/* Label */}
      <span className="font-tech text-[9px] sm:text-[10px] md:text-xs text-white/40 tracking-[0.2em] uppercase">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div
      className="flex items-center justify-center self-center text-xl sm:text-2xl md:text-3xl text-[#9fef00] select-none animate-pulse font-tech"
      style={{
        textShadow: "0 0 12px rgba(159, 239, 0, 0.8)",
        marginBottom: "clamp(1rem, 2.5vw, 1.5rem)",
      }}
      aria-hidden
    >
      :
    </div>
  );
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft());

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (timeLeft.expired) {
    return (
      <div className="font-tech text-xl text-[#9fef00] tracking-widest animate-pulse">
        EVENT IS LIVE
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 sm:gap-2 md:gap-3 mt-2"
      aria-label="Countdown to Black Cat CTF"
      role="timer"
    >
      <TimeUnit value={pad(timeLeft.days)} label="days" />
      <Separator />
      <TimeUnit value={pad(timeLeft.hours)} label="hours" />
      <Separator />
      <TimeUnit value={pad(timeLeft.minutes)} label="min" />
      <Separator />
      <TimeUnit value={pad(timeLeft.seconds)} label="sec" />
    </div>
  );
}
