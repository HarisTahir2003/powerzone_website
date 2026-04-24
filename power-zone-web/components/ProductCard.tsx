"use client";

import Link from "next/link";
import type { RefObject } from "react";
import type { Product } from "@/data/products";
import {
  TextStaggerHover,
  TextStaggerHoverActive,
  TextStaggerHoverHidden,
} from "@/components/ui/text-stagger-hover";

type Props = {
  products: Product[];
  stackRef: RefObject<HTMLDivElement | null>;
  textRefs: RefObject<(HTMLDivElement | null)[]>;
};

/* Card dimensions kept as a single source of truth — must match CARD_VH in
 * ProductShowcase.tsx. Block height and CARD_VH need to stay aligned so the
 * stack translates by exactly one block per transition.
 */
const BLOCK_H_CLASS = "h-[14vh]";

export default function ProductCard({ products, stackRef, textRefs }: Props) {
  return (
    <article
      className="
        relative overflow-hidden
        w-[48vw] md:w-[29vw]
        h-[14vh]
        rounded-[2px]
        ring-1 ring-white/10
        shadow-[0_2px_4px_-1px_rgba(0,0,0,0.35),0_24px_55px_-12px_rgba(0,0,0,0.6),0_8px_18px_-6px_rgba(0,0,0,0.4)]
      "
    >
      {/* Debossed "PZ" monogram — sits inside the card clip, does NOT translate */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center select-none"
      >
        <span
          className="font-semibold tracking-[-0.06em] leading-none"
          style={{
            fontSize: "clamp(78px, 13vw, 180px)",
            color: "rgba(0,0,0,0.06)",
            textShadow:
              "0 -1px 0 rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          PZ
        </span>
      </div>

      {/* Arrow — always visible, links to detail page (first product by default) */}
      <Link
        href={`/products/${products[0]?.slug ?? ""}`}
        aria-label="Open product detail"
        className="
          absolute top-3 right-3 z-30
          h-8 w-8 rounded-full
          flex items-center justify-center
          bg-black/10 text-white backdrop-blur-sm
          hover:bg-black/25 transition-colors
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
      </Link>

      {/* Vertical stack of product blocks. GSAP translates this by -CARD_VH per transition. */}
      <div
        ref={stackRef}
        className="relative z-20 w-full will-change-transform"
        style={{ height: `${products.length * 100}%` }}
      >
        {products.map((product, i) => (
          <section
            key={product.id}
            className={`relative flex ${BLOCK_H_CLASS} w-full items-end`}
            style={{ backgroundColor: product.accentColor }}
          >
            <div
              ref={(el) => {
                textRefs.current[i] = el;
              }}
              className="
                relative z-10 flex w-full items-end justify-between
                gap-3 px-4 pb-3 md:px-6 md:pb-4
                text-white will-change-transform
              "
            >
              <div className="max-w-[72%]">
                <TextStaggerHover
                  as="h2"
                  className="
                    align-baseline font-semibold leading-[0.95]
                    text-[clamp(14px,1.8vw,24px)]
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
                <p className="mt-1 text-[9px] md:text-[10px] uppercase tracking-[0.12em] opacity-80">
                  {product.subtitle}
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5 text-right text-[9px] md:text-[10px] uppercase tracking-[0.12em] opacity-80">
                <span>{product.category}</span>
                <span>{product.year}</span>
              </div>
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
