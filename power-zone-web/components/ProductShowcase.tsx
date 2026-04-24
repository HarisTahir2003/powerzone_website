"use client";

/* -----------------------------------------------------------------------------
 * ProductShowcase
 *
 * Cinematic, scroll-pinned product reveal inspired by
 * https://www.mersi-architecture.com/
 *
 * Seamless loop trick: we render the products array with products[0] appended
 * at the end of every reel/card stack. That adds a 5th "clone" slide (FPT')
 * that's visually identical to the first. The timeline now runs N transitions
 * (FPT → Perkins → Cummins → Yuchai → FPT') so scrolling past the last real
 * product lands you back on FPT — no jarring reset.
 *
 * TIMING KNOBS
 *   REST_VH          = 0     // dwell time between transitions
 *   TRANSITION_VH    = 220   // scroll distance of one product-to-product swap
 *   CARD_VH          = 14    // MUST match block height in ProductCard.tsx
 *   SCRUB            = 1.0   // higher = more smoothing between scroll & tween
 *
 * NAV INTEGRATION
 *   ProductNav dispatches CustomEvent<"pz:scrollToProduct"> with { index }.
 *   We catch it here and use Lenis.scrollTo to animate the page scroll to
 *   that product's position in the pinned timeline.
 * -------------------------------------------------------------------------- */

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/hooks/useLenis";
import { products } from "@/data/products";
import ImageReel from "./ImageReel";
import SpecReel from "./SpecReel";
import ProductCard from "./ProductCard";

const REST_VH = 0;
const TRANSITION_VH = 220;
const CARD_VH = 14;
const SCRUB = 1.0;
const ST_ID = "pz-products-timeline";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProductShowcase() {
  const lenisRef = useLenis();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const leftReelRef = useRef<HTMLDivElement | null>(null);
  const rightReelRef = useRef<HTMLDivElement | null>(null);
  const cardStackRef = useRef<HTMLDivElement | null>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Append a clone of the first product to create the seamless loop end-state.
  const displayProducts = [...products, products[0]];
  const N = products.length; // number of real transitions (clone sits at end)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const totalVH = N * REST_VH + N * TRANSITION_VH;

      // Right reel is rendered reversed; initial y parks it so the LAST item
      // in its reversed stack (which is products[0]) is visible.
      gsap.set(rightReelRef.current, { y: `-${N * 100}vh` });

      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

      let pos = REST_VH;

      for (let i = 0; i < N; i++) {
        const leftTarget = `-${(i + 1) * 100}vh`;
        const rightTarget = `-${(N - 1 - i) * 100}vh`;
        const cardTarget = `-${(i + 1) * CARD_VH}vh`;

        tl.to(
          leftReelRef.current,
          { y: leftTarget, duration: TRANSITION_VH },
          pos,
        );
        tl.to(
          rightReelRef.current,
          { y: rightTarget, duration: TRANSITION_VH },
          pos,
        );
        tl.to(
          cardStackRef.current,
          { y: cardTarget, duration: TRANSITION_VH },
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

      tl.to({}, { duration: 0 }, totalVH);

      ScrollTrigger.create({
        id: ST_ID,
        trigger: pinRef.current,
        start: "top top",
        end: () => `+=${(totalVH * window.innerHeight) / 100}`,
        pin: true,
        scrub: SCRUB,
        animation: tl,
        invalidateOnRefresh: true,
        snap: {
          snapTo: 1 / N,
          duration: { min: 0.4, max: 1.0 },
          ease: "power2.inOut",
          delay: 0.1,
          directional: false,
        },
        // Seamless infinite loop — teleport scroll back to the opposite
        // boundary when the user exits the pinned range. Because progress 0
        // (FPT) and progress 1 (FPT') render the same frame, the teleport is
        // visually invisible and the scroll velocity carries through.
        onLeave: (self) => {
          lenisRef.current?.scrollTo(self.start, {
            immediate: true,
            force: true,
          });
        },
        onLeaveBack: (self) => {
          lenisRef.current?.scrollTo(self.end, {
            immediate: true,
            force: true,
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [N]);

  // ProductNav dispatches a CustomEvent that tells us which product to jump to.
  // We translate the product index into a scroll position inside the pinned
  // range and hand it off to Lenis for a smooth animated scroll.
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ index: number }>;
      const index = ce.detail?.index;
      if (typeof index !== "number") return;

      const st = ScrollTrigger.getById(ST_ID);
      if (!st) return;

      const progress = index / N;
      const target = st.start + progress * (st.end - st.start);
      lenisRef.current?.scrollTo(target, { duration: 1.6 });
    };

    window.addEventListener("pz:scrollToProduct", handler);
    return () => window.removeEventListener("pz:scrollToProduct", handler);
  }, [N, lenisRef]);

  return (
    <section ref={containerRef} className="relative">
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden">
        {/* Left reel — image side (natural order, translates UP) */}
        <div className="absolute inset-y-0 left-0 w-full md:w-1/2 overflow-hidden">
          <ImageReel ref={leftReelRef} products={displayProducts} />
        </div>

        {/* Right reel — spec side (reversed stack, translates DOWN) */}
        <div className="hidden md:block absolute inset-y-0 right-0 w-1/2 overflow-hidden">
          <SpecReel ref={rightReelRef} products={displayProducts} reversed />
        </div>

        {/* Pinned center card */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="pointer-events-auto">
            <ProductCard
              products={displayProducts}
              stackRef={cardStackRef}
              textRefs={textRefs}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
