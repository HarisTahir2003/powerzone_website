"use client";

/* -----------------------------------------------------------------------------
 * ProductExperience
 *
 * Single-tree state machine for the products experience. No route navigation.
 *
 * PHASES
 *   - 'showcase' : split-screen hero with vertical-wipe between products
 *                  (the existing wipe stack), center clickable card.
 *   - 'detail'   : horizontal-scroll product story with N panels, ending
 *                  with the next product's hero-style intro panel.
 *
 * TRANSITIONS
 *   - enterDetail(idx)   : choreographed multi-step GSAP timeline.
 *       1. Snap showcase scroll to the exact product index (no half-wiped state).
 *       2. Card clip-wipes bottom-up (disappears bottom-first).
 *       3. Right showcase panel clip-wipes top-down.
 *       4. Beat (~150ms).
 *       5. Detail right content reveals (reverse wipe — top inset shrinks).
 *          Concurrently the framed image scales in from 1.4 → 1.0.
 *       6. Title reveals letter-by-letter with a 40ms stagger.
 *       7. Showcase ScrollTrigger killed; detail ScrollTrigger created;
 *          scroll reset to 0; user is unlocked.
 *
 *   - exitToShowcase(nextIdx) : detail's ScrollTrigger fires onLeave when
 *       the user scrolls past the last horizontal panel. We fade the detail
 *       layer, kill the detail trigger, recreate the showcase trigger, and
 *       jump scroll to the next product's position. Phase flips back to
 *       'showcase'. Choreography is intentionally lighter than entry so the
 *       handoff feels like "scrolled into the next product" rather than a
 *       full reverse animation.
 *
 * SCROLL-TRIGGER LIFECYCLE
 *   We use a single pinned section (`showcasePinRef`) that hosts both
 *   layers. ScrollTrigger pins it for whichever range the current phase
 *   needs. Killing one and creating the other adjusts body height and pin
 *   spacer in one step. Lenis is stopped/started around each switch so
 *   wheel input doesn't carry through.
 * -------------------------------------------------------------------------- */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useLenis } from "@/hooks/useLenis";
import { products } from "@/data/products";
import ImageReel from "./ImageReel";
import SpecReel from "./SpecReel";
import ProductCard from "./ProductCard";
import {
  TextStaggerHover,
  TextStaggerHoverActive,
  TextStaggerHoverHidden,
} from "@/components/ui/text-stagger-hover";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const N = products.length;
const SHOWCASE_TRANSITION_VH = 220;
const SHOWCASE_CYCLES = 30;
const SHOWCASE_ST_ID = "pz-showcase";
const DETAIL_ST_ID = "pz-detail";
const DETAIL_PANELS = 4;

const EASE = "power3.inOut";
const FAST_EASE = "power3.out";

type Phase = "showcase" | "detail";

export default function ProductExperience() {
  const lenisRef = useLenis();

  const [phase, setPhase] = useState<Phase>("showcase");
  const [activeIdx, setActiveIdx] = useState(0);
  const [currentVisibleIdx, setCurrentVisibleIdx] = useState(0);

  const phaseRef = useRef<Phase>("showcase");
  const activeIdxRef = useRef(0);
  const currentVisibleIdxRef = useRef(0);
  const transitioningRef = useRef(false);
  phaseRef.current = phase;
  activeIdxRef.current = activeIdx;

  // ---- Refs ---------------------------------------------------------------
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Showcase
  const showcasePinRef = useRef<HTMLDivElement | null>(null);
  const showcaseLeftRef = useRef<HTMLDivElement | null>(null);
  const showcaseRightRef = useRef<HTMLDivElement | null>(null);
  const showcaseCardRef = useRef<HTMLElement | null>(null);
  const leftPanelsRef = useRef<(HTMLElement | null)[]>([]);
  const rightPanelsRef = useRef<(HTMLElement | null)[]>([]);
  const cardPanelsRef = useRef<(HTMLElement | null)[]>([]);
  // Per-panel inner text divs in SpecReel — kept around for future
  // text-only effects, not currently wiped (phase 2 wipes the whole
  // overlay so the colored panel goes too).
  const rightContentRefs = useRef<(HTMLElement | null)[]>([]);
  // Lighter rightColor + text overlay sitting above the showcase right's
  // dark base. Phase 2 wipes THIS so the dark base underneath is revealed.
  const showcaseRightOverlayRef = useRef<HTMLDivElement | null>(null);
  // Dummy refs for the SpecReel / ImageReel / ProductCard instances
  // used to render the static detail panels (panel 1 right, panel 4
  // hand-off). Their panelRefs APIs need an array but the elements are
  // never animated by the showcase scroll.
  const panel4CardRefs = useRef<(HTMLElement | null)[]>([]);
  const detailSpecRefs = useRef<(HTMLElement | null)[]>([]);
  const panel4ImageRefs = useRef<(HTMLElement | null)[]>([]);
  const panel4SpecRefs = useRef<(HTMLElement | null)[]>([]);

  // Detail
  const detailLayerRef = useRef<HTMLDivElement | null>(null);
  const detailFrameRef = useRef<HTMLDivElement | null>(null);
  const detailTitleRef = useRef<HTMLHeadingElement | null>(null);
  const detailRightRef = useRef<HTMLDivElement | null>(null);
  const detailTrackRef = useRef<HTMLDivElement | null>(null);

  const displayProducts = [...products, products[0]];

  // -----------------------------------------------------------------------
  // SHOWCASE — vertical wipe ScrollTrigger
  // -----------------------------------------------------------------------
  const setupShowcase = useCallback(() => {
    ScrollTrigger.getById(SHOWCASE_ST_ID)?.kill();

    const totalTransitions = N * SHOWCASE_CYCLES;
    const totalVH = totalTransitions * SHOWCASE_TRANSITION_VH;

    // Reset all panel clips to initial (un-wiped).
    const allPanels = [
      ...leftPanelsRef.current,
      ...rightPanelsRef.current,
      ...cardPanelsRef.current,
    ].filter((el): el is HTMLElement => el !== null);
    gsap.set(allPanels, { clipPath: "inset(0% 0% 0% 0%)" });

    ScrollTrigger.create({
      id: SHOWCASE_ST_ID,
      trigger: showcasePinRef.current,
      start: "top top",
      end: () => `+=${(totalVH * window.innerHeight) / 100}`,
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      snap: {
        snapTo: 1 / (N * SHOWCASE_CYCLES),
        duration: { min: 0.3, max: 0.8 },
        ease: "power2.inOut",
        delay: 0.12,
        directional: false,
      },
      onUpdate: (self) => {
        const t = self.progress * totalTransitions;
        const cyclePos = ((t % N) + N) % N;

        for (let i = 0; i < N; i++) {
          const localProgress = Math.max(0, Math.min(1, cyclePos - i));
          let pct = localProgress * 100;
          // Snap pct to a clean 0 or 100 when very close so sub-pixel
          // rounding at snap targets doesn't leave a 1px sliver of the
          // previous panel visible at the edge.
          if (pct > 99.5) pct = 100;
          else if (pct < 0.5) pct = 0;

          const leftPanel = leftPanelsRef.current[i];
          if (leftPanel) {
            leftPanel.style.clipPath = `inset(0% 0% ${pct}% 0%)`;
          }
          const rightPanel = rightPanelsRef.current[i];
          if (rightPanel) {
            rightPanel.style.clipPath = `inset(${pct}% 0% 0% 0%)`;
          }
          const cardPanel = cardPanelsRef.current[i];
          if (cardPanel) {
            cardPanel.style.clipPath = `inset(0% 0% ${pct}% 0%)`;
          }
        }

        const visibleIdx = Math.round(cyclePos) % N;
        if (visibleIdx !== currentVisibleIdxRef.current) {
          currentVisibleIdxRef.current = visibleIdx;
          setCurrentVisibleIdx(visibleIdx);
        }
      },
    });
  }, []);

  // -----------------------------------------------------------------------
  // DETAIL — horizontal scroll ScrollTrigger
  // -----------------------------------------------------------------------
  const setupDetail = useCallback(() => {
    ScrollTrigger.getById(DETAIL_ST_ID)?.kill();

    if (!detailTrackRef.current || !showcasePinRef.current) return;

    const totalScroll = (DETAIL_PANELS - 1) * window.innerWidth;

    gsap.set(detailTrackRef.current, { x: 0 });

    gsap.to(detailTrackRef.current, {
      x: -totalScroll,
      ease: "none",
      scrollTrigger: {
        id: DETAIL_ST_ID,
        trigger: showcasePinRef.current,
        pin: true,
        scrub: true,
        start: "top top",
        end: () => `+=${totalScroll}`,
        invalidateOnRefresh: true,
        onLeave: () => {
          if (transitioningRef.current) return;
          const nextIdx = (activeIdxRef.current + 1) % N;
          exitToShowcase(nextIdx);
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------------------
  // ENTRY CHOREOGRAPHY (showcase → detail)
  // -----------------------------------------------------------------------
  const enterDetail = useCallback(
    (idx: number) => {
      if (transitioningRef.current) return;
      if (phaseRef.current !== "showcase") return;
      transitioningRef.current = true;

      // Push a history entry so the browser back button (and our
      // top-left logo back affordance) can return to the listing
      // without leaving /products. The popstate handler below catches
      // back navigation and triggers a same-product exit.
      try {
        window.history.pushState({ pz: "detail" }, "");
      } catch {
        /* SSR or restricted iframe — non-fatal */
      }

      // Compute the snap target — the scroll position that lands the
      // showcase exactly on `idx`.
      const showcaseST = ScrollTrigger.getById(SHOWCASE_ST_ID);
      let needsSnap = false;
      let targetScroll = 0;
      if (showcaseST) {
        const totalTransitions = N * SHOWCASE_CYCLES;
        const currentT = showcaseST.progress * totalTransitions;
        const currentCycle = Math.floor(currentT / N);
        let targetT = currentCycle * N + idx;
        if (targetT < currentT - 0.5) targetT += N;
        const targetProgress = Math.min(targetT / totalTransitions, 1);
        targetScroll =
          showcaseST.start + targetProgress * (showcaseST.end - showcaseST.start);
        const currentScroll = lenisRef.current?.scroll ?? 0;
        needsSnap = Math.abs(targetScroll - currentScroll) > 0.5;
      }

      // If the user clicked mid-scroll, glide quickly to the snap
      // target FIRST, then start the entry choreography. Without this
      // the page snapped instantly and the active wipe-between-products
      // animation got cut off mid-frame.
      if (needsSnap) {
        lenisRef.current?.scrollTo(targetScroll, {
          duration: 0.4,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
          onComplete: () => beginEntry(),
        });
      } else {
        beginEntry();
      }

      function beginEntry() {
        lenisRef.current?.stop();
        runEntryChoreography(idx);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setupDetail],
  );

  // Holds the actual entry choreography (phases 1-3) so `enterDetail`
  // can call it either synchronously (already on the snap target) or as
  // an `onComplete` callback after the catch-up snap completes.
  const runEntryChoreography = useCallback(
    (idx: number) => {
      // Force-flush the activeIdx state change so the detail layer's
      // title is rendered with the new product's text BEFORE we capture
      // the title's character spans for the reveal tween. Without this,
      // gsap.set runs against the previous render's spans and the new
      // ones briefly flash visible.
      flushSync(() => {
        setActiveIdx(idx);
      });
      activeIdxRef.current = idx;

      // Force a synchronous showcase update so panel clips reflect the
      // snapped position before we start animating.
      ScrollTrigger.update();

      // ----- Phase 3 prep — detail elements initial states -------------
      // Detail layer is currently hidden. Its inner elements get prepped
      // here so they appear in the right starting state the moment we
      // make the layer visible at the start of phase 3.
      //
      // The frame's initial scale is computed so it covers the full left
      // half — matching the showcase image's full-bleed position. From
      // there it shrinks to its rest size (2:3 frame, 40vh × 60vh).
      // This is the "seamless shrink": the user perceives the showcase
      // image becoming the framed image, not two separate elements.
      const halfW = window.innerWidth / 2;
      const fullH = window.innerHeight;
      const frameW = 0.5 * window.innerHeight; // 50vh
      const frameH = 0.5 * window.innerHeight; // 50vh
      const initialScale = Math.max(halfW / frameW, fullH / frameH);

      gsap.set(detailLayerRef.current, { autoAlpha: 1 });
      gsap.set(detailRightRef.current, {
        clipPath: "inset(100% 0% 0% 0%)",
      });
      gsap.set(detailFrameRef.current, {
        scale: initialScale,
        autoAlpha: 1,
      });
      // Title now uses TextStaggerHover (motion-driven per-character
      // hover effect). Per-letter GSAP would clash with motion's
      // variants, so the entry reveals the whole h1 element with a
      // simple opacity + lift instead.
      gsap.set(detailTitleRef.current, { y: 36, autoAlpha: 0 });

      // Hide detail until phase 3 begins so phases 1+2 only show the
      // showcase wiping. We just set autoAlpha:1 above for prep; flip it
      // back to 0 here and let the timeline reveal it again later.
      gsap.set(detailLayerRef.current, { autoAlpha: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          // Tear down showcase, build detail.
          ScrollTrigger.getById(SHOWCASE_ST_ID)?.kill();

          gsap.set(showcaseLeftRef.current, { autoAlpha: 0 });
          gsap.set(showcaseRightRef.current, { autoAlpha: 0 });
          gsap.set(showcaseCardRef.current, { autoAlpha: 0 });

          lenisRef.current?.scrollTo(0, { immediate: true, force: true });
          setupDetail();

          setPhase("detail");
          phaseRef.current = "detail";
          transitioningRef.current = false;
          lenisRef.current?.start();
        },
      });

      // ===== PHASE 1 — card wipes bottom-up. Nothing else moves. =====
      tl.to(showcaseCardRef.current, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.5,
        ease: EASE,
      });

      // ===== PHASE 2 — right side wipes down (light over dark). =====
      // Wipes the entire SpecReel overlay (lighter rightColor panel +
      // text together) top-down, gradually revealing the darker
      // leftColor base behind it. The dark underneath is the same color
      // shown on the left side, so the right half just becomes "dark
      // continuation" of the left.
      tl.to(showcaseRightOverlayRef.current, {
        clipPath: "inset(100% 0% 0% 0%)",
        duration: 0.6,
        ease: EASE,
      });

      // ----- Beat -----
      tl.to({}, { duration: 0.18 });

      // ===== PHASE 3 — reveal detail layer + concurrent reveals =====
      tl.set(detailLayerRef.current, { autoAlpha: 1 });

      // Detail right copy reverse-wipes in.
      tl.to(detailRightRef.current, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.7,
        ease: EASE,
      });

      // Framed image SEAMLESSLY shrinks from full-bleed (initialScale)
      // to its rest 2:3 frame (scale 1). Concurrent with the right-side
      // reveal — both motions start at the same instant.
      tl.to(
        detailFrameRef.current,
        {
          scale: 1,
          duration: 1.0,
          ease: FAST_EASE,
        },
        "<",
      );

      // Title lifts in as a whole element near the end of the image
      // scale. Per-letter staggering moved out — see comment on the
      // gsap.set above.
      tl.to(
        detailTitleRef.current,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.55,
          ease: "power2.out",
        },
        "-=0.45",
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setupDetail],
  );

  // -----------------------------------------------------------------------
  // EXIT (detail → showcase at next product)
  // -----------------------------------------------------------------------
  const exitToShowcase = useCallback(
    (nextIdx: number) => {
      if (transitioningRef.current) return;
      transitioningRef.current = true;

      lenisRef.current?.stop();

      // Detail's last horizontal panel is rendered to look IDENTICAL to
      // the showcase view of nextProduct. So the handoff is just a layer
      // swap — no fade needed, the user perceives a single continuous
      // motion of "scrolled horizontally into the next product" then
      // "now I can scroll vertically again."

      // Tear down the detail ScrollTrigger so the body height shrinks
      // back from the horizontal pin spacer. Note: do NOT reset the
      // detail track's `x` here — the detail layer is still visible
      // (showing panel 4 = next product hero), and snapping the track
      // back to x:0 would briefly reveal panel 1 (the small framed
      // image) which is the source of the "shrunken" flash. The track
      // reset is deferred until after the detail layer is hidden.
      ScrollTrigger.getById(DETAIL_ST_ID)?.kill();

      // Restore showcase clip-path state (entry choreography left
      // these in their wiped-out positions). For the card we use
      // `clearProps` rather than re-setting clip-path to inset(0%) —
      // even an "all visible" clip-path can clip the element's
      // box-shadow in some browsers, which manifests as the card's
      // drop shadow visibly disappearing the moment we land on the
      // listing page after the detail hand-off.
      gsap.set(showcaseCardRef.current, { clearProps: "clipPath" });
      gsap.set(showcaseRightOverlayRef.current, {
        clipPath: "inset(0% 0% 0% 0%)",
      });

      // Make showcase visible — at this moment both showcase and detail
      // are visible, both showing nextProduct's hero. The next step
      // hides detail, leaving only showcase. No visible change.
      gsap.set(
        [
          showcaseLeftRef.current,
          showcaseRightRef.current,
          showcaseCardRef.current,
        ],
        { autoAlpha: 1 },
      );

      // Reset scroll & rebuild showcase ScrollTrigger.
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
      setupShowcase();

      // Position showcase scroll at nextProduct's slot. Forced
      // ScrollTrigger.update so the panel clips reflect the new position
      // BEFORE we hide the detail layer (otherwise showcase would briefly
      // show product 0).
      const st = ScrollTrigger.getById(SHOWCASE_ST_ID);
      if (st) {
        const totalTransitions = N * SHOWCASE_CYCLES;
        const targetProgress = nextIdx / totalTransitions;
        const targetScroll =
          st.start + targetProgress * (st.end - st.start);
        lenisRef.current?.scrollTo(targetScroll, {
          immediate: true,
          force: true,
        });
      }
      ScrollTrigger.update();

      // Hide detail. Showcase now showing nextProduct hero.
      gsap.set(detailLayerRef.current, { autoAlpha: 0 });

      // Now that detail is invisible, it's safe to reset the track.
      gsap.set(detailTrackRef.current, { x: 0 });

      // Update React state. Detail layer is now hidden so its re-render
      // (with the product after next, etc.) is invisible.
      flushSync(() => {
        setActiveIdx(nextIdx);
        setCurrentVisibleIdx(nextIdx);
      });
      activeIdxRef.current = nextIdx;
      currentVisibleIdxRef.current = nextIdx;

      setPhase("showcase");
      phaseRef.current = "showcase";
      transitioningRef.current = false;
      lenisRef.current?.start();
    },
    [setupShowcase],
  );

  // -----------------------------------------------------------------------
  // INITIAL MOUNT
  // -----------------------------------------------------------------------
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(detailLayerRef.current, { autoAlpha: 0 });
      setupShowcase();
    }, containerRef);

    return () => {
      ScrollTrigger.getById(SHOWCASE_ST_ID)?.kill();
      ScrollTrigger.getById(DETAIL_ST_ID)?.kill();
      ctx.revert();
    };
  }, [setupShowcase]);

  // -----------------------------------------------------------------------
  // PRODUCT NAV (top-right brand quick-links). Only meaningful in showcase.
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handler = (e: Event) => {
      if (phaseRef.current !== "showcase") return;
      const ce = e as CustomEvent<{ index: number }>;
      const index = ce.detail?.index;
      if (typeof index !== "number") return;

      const st = ScrollTrigger.getById(SHOWCASE_ST_ID);
      if (!st) return;

      const totalTransitions = N * SHOWCASE_CYCLES;
      const currentT = st.progress * totalTransitions;
      const currentCyclePos = ((currentT % N) + N) % N;
      const offset = (((index - currentCyclePos) % N) + N) % N;
      if (offset < 0.001) return;

      const targetT = Math.min(currentT + offset, totalTransitions);
      const targetProgress = targetT / totalTransitions;
      const targetScroll = st.start + targetProgress * (st.end - st.start);
      lenisRef.current?.scrollTo(targetScroll, { duration: 1.6 });
    };

    window.addEventListener("pz:scrollToProduct", handler);
    return () =>
      window.removeEventListener("pz:scrollToProduct", handler);
  }, [lenisRef]);

  // Browser back button: when in detail mode, pop returns to the listing
  // (showcase at the same product). When in showcase mode, let the
  // browser do its default (e.g. go to landing).
  useEffect(() => {
    const handler = () => {
      if (phaseRef.current === "detail" && !transitioningRef.current) {
        exitToShowcase(activeIdxRef.current);
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [exitToShowcase]);

  // Top-left logo click. In showcase, navigates to landing. In detail,
  // exits to the listing (same product).
  const handleLogoClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (phaseRef.current === "detail") {
        e.preventDefault();
        if (transitioningRef.current) return;
        exitToShowcase(activeIdxRef.current);
      }
    },
    [exitToShowcase],
  );

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------
  const activeProduct = products[activeIdx];
  const nextProduct = products[(activeIdx + 1) % N];

  return (
    <div
      ref={containerRef}
      className="relative w-screen overflow-hidden"
      style={{ backgroundColor: "#EFEAE0" }}
    >
      {/* Top-left logo. In showcase phase it's a normal link to the
       * landing page. In detail phase the click handler intercepts and
       * exits to the listing instead, so the logo doubles as a back
       * affordance once you're inside a product. */}
      <Link
        href="/"
        onClick={handleLogoClick}
        aria-label={
          phase === "detail" ? "Back to products" : "Power Zone home"
        }
        className="fixed left-6 top-6 z-[80] mix-blend-difference"
      >
        <Image
          src="/power-zone-logo.png"
          alt="Power Zone"
          width={84}
          height={84}
          priority
          className="h-[72px] w-[72px] object-contain"
        />
      </Link>

      <section
        ref={showcasePinRef}
        className="relative h-screen w-screen overflow-hidden"
      >
        {/* ============== SHOWCASE LAYER ============== */}
        {/* Left half — stacked image panels */}
        <div
          ref={showcaseLeftRef}
          className="absolute inset-y-0 left-0 w-full md:w-1/2 overflow-hidden z-10"
        >
          <ImageReel products={displayProducts} panelRefs={leftPanelsRef} />
        </div>

        {/* Right half — dark base + lighter overlay.
         * The darker `leftColor` sits at the bottom and is revealed
         * during entry phase 2 when the lighter overlay (rightColor +
         * text) wipes top-down. The wipe is scrubbed onto the inner
         * overlay div so the base underneath is uncovered like a
         * curtain dropping. */}
        <div
          ref={showcaseRightRef}
          className="hidden md:block absolute inset-y-0 right-0 w-1/2 overflow-hidden z-10"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor:
                products[currentVisibleIdx]?.leftColor ??
                products[0].leftColor,
            }}
          />
          <div
            ref={showcaseRightOverlayRef}
            className="absolute inset-0 will-change-[clip-path]"
          >
            <SpecReel
              products={displayProducts}
              panelRefs={rightPanelsRef}
              contentRefs={rightContentRefs}
            />
          </div>
        </div>

        {/* Center clickable card */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-[60]">
          <div className="pointer-events-auto">
            <ProductCard
              products={displayProducts}
              panelRefs={cardPanelsRef}
              cardRef={showcaseCardRef}
              currentIndex={currentVisibleIdx}
              onCardClick={enterDetail}
            />
          </div>
        </div>

        {/* ============== DETAIL LAYER ============== */}
        <div
          ref={detailLayerRef}
          className="absolute inset-0 overflow-hidden z-[70]"
          style={{ visibility: "hidden" }}
        >
          <div
            ref={detailTrackRef}
            className="flex h-screen will-change-transform"
            style={{ width: `${DETAIL_PANELS * 100}vw` }}
          >
            {/* ---- Panel 1: Hero (frame + title + right copy) ---- */}
            <section
              className="relative w-screen h-screen flex-shrink-0 grid grid-cols-2"
              style={{ backgroundColor: activeProduct.leftColor }}
            >
              {/* Frame is 1:1 (50vh × 50vh) at rest. The entry
               * choreography scales it up to cover the full left half
               * initially, then animates back to scale 1 — so the
               * showcase's full-bleed image visually shrinks INTO this
               * frame. Image inside is `object-cover` so it fills the
               * container at every scale without distorting. The title
               * sits below with a generous gap so it reads as a caption
               * to the framed image. */}
              <div className="relative flex flex-col items-center justify-center gap-16 md:gap-20 px-[4vw]">
                <div
                  ref={detailFrameRef}
                  className="relative overflow-hidden ring-1 ring-white/15 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.5)]"
                  style={{
                    width: "50vh",
                    height: "50vh",
                    backgroundColor: activeProduct.leftColor,
                    transformOrigin: "center center",
                  }}
                >
                  <Image
                    src={activeProduct.image}
                    alt={activeProduct.title}
                    fill
                    priority
                    sizes="50vh"
                    className="object-cover"
                  />
                </div>
                <h1
                  ref={detailTitleRef}
                  className="text-white font-bold leading-[0.95] text-[clamp(48px,7vw,108px)]"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  <TextStaggerHover
                    as="span"
                    className="whitespace-nowrap"
                  >
                    <TextStaggerHoverActive
                      animation="top"
                      className="origin-top"
                    >
                      {activeProduct.slug}
                    </TextStaggerHoverActive>
                    <TextStaggerHoverHidden
                      animation="bottom"
                      className="origin-bottom"
                    >
                      {activeProduct.slug}
                    </TextStaggerHoverHidden>
                  </TextStaggerHover>
                </h1>
              </div>

              {/* Right half — renders the same SpecReel content the
               * listing was showing pre-click, so the user perceives
               * the right side as continuous (only the left side
               * transforms during the entry choreography). */}
              <div
                ref={detailRightRef}
                className="relative overflow-hidden"
                style={{ backgroundColor: activeProduct.rightColor }}
              >
                <SpecReel
                  products={[activeProduct]}
                  panelRefs={detailSpecRefs}
                />
              </div>
            </section>

            {/* ---- Panel 2: Capabilities ---- */}
            <section className="relative w-screen h-screen flex-shrink-0 flex items-center justify-center px-[8vw]">
              <div className="grid w-full max-w-[110rem] grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-black/55">
                    Engineering
                  </p>
                  <h2
                    className="mt-5 font-semibold leading-[1.04] text-black text-[clamp(32px,4vw,56px)]"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {activeProduct.tagline}
                  </h2>
                </div>
                <div className="self-end">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.32em] text-black/55">
                    Capabilities
                  </h3>
                  <ul className="mt-5">
                    {activeProduct.features.map((feature, i) => (
                      <li
                        key={feature}
                        className="flex items-center justify-between gap-6 border-b border-black/12 py-4"
                      >
                        <span className="text-[14px] text-black/85">
                          {feature}
                        </span>
                        <span className="font-mono text-[10px] text-black/40 tabular-nums">
                          0{i + 1}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* ---- Panel 3: Image + applications + origin ---- */}
            <section className="relative w-screen h-screen flex-shrink-0 flex items-center justify-center px-[8vw]">
              <div className="grid w-full max-w-[110rem] grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 items-center">
                <div
                  className="relative h-[60vh] overflow-hidden"
                  style={{ backgroundColor: activeProduct.leftColor }}
                >
                  <Image
                    src={activeProduct.image}
                    alt={activeProduct.title}
                    fill
                    sizes="50vw"
                    className="object-contain p-10"
                  />
                </div>
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.32em] text-black/55">
                    Applications
                  </h3>
                  <ul className="mt-5 space-y-2.5">
                    {activeProduct.applications.map((app) => (
                      <li
                        key={app}
                        className="flex items-baseline gap-3 text-[15px] text-black/85"
                      >
                        <span
                          aria-hidden
                          className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-black/40"
                        />
                        <span>{app}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-12">
                    <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-black/55">
                      Origin
                    </p>
                    <p
                      className="mt-1 font-bold leading-[0.92] text-black text-[clamp(56px,7vw,112px)]"
                      style={{ letterSpacing: "-0.03em" }}
                    >
                      {activeProduct.year}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ---- Panel 4: Next product hero (seamless handoff) ----
             * Renders the SAME visual as the showcase view of the next
             * product (left image full-bleed + right specs + center
             * card). When the user scrolls past this panel, the detail
             * ScrollTrigger's `onLeave` swaps layers — but because the
             * showcase layer already shows the next product hero, the
             * swap is invisible and the user just keeps scrolling, now
             * vertically through the listing. */}
            <section className="relative w-screen h-screen flex-shrink-0 overflow-hidden">
              {/* Left half — full-bleed image via the SAME ImageReel
               * component the showcase uses, so on the swap there is no
               * change in image scale, padding, or object-fit (this was
               * the cause of the "shrunken" flash on hand-off). */}
              <div className="absolute inset-y-0 left-0 w-full md:w-1/2 overflow-hidden">
                <ImageReel
                  products={[nextProduct]}
                  panelRefs={panel4ImageRefs}
                />
              </div>

              {/* Right half — same SpecReel as the showcase. */}
              <div className="hidden md:block absolute inset-y-0 right-0 w-1/2 overflow-hidden">
                <SpecReel
                  products={[nextProduct]}
                  panelRefs={panel4SpecRefs}
                />
              </div>

              {/* Center card — uses the actual ProductCard component
               * with `[nextProduct]` so its DOM and styling are
               * pixel-identical to the showcase card that takes over
               * after the swap. Wrapped in `pointer-events-none` so the
               * card's click target is inert during the horizontal
               * scroll; the live showcase card takes interaction. */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-[60]">
                <ProductCard
                  products={[nextProduct]}
                  panelRefs={panel4CardRefs}
                  currentIndex={0}
                  onCardClick={() => {}}
                />
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
