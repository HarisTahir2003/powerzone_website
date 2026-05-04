'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { useMemo, useRef } from 'react';

// ───────────────────────────────────────────────────────────────────────────
// PROCESS STEPS — EDIT THIS ARRAY TO CHANGE TEXT AND IMAGES
// ───────────────────────────────────────────────────────────────────────────
//   • titlePrimary : sans-serif uppercase part of the title (e.g. "Upload Your")
//   • titleAccent  : italic serif part of the title rendered on its own line
//                    below `titlePrimary` (e.g. "Artwork")
//   • description  : supporting paragraph below the title
//   • imageSrc     : path to right-side image. Leave as '' for an empty
//                    placeholder. Once you drop a file into /public/images/
//                    set this to e.g. '/images/step-1.png'.
// ───────────────────────────────────────────────────────────────────────────
type ProcessStep = {
  titlePrimary: string;
  titleAccent: string;
  description: string;
  imageSrc: string;
};

const PROCESS_STEPS: ProcessStep[] = [
  {
    titlePrimary: 'Utility',
    titleAccent: 'Companies',
    description:
      'Backup solutions that bridge supply gaps and enhance grid reliability.',
    imageSrc: '/images/utility.png',
  },
  {
    titlePrimary: 'Data',
    titleAccent: 'Data Centers',
    description:
      "Uninterrupted power, built for zero-failure environments.",
    imageSrc: '/images/datacenter.png',
  },
  {
    titlePrimary: 'Commercial',
    titleAccent: 'Buildings',
    description:
      'Reliable backup to reduce downtime and energy costs.',
    imageSrc: '/images/commercial.png',
  },
  {
    titlePrimary: 'Government',
    titleAccent: 'Solutions',
    description:
      'Reliable power for essential public infrastructure.',
    imageSrc: '/images/government.png',
  },
  {
    titlePrimary: 'Residential',
    titleAccent: 'Developers',
    description:
      'Energy systems for high-end homes and off-grid developments.',
    imageSrc: '/images/residential.png',
  },
];

// ───────────────────────────────────────────────────────────────────────────
// SCROLL SPEED KNOB
// ───────────────────────────────────────────────────────────────────────────
// How many viewport heights of scroll each step consumes.
// Higher = SLOWER (more scrolling per card transition).
// Lower  = FASTER (less scrolling per card transition).
//   60  → snappy
//   100 → balanced (current)
//   140 → slow / cinematic
const SECTION_VH_PER_STEP = 100;

// ───────────────────────────────────────────────────────────────────────────
// LOOK / DEPTH KNOBS
// ───────────────────────────────────────────────────────────────────────────
// "Off-screen below" — how far below center each card waits before its turn.
// Plain pixels (avoids the mixed-unit interpolation issue strings can hit).
const OFF_SCREEN_Y = 1000;

// As newer cards arrive, older cards "recede into the background". Per level
// (1 level = 1 card behind the front card) we shift up, scale down, and fade.
const RECEDE_Y = 0;         // px shift per level (set to 0 so receded cards stay hidden behind the front card; bump to e.g. 18 only if you want previous cards' tops to peek above)
const RECEDE_SCALE = 0.05;  // scale shrink per level   (level 1 = 0.95)
const RECEDE_OPACITY = 0.0; // opacity drop per level   (level 1 = 0.7)

export default function ProcessSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section
      ref={containerRef}
      className="relative bg-[#0F0F0F]"
      style={{ height: `${PROCESS_STEPS.length * SECTION_VH_PER_STEP}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* Section header */}
        <div className="px-6 pt-16 pb-4 text-center md:pt-20 md:pb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-red-500">
            Our Solutions
          </p>
          <h2 className="mx-auto mt-4 max-w-[60rem] text-[clamp(24px,3.2vw,46px)] font-semibold leading-[1.1] tracking-tight text-white">
            Power &amp; Backup Solutions for Industry-Specific Demands
          </h2>
          <p className="mx-auto mt-5 max-w-[44rem] text-[14px] leading-relaxed text-white/65 md:text-[15px]">
            Engineered to perform, trusted by industries across Pakistan and
            beyond. Discover resilient power systems tailored to your
            operational needs — with support you can count on.
          </p>
        </div>

        {/* Cards container — `flex-1` fills the remaining viewport below the
         * header. Each ProcessCard is `absolute inset-0` inside this slot,
         * so the card height is naturally smaller than before. */}
        <div className="relative flex-1">
          {PROCESS_STEPS.map((step, i) => (
            <ProcessCard
              key={`${step.titlePrimary}-${i}`}
              step={step}
              index={i}
              total={PROCESS_STEPS.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessCard({
  step,
  index,
  total,
  scrollYProgress,
}: {
  step: ProcessStep;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Build keyframes for this card. We sample one checkpoint per card
  // ("active=i" at progress i/(total-1)) and at each checkpoint figure out
  // this card's "level" — how many cards have entered AFTER this one.
  //   level < 0  → hasn't entered yet (sits below screen)
  //   level == 0 → at the front
  //   level > 0  → receded behind (smaller, fainter, slightly higher)
  const transformConfig = useMemo(() => {
    const inputs: number[] = [];
    const yValues: number[] = [];
    const scaleValues: number[] = [];
    const opacityValues: number[] = [];

    for (let i = 0; i < total; i++) {
      inputs.push(i / (total - 1));
      const level = i - index;

      if (level < 0) {
        // Hasn't entered at this checkpoint
        yValues.push(OFF_SCREEN_Y);
        scaleValues.push(1);
        opacityValues.push(0);
      } else {
        // Front (level 0) or receded (level > 0)
        yValues.push(-level * RECEDE_Y);
        scaleValues.push(1 - level * RECEDE_SCALE);
        opacityValues.push(Math.max(0, 1 - level * RECEDE_OPACITY));
      }
    }

    return { inputs, yValues, scaleValues, opacityValues };
  }, [index, total]);

  const y = useTransform(
    scrollYProgress,
    transformConfig.inputs,
    transformConfig.yValues,
  );
  const scale = useTransform(
    scrollYProgress,
    transformConfig.inputs,
    transformConfig.scaleValues,
  );
  const opacity = useTransform(
    scrollYProgress,
    transformConfig.inputs,
    transformConfig.opacityValues,
  );

  return (
    <motion.div
      initial={{
        y: index === 0 ? 0 : OFF_SCREEN_Y,
        scale: 1,
        opacity: index === 0 ? 1 : 0,
      }}
      style={{ y, scale, opacity, zIndex: 10 + index }}
      className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-6 md:px-10 md:py-10"
    >
      <div
        className="
          pointer-events-auto
          relative grid h-full w-full max-w-[1400px]
          grid-cols-1 md:grid-cols-2
          overflow-hidden rounded-[2rem]
          border border-white/10
          bg-[#1A1A1A]
        "
      >
        {/* Text side */}
        <div className="flex flex-col justify-between p-10 md:p-16">
          {/* Step number — italic serif */}
          <div className="font-serif italic leading-none text-white/65 text-[clamp(56px,7vw,120px)]">
            {String(index + 1).padStart(2, '0')}
          </div>

          {/* Title + description sit at the bottom */}
          <div className="max-w-[34rem]">
            <h3
              className="font-bold uppercase leading-[1.02] tracking-tight text-white text-[clamp(28px,3.4vw,56px)]"
              style={{ letterSpacing: '-0.01em' }}
            >
              {step.titlePrimary}
              <br />
              <span className="font-serif italic font-normal">
                {step.titleAccent}
              </span>
            </h3>
            <p className="mt-6 text-[15px] md:text-[17px] leading-relaxed text-white/70">
              {step.description}
            </p>
          </div>
        </div>

        {/* Image side — empty until imageSrc is set on the step above */}
        <div className="relative hidden bg-[#0E0E0E] md:block">
          {step.imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={step.imageSrc}
              alt={`${step.titlePrimary} ${step.titleAccent}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
