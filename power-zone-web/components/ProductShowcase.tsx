"use client";

/* -----------------------------------------------------------------------------
 * ProductShowcase
 *
 * Cinematic, scroll-pinned product reveal inspired by
 * https://www.mersi-architecture.com/
 *
 * TIMING KNOBS — tweak these to retune the feel. All values are in "vh units
 * of scroll" (scrub maps them 1:1 to actual scroll distance).
 *
 *   REST_VH          = 0     // dwell time between transitions (0 = chain them)
 *   TRANSITION_VH    = 200   // scroll distance of one product-to-product swap
 *   STAGGER_FRACTION = 0     // reel stagger (0 = reels move in lock-step)
 *   CARD_VH          = 14    // MUST match block height in ProductCard.tsx
 *
 * Directions:
 *   left reel  : translates UP       (new image slides in from below)
 *   right reel : translates DOWN     (reversed stack; new image slides in from above)
 *   card stack : translates UP       (in sync with left reel)
 *
 * Easings:
 *   left reel  : power2.inOut   (symmetric — both reels must match for sync)
 *   right reel : power2.inOut   (same as left, no asymmetry)
 *   card stack : power2.inOut
 *   text (out) : power2.in      (accelerates off-screen)
 *   text (in)  : power2.out     (decelerates into place)
 *
 * Scroll behaviour:
 *   - `scrub: 0.5`  → near-immediate response with slight smoothing.
 *   - `snap` with `directional: false` → once the user stops scrolling, the
 *      timeline eases to the nearest transition boundary. Past the halfway
 *      point it completes the swap; under halfway it returns to the prior
 *      product.
 * -------------------------------------------------------------------------- */

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/hooks/useLenis";
import { products } from "@/data/products";
import ImageReel from "./ImageReel";
import SpecReel from "./SpecReel";
import ProductCard from "./ProductCard";

const REST_VH = 0;
const TRANSITION_VH = 200;
const STAGGER_FRACTION = 0;
const CARD_VH = 14;

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProductShowcase() {
  useLenis();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const leftReelRef = useRef<HTMLDivElement | null>(null);
  const rightReelRef = useRef<HTMLDivElement | null>(null);
  const cardStackRef = useRef<HTMLDivElement | null>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const N = products.length;
      const totalVH = N * REST_VH + (N - 1) * TRANSITION_VH;
      const staggerOffset = TRANSITION_VH * STAGGER_FRACTION;

      // Right reel is rendered in reverse order — position it so the LAST image
      // (product 0, since it's flipped) is visible initially. As the timeline
      // progresses, this translates DOWN toward 0.
      gsap.set(rightReelRef.current, { y: `-${(N - 1) * 100}vh` });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
      });

      let pos = REST_VH; // first transition begins after the (optional) initial rest

      for (let i = 0; i < N - 1; i++) {
        const leftTarget = `-${(i + 1) * 100}vh`;
        const rightTarget = `-${(N - 2 - i) * 100}vh`; // moves DOWN, toward 0
        const cardTarget = `-${(i + 1) * CARD_VH}vh`;

        tl.to(
          leftReelRef.current,
          { y: leftTarget, duration: TRANSITION_VH, ease: "power2.inOut" },
          pos,
        );
        tl.to(
          rightReelRef.current,
          { y: rightTarget, duration: TRANSITION_VH, ease: "power2.inOut" },
          pos + staggerOffset,
        );
        tl.to(
          cardStackRef.current,
          { y: cardTarget, duration: TRANSITION_VH, ease: "power2.inOut" },
          pos,
        );

        const outText = textRefs.current[i];
        const inText = textRefs.current[i + 1];
        if (outText) {
          tl.to(
            outText,
            {
              y: "-30%",
              opacity: 0.25,
              duration: TRANSITION_VH,
              ease: "power2.in",
            },
            pos,
          );
        }
        if (inText) {
          tl.fromTo(
            inText,
            { y: "30%", opacity: 0.25 },
            {
              y: "0%",
              opacity: 1,
              duration: TRANSITION_VH,
              ease: "power2.out",
            },
            pos,
          );
        }

        pos += TRANSITION_VH + REST_VH;
      }

      // Pad timeline so scrub maps 1:1 to the full scroll length
      tl.to({}, { duration: 0 }, totalVH);

      ScrollTrigger.create({
        trigger: pinRef.current,
        start: "top top",
        end: () => `+=${(totalVH * window.innerHeight) / 100}`,
        pin: true,
        scrub: 0.5,
        animation: tl,
        invalidateOnRefresh: true,
        snap: {
          snapTo: 1 / (N - 1),
          duration: { min: 0.25, max: 0.6 },
          ease: "power2.inOut",
          delay: 0.05,
          directional: false,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [products]);

  return (
    <section ref={containerRef} className="relative">
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden">
        {/* Left reel — full viewport on mobile, 50% on desktop; natural order, translates UP */}
        <div className="absolute inset-y-0 left-0 w-full md:w-1/2 overflow-hidden">
          <ImageReel ref={leftReelRef} products={products} />
        </div>

        {/* Right reel — hidden below md; REVERSED stack, translates DOWN (initial y set in timeline) */}
        <div className="hidden md:block absolute inset-y-0 right-0 w-1/2 overflow-hidden">
          <SpecReel ref={rightReelRef} products={products} reversed />
        </div>

        {/* Pinned center card */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="pointer-events-auto">
            <ProductCard
              products={products}
              stackRef={cardStackRef}
              textRefs={textRefs}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
