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
 *   REST_VH          = 100   // scroll distance a product sits still
 *   TRANSITION_VH    = 20    // scroll distance of the hand-off between products
 *   STAGGER_FRACTION = 0.15  // right reel lag as a fraction of TRANSITION_VH
 *                            // (0.15 ≈ 80–150ms of feel at typical scroll speeds)
 *   CARD_VH          = 40    // must match block height in ProductCard.tsx
 *
 * Easings:
 *   left reel  : power2.inOut   (symmetric, anchors the motion)
 *   right reel : power2.out     (lags into place — asymmetry with left)
 *   card stack : power2.inOut   (matches the left reel feel)
 *   text (out) : power2.in      (accelerates off-screen)
 *   text (in)  : power2.out     (decelerates into place)
 * -------------------------------------------------------------------------- */

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/hooks/useLenis";
import { products } from "@/data/products";
import ImageReel from "./ImageReel";
import ProductCard from "./ProductCard";

const REST_VH = 100;
const TRANSITION_VH = 20;
const STAGGER_FRACTION = 0.15;
const CARD_VH = 40;

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
      const totalVH =
        products.length * REST_VH + (products.length - 1) * TRANSITION_VH;
      const staggerOffset = TRANSITION_VH * STAGGER_FRACTION;

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
      });

      let pos = REST_VH; // first transition starts after initial rest

      for (let i = 0; i < products.length - 1; i++) {
        const reelTarget = `-${(i + 1) * 100}vh`;
        const cardTarget = `-${(i + 1) * CARD_VH}vh`;

        tl.to(
          leftReelRef.current,
          { y: reelTarget, duration: TRANSITION_VH, ease: "power2.inOut" },
          pos,
        );
        tl.to(
          rightReelRef.current,
          { y: reelTarget, duration: TRANSITION_VH, ease: "power2.out" },
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

      // Pad the timeline to the full scroll length so scrub mapping is 1:1
      tl.to({}, { duration: 0 }, totalVH);

      ScrollTrigger.create({
        trigger: pinRef.current,
        start: "top top",
        end: () => `+=${(totalVH * window.innerHeight) / 100}`,
        pin: true,
        scrub: 1,
        animation: tl,
        invalidateOnRefresh: true,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative">
      <div
        ref={pinRef}
        className="relative h-screen w-full overflow-hidden"
      >
        {/* Left reel — full viewport on mobile, 50% on desktop */}
        <div className="absolute inset-y-0 left-0 w-full md:w-1/2 overflow-hidden">
          <ImageReel ref={leftReelRef} products={products} side="left" />
        </div>

        {/* Right reel — hidden below md; the left reel takes the full width */}
        <div className="hidden md:block absolute inset-y-0 right-0 w-1/2 overflow-hidden">
          <ImageReel ref={rightReelRef} products={products} side="right" />
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
