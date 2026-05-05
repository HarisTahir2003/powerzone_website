'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SolutionsSection from '@/components/SolutionsSection';
import ProcessSection from '@/components/ProcessSection';
import GoalsSection from '@/components/GoalsSection';

const LOGO_ON_DARK = '/images/logo-on-dark.png';
const BUTTON_IMG = '/images/button.png';
const BREAKER_SFX = '/breaker-on.mp3';
const DIESEL_SFX = '/diesel-start.mp3';
const IGNITION_TO_VIDEO_MS = 2600;
const DIESEL_DELAY_MS = 250;
const LIGHTS_ON_AT_S = 8.0;
const DIESEL_FADE_MS = 600;

const COLOR_RED = '#ff3b30';
const COLOR_AMBER = '#ffbf3a';
const COLOR_GREEN = '#3bd67a';
const COLOR_MUTED = 'rgba(255, 255, 255, 0.28)';

const READOUT_TARGET = { power: 412, voltage: 415, ampere: 716 };
const READOUT_RAMP_MS = 1800;
const BACKUP_ONLINE_DELAY_MS = 1000;
const AUTOSTART_COMPLETE_DELAY_MS = 1600;

type StatusLineState = { state: string; color: string };

const HERO_CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.5 },
  },
};

const HERO_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const NAV_LINKS = [
  { label: 'Products', href: '/products' },
  { label: 'Applications', href: '/applications' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact Us', href: '/contact' },
];

const INTRO_SEEN_KEY = "pz:introSeen";

export default function Home() {
  // Initialize all state to "intro complete" by default; on the first
  // visit we override to false in a useEffect below. This lets us SSR
  // a stable initial render and only deviate on the client where we can
  // actually read sessionStorage. The trade-off is the very first paint
  // shows the post-video hero for one frame before flipping back to the
  // ignition state on a fresh visit; mitigated by `firstVisitChecked`
  // which keeps everything hidden until we know.
  const [firstVisitChecked, setFirstVisitChecked] = useState(false);
  const [introSeen, setIntroSeen] = useState(true);
  const [hasPressed, setHasPressed] = useState(true);
  const [hasLitUp, setHasLitUp] = useState(true);
  const [videoEnded, setVideoEnded] = useState(true);
  const [readings, setReadings] = useState({
    power: READOUT_TARGET.power,
    voltage: READOUT_TARGET.voltage,
    ampere: READOUT_TARGET.ampere,
  });
  const [backupStatus, setBackupStatus] = useState<StatusLineState>({
    state: 'ONLINE',
    color: COLOR_GREEN,
  });
  const [autoStartStatus, setAutoStartStatus] = useState<StatusLineState>({
    state: 'COMPLETE',
    color: COLOR_GREEN,
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const breakerAudioRef = useRef<HTMLAudioElement | null>(null);
  const dieselAudioRef = useRef<HTMLAudioElement | null>(null);
  const dieselStoppedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  // Decide whether to play the intro on this mount. If the user has
  // never seen it (sessionStorage), reset to ignition-button state and
  // let them press it; otherwise leave the post-video hero visible. The
  // sessionStorage key is set once the video finishes (or once they hit
  // the ignition button — we don't want to replay the whole sequence
  // if they navigate away and come back mid-intro).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem(INTRO_SEEN_KEY) === "true";
    if (!seen) {
      setIntroSeen(false);
      setHasPressed(false);
      setHasLitUp(false);
      setVideoEnded(false);
      setReadings({ power: 0, voltage: 0, ampere: 0 });
      setBackupStatus({ state: "STANDBY", color: COLOR_AMBER });
      setAutoStartStatus({ state: "READY", color: COLOR_AMBER });
    }
    setFirstVisitChecked(true);
  }, []);

  useEffect(() => {
    // Skip the play call entirely once the intro has been seen — the
    // video element renders only as a static poster background in that
    // case (see the conditional `src` and `preload` on the <video>).
    if (!hasLitUp || introSeen) return;
    const video = videoRef.current;
    if (!video) return;

    const result = video.play();
    if (result && typeof result.then === 'function') {
      result.catch(() => {
        console.warn(
          'PowerZone intro: video autoplay was blocked (possible iOS Low Power Mode).',
        );
      });
    }
  }, [hasLitUp, introSeen]);

  useEffect(() => {
    const breaker = new Audio(BREAKER_SFX);
    const diesel = new Audio(DIESEL_SFX);
    breaker.preload = 'auto';
    diesel.preload = 'auto';
    breakerAudioRef.current = breaker;
    dieselAudioRef.current = diesel;

    return () => {
      breaker.pause();
      diesel.pause();
    };
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    if (!hasPressed) return;
    const startTime = performance.now();
    let rafId = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / READOUT_RAMP_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setReadings({
        power: Math.round(READOUT_TARGET.power * eased),
        voltage: Math.round(READOUT_TARGET.voltage * eased),
        ampere: Math.round(READOUT_TARGET.ampere * eased),
      });
      if (t < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [hasPressed]);

  const fadeOutDiesel = () => {
    const audio = dieselAudioRef.current;
    if (!audio) return;
    const startVol = audio.volume;
    const steps = 20;
    const stepMs = DIESEL_FADE_MS / steps;
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      audio.volume = Math.max(0, startVol * (1 - i / steps));
      if (i >= steps) {
        window.clearInterval(id);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = startVol;
      }
    }, stepMs);
    timersRef.current.push(id);
  };

  const handleVideoTimeUpdate = () => {
    if (dieselStoppedRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime >= LIGHTS_ON_AT_S) {
      dieselStoppedRef.current = true;
      fadeOutDiesel();
    }
  };

  const handleIgnition = () => {
    if (hasPressed) return;
    setHasPressed(true);

    // Once the user pulls the trigger we consider the intro "seen" —
    // bouncing to /products and back shouldn't replay it.
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "true");
    } catch {
      /* sessionStorage unavailable — non-fatal */
    }

    breakerAudioRef.current?.play().catch(() => {
      console.warn('PowerZone intro: breaker sound blocked by browser.');
    });

    const dieselTimer = window.setTimeout(() => {
      dieselAudioRef.current?.play().catch(() => {
        console.warn('PowerZone intro: diesel sound blocked by browser.');
      });
    }, DIESEL_DELAY_MS);
    timersRef.current.push(dieselTimer);

    const backupTimer = window.setTimeout(() => {
      setBackupStatus({ state: 'ONLINE', color: COLOR_GREEN });
    }, BACKUP_ONLINE_DELAY_MS);
    timersRef.current.push(backupTimer);

    const autoStartTimer = window.setTimeout(() => {
      setAutoStartStatus({ state: 'COMPLETE', color: COLOR_GREEN });
    }, AUTOSTART_COMPLETE_DELAY_MS);
    timersRef.current.push(autoStartTimer);

    const handoff = window.setTimeout(
      () => setHasLitUp(true),
      IGNITION_TO_VIDEO_MS,
    );
    timersRef.current.push(handoff);
  };

  // Render-gate. While `firstVisitChecked` is false we don't yet know
  // whether to play the intro or skip to the post-video hero — show a
  // black screen so the wrong state doesn't flash for a frame.
  if (!firstVisitChecked) {
    return <div className="w-screen h-screen bg-black" />;
  }

  return (
    <>
      <div className="relative w-screen h-screen overflow-hidden bg-black">
        <AnimatePresence>
        {!hasLitUp && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 z-20 bg-black"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at center, #1a1a1a 0%, #000000 70%)',
              }}
            />

            {/* Top-left logo (hidden until ignition is pressed) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              src={LOGO_ON_DARK}
              alt="PowerZone — Engineering & Services"
              draggable={false}
              initial={false}
              animate={{ opacity: hasPressed ? 1 : 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="pointer-events-none absolute left-[clamp(16px,2.5vw,40px)] top-[clamp(16px,2.5vw,40px)] z-30 h-[clamp(72px,11vh,128px)] w-auto select-none"
            />

            {/* Top-right grid status */}
            <div className="absolute right-[clamp(16px,2.5vw,40px)] top-[clamp(20px,2.8vh,48px)] z-30 flex items-center gap-3 font-mono text-[clamp(9px,1.1vh,11px)] uppercase tracking-[0.3em]">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: COLOR_RED,
                  boxShadow: `0 0 10px ${COLOR_RED}99`,
                }}
              />
              <span style={{ color: COLOR_RED }}>Grid Status: Offline</span>
            </div>

            {/* Ignition button + readout panel */}
            <div className="absolute inset-0 flex items-center justify-center gap-[clamp(32px,8vw,80px)]">
              <IgnitionButton
                onPress={handleIgnition}
                disabled={hasPressed}
              />
              <ReadoutPanel
                power={readings.power}
                voltage={readings.voltage}
                ampere={readings.ampere}
              />
            </div>

            {/* Bottom-center status lines */}
            <div className="absolute bottom-[clamp(72px,12vh,112px)] left-1/2 z-30 -translate-x-1/2 space-y-2.5">
              <StatusLine
                label="Grid Supply"
                state="FAILED"
                color={COLOR_RED}
              />
              <StatusLine
                label="Backup System"
                state={backupStatus.state}
                color={backupStatus.color}
              />
              <StatusLine
                label="Auto-Start Sequence"
                state={autoStartStatus.state}
                color={autoStartStatus.color}
              />
            </div>

            {/* Footer */}
            <div className="absolute bottom-[clamp(20px,3.5vh,32px)] left-1/2 z-30 -translate-x-1/2 font-mono text-[clamp(8px,1vh,10px)] uppercase tracking-[0.3em] text-white/25">
              Power Zone Emergency Management System v2.4
            </div>
          </motion.div>
        )}

        {hasLitUp && (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 z-10"
          >
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover [transition:opacity_1200ms_ease-out]"
              style={{ opacity: videoEnded ? 0.2 : 1 }}
              // Skip the video source entirely once the intro has been
              // seen — the <video> renders just the poster as a static
              // background, which matches the post-intro hero state.
              src={introSeen ? undefined : "/poweron.mp4"}
              poster="/images/intro-poster.jpg"
              muted
              playsInline
              autoPlay={!introSeen}
              preload={introSeen ? "none" : "auto"}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={() => {
                setVideoEnded(true);
                // Persist for the rest of the session so navigating away
                // and back to "/" doesn't replay the ignition + video.
                try {
                  sessionStorage.setItem(INTRO_SEEN_KEY, "true");
                } catch {
                  /* sessionStorage unavailable — non-fatal */
                }
              }}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_ON_DARK}
              alt="PowerZone"
              draggable={false}
              className="pointer-events-none absolute left-[clamp(12px,2vw,32px)] top-[clamp(8px,1.5vh,20px)] z-40 h-[clamp(40px,6vh,72px)] w-auto select-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]"
            />

            {videoEnded && (
              <>
                {/* Full-width top navbar (logo overlays this via higher z-index) */}
                <motion.nav
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    absolute left-0 right-0 top-0 z-30 h-24
                    bg-black/30 backdrop-blur-md
                    border-b border-white/10
                  "
                >
                  <div
                    className="
                      flex h-full items-center justify-center gap-3
                      text-sm font-bold uppercase tracking-[0.24em]
                      text-white
                      [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]
                    "
                  >
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="
                          cursor-pointer
                          rounded-full px-5 py-2
                          transition-colors duration-300
                          hover:bg-red-500/55
                        "
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </motion.nav>

                {/* Hero punchline */}
                <motion.div
                  variants={HERO_CONTAINER_VARIANTS}
                  initial="hidden"
                  animate="show"
                  className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center"
                >
                  <motion.span
                    variants={HERO_ITEM_VARIANTS}
                    className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.42em] text-white/70 [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]"
                  >
                    Power Zone
                  </motion.span>
                  <motion.h1
                    variants={HERO_ITEM_VARIANTS}
                    className="mt-5 font-semibold leading-[0.95] text-[clamp(40px,5.5vw,84px)] tracking-[-0.02em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]"
                  >
                    Diesel Generators
                    <br />
                    by Power Zone
                  </motion.h1>
                  <motion.p
                    variants={HERO_ITEM_VARIANTS}
                    className="mt-5 text-[12px] md:text-[14px] font-medium uppercase tracking-[0.34em] text-white/85 [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]"
                  >
                    Reliable Backup Power
                  </motion.p>
                  <motion.p
                    variants={HERO_ITEM_VARIANTS}
                    className="mt-8 max-w-[36rem] text-[14px] md:text-[15px] leading-relaxed text-white/75 [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]"
                  >
                    Power Zone delivers high performance diesel generators and
                    advanced battery energy storage systems, ensuring
                    uninterrupted power for industries across Pakistan.
                  </motion.p>
                </motion.div>

              </>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
      {videoEnded && <SolutionsSection />}
      {videoEnded && <ProcessSection />}
      {videoEnded && <GoalsSection />}
    </>
  );
}

function IgnitionButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      className="cursor-pointer select-none disabled:cursor-default"
      aria-label="Start engine"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BUTTON_IMG}
        alt=""
        draggable={false}
        className="pointer-events-none h-[clamp(140px,26vh,208px)] w-auto select-none drop-shadow-[0_10px_30px_rgba(220,38,38,0.28)]"
      />
    </motion.button>
  );
}

function ReadoutPanel({
  power,
  voltage,
  ampere,
}: {
  power: number;
  voltage: number;
  ampere: number;
}) {
  return (
    <div
      className="relative px-[clamp(20px,3vw,40px)] py-[clamp(14px,2.5vh,28px)] font-mono"
      style={{
        border: `1px solid ${COLOR_AMBER}66`,
        boxShadow: `0 0 26px ${COLOR_AMBER}14, inset 0 0 24px rgba(0, 0, 0, 0.35)`,
        backgroundColor: 'rgba(30, 22, 6, 0.35)',
      }}
    >
      <ReadoutRow label="Power" value={power.toString()} unit="kW" />
      <ReadoutRow label="Voltage" value={voltage.toString()} unit="V" />
      <ReadoutRow label="Ampere" value={ampere.toString()} unit="A" last />
    </div>
  );
}

function ReadoutRow({
  label,
  value,
  unit,
  last,
}: {
  label: string;
  value: string;
  unit: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-[clamp(28px,5vw,56px)] ${
        last ? '' : 'mb-5'
      }`}
    >
      <span
        className="text-[11px] font-medium uppercase tracking-[0.32em]"
        style={{ color: `${COLOR_AMBER}cc` }}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span
          className="text-[clamp(20px,3.6vh,30px)] font-bold tabular-nums"
          style={{
            color: COLOR_AMBER,
            textShadow: `0 0 14px ${COLOR_AMBER}66`,
          }}
        >
          {value}
        </span>
        <span
          className="text-[11px] uppercase tracking-[0.2em]"
          style={{ color: `${COLOR_AMBER}99` }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

function StatusLine({
  label,
  state,
  color,
}: {
  label: string;
  state: string;
  color: string;
}) {
  return (
    <div className="flex w-[clamp(280px,38vw,460px)] items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em]">
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 shrink-0"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}99`,
          transition:
            'background-color 600ms ease-out, box-shadow 600ms ease-out',
        }}
      />
      <span className="text-white/80">{label}</span>
      <span
        aria-hidden
        className="flex-1 translate-y-[-3px] border-b border-dotted"
        style={{ borderColor: COLOR_MUTED }}
      />
      <span style={{ color, transition: 'color 600ms ease-out' }}>
        {state}
      </span>
    </div>
  );
}
