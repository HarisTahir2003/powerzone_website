"use client";

import { useId, type MutableRefObject } from "react";
import { textOn, type Product } from "@/data/products";
import {
  TextStaggerHover,
  TextStaggerHoverActive,
  TextStaggerHoverHidden,
} from "@/components/ui/text-stagger-hover";

type Props = {
  products: Product[];
  panelRefs: MutableRefObject<(HTMLElement | null)[]>;
  cardRef?: MutableRefObject<HTMLElement | null>;
  /** Index of the product currently visible at the top of the wipe stack. */
  currentIndex: number;
  /** Click handler — receives the index of the currently-visible product. */
  onCardClick: (index: number) => void;
};

type EmbossedPZProps = {
  accentColor: string;
  idBase: string;
  index: number;
};

function EmbossedPZ({ accentColor, idBase, index }: EmbossedPZProps) {
  const surfaceColor = accentColor || "#8f1d22";
  const shadowFilterId = `${idBase}-shadow-${index}`;
  const highlightFilterId = `${idBase}-highlight-${index}`;

  // Center the monogram in the actual card. The previous lifted y-position
  // made the PZ sit against the top edge on wide cards. Keeping the text at
  // geometric center, with a tiny dy correction and slightly smaller size,
  // leaves breathing room for the emboss shadows on all sides.
  const sharedTextProps = {
    x: "50%",
    y: "50%",
    dy: "0.04em",
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    fontSize: 205,
    fontWeight: 900,
    letterSpacing: -18,
  };

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full select-none overflow-visible"
      viewBox="0 0 1000 260"
      preserveAspectRatio="xMidYMid meet"
      style={{ fontFamily: "inherit" }}
    >
      <defs>
        <filter
          id={shadowFilterId}
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter
          id={highlightFilterId}
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/*
        Blind-emboss stack:
        1) blurred dark layer offset down/right = cast depth
        2) blurred light layer offset up/left = soft surface highlight
        3) crisp dark + crisp light offsets = beveled rim
        4) exact same-color fill covers the shifted layers' interiors
        5) very faint white fill gives the raised face a tiny light catch

        The final letter body uses the card's own accent color, so the PZ
        reads as molded card material rather than printed ink.
      */}
      <g>
        <text
          {...sharedTextProps}
          fill="#000000"
          opacity="0.17"
          transform="translate(10 10)"
          filter={`url(#${shadowFilterId})`}
        >
          PZ
        </text>
        <text
          {...sharedTextProps}
          fill="#ffffff"
          opacity="0.13"
          transform="translate(-8 -8)"
          filter={`url(#${highlightFilterId})`}
        >
          PZ
        </text>
        <text
          {...sharedTextProps}
          fill="#000000"
          opacity="0.28"
          transform="translate(3.5 3.5)"
        >
          PZ
        </text>
        <text
          {...sharedTextProps}
          fill="#ffffff"
          opacity="0.22"
          transform="translate(-2.8 -2.8)"
        >
          PZ
        </text>
        <text {...sharedTextProps} fill={surfaceColor}>
          PZ
        </text>
        <text {...sharedTextProps} fill="#ffffff" opacity="0.045">
          PZ
        </text>
      </g>
    </svg>
  );
}

export default function ProductCard({
  products,
  panelRefs,
  cardRef,
  currentIndex,
  onCardClick,
}: Props) {
  const currentProduct = products[currentIndex] ?? products[0];

  // Unique SVG ids per instance — multiple ProductCards can coexist in the DOM
  // during the live showcase + static hand-off states.
  const uid = useId().replace(/:/g, "");
  const grainId = `pz-card-grain-${uid}`;
  const embossId = `pz-card-emboss-${uid}`;

  return (
    // The article itself is the click target — putting the handler on
    // an inner full-card <button> overlay (a previous iteration) ate
    // mouse events, which broke the title's hover-stagger animation.
    // Now hover events reach the h2's TextStaggerHover wrapper while
    // click + keyboard activation are still handled at the article level.
    <article
      ref={(el) => {
        if (cardRef) cardRef.current = el;
      }}
      onClick={() => onCardClick(currentIndex)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick(currentIndex);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${currentProduct?.title ?? "product"} detail`}
      className="
        relative overflow-hidden cursor-pointer
        w-[58vw] md:w-[35vw]
        h-[17vh]
        rounded-[2px]
        ring-1 ring-white/10
        shadow-[0_2px_4px_-1px_rgba(0,0,0,0.35),0_24px_55px_-12px_rgba(0,0,0,0.6),0_8px_18px_-6px_rgba(0,0,0,0.4)]
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-white/70 focus-visible:ring-inset
      "
      style={{ isolation: "isolate" }}
    >

      {/* Card-scoped grain texture. It sits above the colored panels, so both
       * the flat surface and the embossed PZ share the same material noise. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[10] opacity-[0.075] mix-blend-overlay"
      >
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <filter id={grainId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.95"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${grainId})`} />
        </svg>
      </div>

      {/* Arrow — visual indicator only; the whole-card button handles clicks. */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute top-3 right-3 z-50
          h-8 w-8 rounded-full
          flex items-center justify-center
          bg-black/10 text-white backdrop-blur-sm
        "
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path d="M4 12 L12 4" strokeLinecap="round" />
          <path d="M6 4 L12 4 L12 10" strokeLinecap="round" />
        </svg>
      </div>

      {/* Stacked card panels — top peels up to reveal next. */}
      {products.map((product, i) => {
        const surfaceColor = product.accentColor || "#8f1d22";

        return (
          <section
            key={`${product.slug}-${i}`}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className="absolute inset-0 flex items-end overflow-hidden will-change-transform"
            style={{
              backgroundColor: surfaceColor,
              zIndex: products.length - i,
            }}
          >
            <EmbossedPZ
              accentColor={surfaceColor}
              idBase={embossId}
              index={i}
            />

            {/* Subtle material lighting. Kept inside each panel so the text can
             * stay above it while the PZ remains integrated into the surface. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[2]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.025) 42%, rgba(0,0,0,0.11) 100%)",
                mixBlendMode: "soft-light",
                opacity: 0.78,
              }}
            />

            <div
              className="
                relative z-10 flex w-full items-end justify-between
                gap-3 px-4 pb-3 md:px-6 md:pb-4
              "
              // Card text adapts to the panel's accent color via
              // textOn(...) — every current accent (generators + BESS)
              // is dark so this resolves to white, but if a future
              // catalog ships a light-accent product the text stays
              // legible.
              style={{ color: textOn(surfaceColor) }}
            >
              <div className="max-w-[72%]">
                <TextStaggerHover
                  as="h2"
                  className="
                    align-baseline font-semibold leading-[0.95]
                    text-[clamp(17px,2.2vw,28px)]
                    whitespace-nowrap font-display
                  "
                  style={{ letterSpacing: "-0.02em" }}
                >
                  <TextStaggerHoverActive
                    animation="top"
                    className="opacity-90 origin-top"
                  >
                    {product.title}
                  </TextStaggerHoverActive>
                  <TextStaggerHoverHidden
                    animation="bottom"
                    className="origin-bottom"
                  >
                    {product.title}
                  </TextStaggerHoverHidden>
                </TextStaggerHover>
                <p className="mt-1 text-[11px] md:text-[12px] uppercase tracking-[0.12em] opacity-80 whitespace-nowrap font-body">
                  {product.subtitle}
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5 text-right text-[11px] md:text-[12px] uppercase tracking-[0.12em] opacity-80 font-body">
                <span>{product.category}</span>
                <span>{product.year}</span>
              </div>
            </div>
          </section>
        );
      })}
    </article>
  );
}
