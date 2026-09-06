"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import ParticleTextLoader from "./ParticleTextLoader";
import Countdown from "./Countdown";
import GlyphField from "./GlyphField";
import SpotlightCard from "./SpotlightCard";

// Antigravity uses Three.js/R3F — must be client-only, no SSR
const Antigravity = dynamic(() => import("./Antigravity"), { ssr: false });

// DecryptedText uses motion (motion/react) — browser-only, no SSR
const DecryptedText = dynamic(() => import("./DecryptedText"), { ssr: false });

// VariableProximity text animation from React Bits
const VariableProximity = dynamic(() => import("./VariableProximity"), { ssr: false });

// ---------------------------------------------------------------------------
// TODO: Add more wallpaper images to /public and list them here.
//       Currently only one image exists; add more for a meaningful crossfade.
// ---------------------------------------------------------------------------
const WALLPAPERS = [
  "/black-cat-haunted-house.jpg",
  // "/black-cat-outside-haunted-house.webp",
];

// ---------------------------------------------------------------------------
// Crossfade background slideshow
// ---------------------------------------------------------------------------
function CrossfadeBackground() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (WALLPAPERS.length < 2) return; // nothing to crossfade with one image

    const interval = setInterval(() => {
      const next = (currentIdx + 1) % WALLPAPERS.length;
      setNextIdx(next);
      setFading(true);

      // After the transition completes, make "next" the current
      const timeout = setTimeout(() => {
        setCurrentIdx(next);
        setNextIdx(null);
        setFading(false);
      }, 1500); // matches transition-duration below

      return () => clearTimeout(timeout);
    }, 7000);

    return () => clearInterval(interval);
  }, [currentIdx]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Current image */}
      <div
        className="absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-in-out"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <Image
          src={WALLPAPERS[currentIdx]}
          alt="Background"
          fill
          className="object-cover object-center"
          style={{ filter: "brightness(0.95) contrast(1.15)" }}
          priority
        />
      </div>

      {/* Next image (crossfades in) */}
      {nextIdx !== null && (
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: fading ? 1 : 0 }}
        >
          <Image
            src={WALLPAPERS[nextIdx]}
            alt="Background"
            fill
            className="object-cover object-center"
            style={{ filter: "brightness(0.95) contrast(1.15)" }}
          />
        </div>
      )}

      {/* Subtle vignette overlay — matches original radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.4) 100%)" }}
      />
    </div>
  );
}


// ---------------------------------------------------------------------------
// Scramble-in hook — vanilla JS, no animation library required
// ---------------------------------------------------------------------------
const HACKER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>?/|\\[]{}";

function useScramble(target: string, duration = 1200, startDelay = 200) {
  const [display, setDisplay] = useState<string>(() => target.replace(/[^ ]/g, "_"));
  const frameRef = useRef<number>(0);

  const scramble = useCallback(() => {
    const startTime = performance.now() + startDelay;
    const endTime = startTime + duration;

    const tick = (now: number) => {
      if (now < startTime) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Characters resolve left-to-right as progress increases
      const resolvedCount = Math.floor(progress * target.length);

      const result = target
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < resolvedCount) return char;
          return HACKER_CHARS[Math.floor(Math.random() * HACKER_CHARS.length)];
        })
        .join("");

      setDisplay(result);

      if (now < endTime) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [target, duration, startDelay]);

  useEffect(() => {
    scramble();
    return () => cancelAnimationFrame(frameRef.current);
  }, [scramble]);

  return display;
}

// ---------------------------------------------------------------------------
// Button styles — HTB green primary, white-border secondary

// ---------------------------------------------------------------------------
const buttonBase =
  "h-[48px] px-8 rounded-full text-base font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black flex items-center justify-center [text-shadow:none]";

// HTB green — the ONLY saturated-colour element on the page
const buttonPrimary = `${buttonBase} bg-[#9fef00] text-black active:bg-[#7ec900] hover:scale-105 hover:shadow-2xl hover:shadow-[#9fef00]/60 hover:brightness-110`;

const buttonSecondary = `${buttonBase} border-2 border-white/60 text-white bg-transparent active:bg-white/10 hover:bg-white/10 hover:border-white hover:shadow-xl hover:shadow-white/20`;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function HomeClient() {
  const [loading, setLoading] = useState(true);
  // showAntigravity fires 800ms after the page appears (loader gone),
  // timed so the ring forms while the Shuffle strip-reveal is still running.
  const [showAntigravity, setShowAntigravity] = useState(false);
  const heroText = useScramble("BLACK CAT CTF", 1200, 400);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Trigger Antigravity 800ms after the page appears (loader gone)
  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => setShowAntigravity(true), 800);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <>
      {loading && <ParticleTextLoader />}

      {!loading && (
        <div className="relative h-full flex flex-col font-mono animate-fade-in">

          {/* ── Background layer: crossfade wallpapers ─────────────────── */}
          <div className="fixed inset-0 -z-20 w-full h-full bg-[#0a0a0a]">
            <CrossfadeBackground />
          </div>

          {/* ── Ambient layer: glyph particle field + scanline mirror ───── */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <GlyphField />
          </div>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <header className="relative z-30 flex-none flex flex-col md:flex-row items-center justify-between p-4 lg:p-8 gap-4 md:gap-0 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
            <div className="flex items-center w-full md:w-auto justify-center md:justify-start">
              <Link href="/" className="cursor-target flex items-center gap-2 md:gap-4 transition-opacity hover:opacity-80">
                <Image
                  src="/HTB_SRMIST.png"
                  alt="HTB SRMIST Logo"
                  width={200}
                  height={80}
                  className="object-contain h-16 md:h-24 w-auto scale-110 origin-left"
                  priority
                />
                <span className="text-white/50 font-sans font-bold text-sm md:text-lg mx-1 md:mx-2">X</span>
                <Image
                  src="/WiCyS.png"
                  alt="WiCyS Logo"
                  width={200}
                  height={80}
                  className="object-contain h-16 md:h-20 w-auto"
                  priority
                />
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-6 header-interactive-group w-full md:w-auto mt-2 md:mt-0">
              <div className="cursor-target flex items-center gap-2 md:gap-4 px-2 py-1 rounded-lg transition-all hover:bg-white/5">
                <span className="text-base md:text-lg font-medium text-white/70 htb-text">HTB</span>
                <span className="text-base md:text-lg font-medium text-white/70 chennai-text"> Chennai</span>
                <span className="text-base md:text-lg font-medium text-white/50">|</span>
                <span className="text-base md:text-lg font-medium wicys-text">
                  <span className="text-white/70 transition-all duration-300 wicys-wi">Wi</span>
                  <span className="text-white/70 transition-all duration-300 wicys-cys">CyS</span>
                </span>
              </div>
              <div className="block h-4 md:h-5 w-[2px] bg-white/50 mx-1 md:mx-2" />
              <Link href="/" className="cursor-target text-base md:text-lg font-tech font-bold tracking-wider">
                <span className="text-white/70 bc-ctf-text transition-all duration-300">BC-CTF</span>
              </Link>
            </div>
          </header>

          {/* ── Main content ───────────────────────────────────────────── */}
          <main className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 lg:py-6 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)] overflow-y-auto no-scrollbar flex-grow flex flex-col justify-start">
            <div className="flex flex-col gap-6 w-full items-start">

              {/* ── Hero block ─────────────────────────────────────────── */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3 w-full">
                <div>
                  {/* Glitch heading with scramble-in entrance */}
                  <h1
                    className="glitch text-5xl md:text-6xl lg:text-7xl font-tech font-bold tracking-wider"
                    data-text="BLACK CAT CTF"
                    style={{ color: "#9fef00", textShadow: "0 0 30px rgba(159,239,0,0.4), 0 2px 4px rgba(0,0,0,0.8)" }}
                  >
                    {heroText}
                  </h1>

                  {/* ── Antigravity tagline block ──────────────────────────
                      Antigravity is absolutely-positioned BEHIND the h2 text,
                      inside a bounded relative container so it never bleeds
                      to full-viewport. pointer-events-none keeps text clicks
                      working. fadeDelay=3500ms / fadeDuration=1000ms = settles
                      and fades out as the scramble finishes, reads as a brief
                      ring-formation moment rather than a looping ambient. */}
                  <div className="relative" style={{ height: "48px" }}>
                    {/* h2 sits above (z-10) the canvas */}
                     <h2
                       className="absolute inset-0 flex items-center justify-center sm:justify-start text-xl md:text-2xl lg:text-3xl font-tech font-semibold text-white/80 tracking-widest z-10"
                       aria-label="BC-CTF"
                     >
                       <DecryptedText
                         text="BC-CTF"
                         animateOn="inViewHover"
                         sequential={true}
                         revealDirection="center"
                         speed={60}
                         characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>?/|[]{}"
                         className="text-white/80"
                         encryptedClassName="text-[#9fef00]/60"
                       />
                     </h2>

                    {/* Antigravity ring — absolutely fills the container */}
                    {showAntigravity && (
                      <div
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{ overflow: "visible" }}
                      >
                        <Antigravity
                          count={120}
                          magnetRadius={6}
                          ringRadius={7}
                          waveSpeed={0.4}
                          waveAmplitude={1}
                          particleSize={1.5}
                          lerpSpeed={0.05}
                          color="#9fef00"
                          autoAnimate={true}
                          particleVariance={1}
                          rotationSpeed={0.08}
                          pulseSpeed={3}
                          fieldStrength={10}
                          depthFactor={0.35}
                          fadeDelay={3500}
                          fadeDuration={1000}
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tagline with React Bits VariableProximity effect */}
                <p
                  ref={taglineRef}
                  className="mt-1 text-sm md:text-base text-gray-300 leading-relaxed w-full max-w-2xl select-none"
                >
                  <VariableProximity
                    label="A premier cybersecurity capture the flag competition. Brought to you through a special collaboration between Hack The Box Chennai (SRMIST) and Women in CyberSecurity (WiCyS SRMIST), as we come together to organize this event."
                    className="text-gray-300 tracking-wide cursor-default"
                    fromFontVariationSettings="'wght' 300, 'opsz' 14"
                    toFontVariationSettings="'wght' 850, 'opsz' 36"
                    containerRef={taglineRef}
                    radius={100}
                    falloff="gaussian"
                  />
                </p>

                {/* ── Countdown ──────────────────────────────────────── */}
                <Countdown />

                {/* ── CTA buttons ────────────────────────────────────── */}
                <div className="mt-2 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  {/* Laser Border Wrapper for Register Now */}
                  <div className="relative p-[2px] rounded-full overflow-hidden inline-flex w-full sm:w-auto group">
                    {/* Orbiting Laser Beam */}
                    <div
                      className="absolute inset-[-200%] animate-[spin_3s_linear_infinite] pointer-events-none"
                      style={{
                        background:
                          "conic-gradient(from 0deg at 50% 50%, transparent 0%, transparent 70%, #9fef00 88%, #ffffff 96%, #9fef00 100%)",
                      }}
                    />
                    {/* Laser Bloom Glow */}
                    <div
                      className="absolute inset-[-200%] animate-[spin_3s_linear_infinite] pointer-events-none blur-[4px] opacity-80"
                      style={{
                        background:
                          "conic-gradient(from 0deg at 50% 50%, transparent 0%, transparent 70%, #9fef00 88%, #ffffff 96%, #9fef00 100%)",
                      }}
                    />
                    <Link
                      href="https://htbchennai.in/events"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`relative z-10 cursor-target ${buttonPrimary} w-full sm:w-auto shadow-[0_0_24px_rgba(159,239,0,0.35)]`}
                    >
                      Register Now
                    </Link>
                  </div>

                  {/* Join Event Group with White Glow & WhatsApp link */}
                  <Link
                    href="https://chat.whatsapp.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`cursor-target ${buttonSecondary} w-full sm:w-auto !border-white text-white shadow-[0_0_22px_rgba(255,255,255,0.45),inset_0_0_12px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.85),inset_0_0_20px_rgba(255,255,255,0.35)] hover:bg-white/15 active:bg-white active:text-black active:shadow-[0_0_50px_#ffffff,inset_0_0_30px_#ffffff] active:scale-95 transition-all duration-200`}
                  >
                    Join Event Group
                  </Link>
                </div>
              </div>

              {/* ── Info boxes with Spotlight ───────────────────────────── */}
              <div className="flex flex-col w-full gap-6">
                <SpotlightCard
                  spotlightColor="rgba(159, 239, 0, 0.16)"
                  className="cursor-target info-box w-full p-6"
                >
                  <h3 className="text-xl font-mono font-bold text-[#9fef00] md:w-1/4 md:border-r border-white/10 md:pr-4 md:border-b-0 border-b pb-2 md:pb-0">
                    About Event
                  </h3>
                  <p className="text-base leading-relaxed text-gray-300 md:w-3/4">
                    An elite cybersecurity CTF event. Participants will solve real-world security challenges
                    across multiple domains, breaking into systems, discovering vulnerabilities, and extracting
                    hidden flags.
                  </p>
                </SpotlightCard>

                <SpotlightCard
                  spotlightColor="rgba(159, 239, 0, 0.16)"
                  className="cursor-target info-box w-full p-6"
                >
                  <h3 className="text-xl font-mono font-bold text-[#9fef00] md:w-1/4 md:border-r border-white/10 md:pr-4 md:border-b-0 border-b pb-2 md:pb-0">
                    Event Details
                  </h3>
                  <div className="space-y-2 text-sm text-gray-300 font-mono md:w-3/4">
                    <p><span className="font-semibold text-white">Category:</span> Cybersecurity, CTF, Jeopardy</p>
                    <p><span className="font-semibold text-white">Venue:</span> Mini Hall 2, SRM IST</p>
                    <p><span className="font-semibold text-white">Date:</span> September 19th, 2026</p>
                    <p><span className="font-semibold text-white">Time:</span> 10:00 AM IST</p>
                    <p><span className="font-semibold text-white">Pre-Requisites:</span> Charged laptop with Kali Linux (VMware/VirtualBox).</p>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </main>

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <footer className="relative z-10 w-full py-8 flex justify-center flex-none">
            <div className="flex space-x-3">
              <div
                className="w-3 h-3 rounded-full animate-pulse-dot"
                style={{ backgroundColor: "#9fef00", boxShadow: "0 0 8px #9fef00", animationDelay: "0s" }}
              />
              <div
                className="w-3 h-3 rounded-full animate-pulse-dot"
                style={{ backgroundColor: "#9fef00", boxShadow: "0 0 8px #9fef00", animationDelay: "0.2s" }}
              />
              <div
                className="w-3 h-3 rounded-full animate-pulse-dot"
                style={{ backgroundColor: "#9fef00", boxShadow: "0 0 8px #9fef00", animationDelay: "0.4s" }}
              />
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
