"use client";

import Link from "next/link";
import type { RefObject } from "react";
import type { Product } from "@/data/products";

type Props = {
  products: Product[];
  stackRef: RefObject<HTMLDivElement | null>;
  textRefs: RefObject<(HTMLDivElement | null)[]>;
};

export default function ProductCard({ products, stackRef, textRefs }: Props) {
  return (
    <article
      className="
        relative overflow-hidden
        w-[90vw] md:w-[55vw]
        h-[40vh] md:h-[38vh]
        rounded-[2px]
        shadow-[0_40px_90px_-30px_rgba(0,0,0,0.35)]
      "
    >
      {/* Debossed "PZ" monogram — sits inside the card clip, does NOT translate */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-0 z-10
          flex items-center justify-center
          select-none
        "
      >
        <span
          className="font-semibold tracking-[-0.06em] leading-none"
          style={{
            fontSize: "clamp(180px, 28vw, 420px)",
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
          absolute top-4 right-4 z-30
          h-9 w-9 rounded-full
          flex items-center justify-center
          bg-black/10 text-white backdrop-blur-sm
          hover:bg-black/25 transition-colors
        "
      >
        <svg
          viewBox="0 0 16 16"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path d="M4 12 L12 4" strokeLinecap="round" />
          <path d="M6 4 L12 4 L12 10" strokeLinecap="round" />
        </svg>
      </Link>

      {/* Vertical stack of product blocks. GSAP translates this by -100% per transition. */}
      <div
        ref={stackRef}
        className="relative z-20 w-full will-change-transform"
        style={{ height: `${products.length * 100}%` }}
      >
        {products.map((product, i) => (
          <section
            key={product.id}
            className="relative flex h-[40vh] md:h-[38vh] w-full items-end"
            style={{ backgroundColor: product.accentColor }}
          >
            <div
              ref={(el) => {
                textRefs.current[i] = el;
              }}
              className="
                relative z-10 flex w-full items-end justify-between
                gap-6 px-8 pb-8 md:px-12 md:pb-10
                text-white will-change-transform
              "
            >
              <div className="max-w-[70%]">
                <h2
                  className="
                    font-semibold leading-[0.95]
                    text-[clamp(28px,4.4vw,56px)]
                  "
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {product.title}
                </h2>
                <p className="mt-2 text-[12px] md:text-[13px] uppercase tracking-[0.12em] opacity-80">
                  {product.subtitle}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-right text-[11px] md:text-[12px] uppercase tracking-[0.12em] opacity-80">
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
