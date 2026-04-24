"use client";

import { forwardRef } from "react";
import type { Product } from "@/data/products";

type Props = {
  products: Product[];
  reversed?: boolean;
};

const SpecReel = forwardRef<HTMLDivElement, Props>(function SpecReel(
  { products, reversed = false },
  ref,
) {
  const ordered = reversed ? [...products].slice().reverse() : products;

  return (
    <div
      ref={ref}
      className="will-change-transform"
      style={{ height: `${ordered.length * 100}%` }}
    >
      {ordered.map((product) => (
        <section
          key={product.id}
          className="relative h-screen w-full overflow-hidden"
          style={{ backgroundColor: product.rightColor }}
        >
          <div className="flex h-full flex-col justify-center text-white px-10 md:pl-[17vw] md:pr-12 lg:pr-20">
            <div className="mb-5 flex items-center gap-4">
              <span aria-hidden className="h-px w-10 bg-white/45" />
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/70">
                {product.origin}
              </span>
            </div>

            <h2
              className="font-semibold leading-[0.95] text-[clamp(32px,4.2vw,56px)]"
              style={{ letterSpacing: "-0.02em" }}
            >
              {product.title}
            </h2>
            <p className="mt-3 text-[12px] md:text-[13px] font-medium uppercase tracking-[0.24em] text-white/80">
              {product.tagline}
            </p>

            <p className="mt-7 max-w-[34rem] text-[13px] md:text-[14px] leading-relaxed text-white/80">
              {product.overview}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-10">
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/55">
                  Capabilities
                </h3>
                <ul className="mt-3 space-y-1.5 text-[13px] text-white/85">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-white/65"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/55">
                  Applications
                </h3>
                <ul className="mt-3 space-y-1.5 text-[13px] text-white/75">
                  {product.applications.map((application) => (
                    <li key={application} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-white/40"
                      />
                      <span>{application}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </section>
      ))}
    </div>
  );
});

export default SpecReel;
