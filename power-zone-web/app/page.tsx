'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type DotColor = 'red' | 'yellow' | 'green';

const BOOT_LINES = ['POWER GRID', 'FUEL SYSTEM', 'IGNITION'] as const;

const DOT_PALETTE: Record<DotColor, { bg: string; glow: string }> = {
  red: { bg: '#ff3b3b', glow: 'rgba(255, 59, 59, 0.55)' },
  yellow: { bg: '#ffd23b', glow: 'rgba(255, 210, 59, 0.65)' },
  green: { bg: '#3bff7a', glow: 'rgba(59, 255, 122, 0.70)' },
};

const BOOT_SCHEDULE: Array<[index: number, color: DotColor, atMs: number]> = [
  [0, 'yellow', 350],
  [0, 'green', 1100],
  [1, 'yellow', 1450],
  [1, 'green', 2200],
  [2, 'yellow', 2550],
  [2, 'green', 3300],
];
const BOOT_HANDOFF_MS = 4100;

const LOGO_ON_DARK = '/images/logo-on-dark.png';

export default function Home() {
  const [hasLitUp, setHasLitUp] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [dotColors, setDotColors] = useState<DotColor[]>(['red', 'red', 'red']);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!hasLitUp) return;
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
  }, [hasLitUp]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const handleLightUp = () => {
    if (isBooting) return;
    setIsBooting(true);

    BOOT_SCHEDULE.forEach(([index, color, atMs]) => {
      const t = window.setTimeout(() => {
        setDotColors((prev) => {
          const next = [...prev];
          next[index] = color;
          return next;
        });
      }, atMs);
      timersRef.current.push(t);
    });

    const handoff = window.setTimeout(() => setHasLitUp(true), BOOT_HANDOFF_MS);
    timersRef.current.push(handoff);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <AnimatePresence>
        {!hasLitUp && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-10 bg-black"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at center, #1a1a1a 0%, #000000 70%)',
              }}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              src={LOGO_ON_DARK}
              alt="PowerZone — Engineering & Services"
              draggable={false}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="relative z-10 h-28 w-auto select-none"
            />

            <motion.button
              type="button"
              onClick={handleLightUp}
              disabled={isBooting}
              animate={{ opacity: isBooting ? 0 : 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="
                relative z-10 cursor-pointer
                px-12 py-4
                text-sm font-medium uppercase tracking-[0.3em]
                text-white
                border border-white/40 bg-transparent
                transition-colors duration-500
                hover:bg-white/10 hover:border-white/80
                hover:[text-shadow:0_0_12px_rgba(255,255,255,0.65)]
                disabled:pointer-events-none
              "
            >
              Light Up
            </motion.button>

            <div className="relative z-10 space-y-3">
              {BOOT_LINES.map((label, i) => {
                const palette = DOT_PALETTE[dotColors[i]];
                return (
                  <div
                    key={label}
                    className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.3em] text-white/70"
                  >
                    <span
                      aria-hidden
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: palette.bg,
                        boxShadow: `0 0 10px ${palette.glow}`,
                        transition:
                          'background-color 700ms ease-out, box-shadow 700ms ease-out',
                      }}
                    />
                    <span>{label}</span>
                  </div>
                );
              })}
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
              className="absolute inset-0 w-full h-full object-cover"
              src="/poweron.mp4"
              poster="/images/intro-poster.jpg"
              muted
              playsInline
              autoPlay
              preload="auto"
              onEnded={() => setVideoEnded(true)}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_ON_DARK}
              alt="PowerZone"
              draggable={false}
              className="pointer-events-none absolute left-8 top-8 z-30 h-14 w-auto select-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]"
            />

            <AnimatePresence>
              {videoEnded && (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.35, ease: 'easeOut' }}
                  className="absolute inset-x-0 bottom-16 z-20 flex justify-center"
                >
                  <Link
                    href="/products"
                    className="
                      cursor-pointer
                      px-12 py-4
                      text-sm font-medium uppercase tracking-[0.3em]
                      text-white
                      border border-white/40 bg-transparent
                      transition-all duration-500
                      hover:bg-white/10 hover:border-white/80
                      hover:[text-shadow:0_0_12px_rgba(255,255,255,0.65)]
                    "
                  >
                    View Products
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
