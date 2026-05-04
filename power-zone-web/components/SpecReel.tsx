"use client";

import type { CSSProperties, MutableRefObject } from "react";
import { textOn, type Product } from "@/data/products";

type Props = {
  products: Product[];
  panelRefs: MutableRefObject<(HTMLElement | null)[]>;
  /** Inner text-content div per panel — used so an entry-transition wipe
   * can clip just the text (top-down) while the panel's coloured
   * background stays visible. */
  contentRefs?: MutableRefObject<(HTMLElement | null)[]>;
};

/* Stacked spec panels — same architecture as ImageReel. The topmost panel
 * peels off (handled by ProductShowcase) to reveal the next one.
 *
 * Text color adapts to `rightColor`'s luminance via `textOn(...)`: the
 * generators' new palettes use very light right-side fills (#F4CCCC,
 * #D0D0D0, etc.) which need black text; BESS keeps its mid-tone fills
 * with white text. The hue is published as a CSS variable on the
 * section so child elements can opt in via inline `color` + Tailwind
 * `opacity-X` classes (Tailwind's text-color/alpha shorthand can't
 * carry an arbitrary CSS variable). */
export default function SpecReel({ products, panelRefs, contentRefs }: Props) {
  return (
    <>
      {products.map((product, i) => {
        const fg = textOn(product.rightColor);
        const sectionStyle: CSSProperties = {
          backgroundColor: product.rightColor,
          zIndex: products.length - i,
          color: fg,
          ["--pz-fg" as string]: fg,
        };

        return (
          <section
            key={`${product.slug}-${i}`}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className="absolute inset-0 will-change-transform font-body"
            style={sectionStyle}
          >
            {/* Content is anchored to a fixed top offset (not vertically
             * centered). With centering, varying content lengths shift
             * the entire block — title, badge, etc. land at slightly
             * different Y per product, which the wipe transition would
             * highlight. Anchored to top, every product's badge/title
             * sits at exactly the same row, so the wipe replaces them
             * in place. */}
            <div
              ref={(el) => {
                if (contentRefs) contentRefs.current[i] = el;
              }}
              className="flex h-full flex-col px-10 md:pl-[17vw] md:pr-12 lg:pr-20 pt-[18vh] will-change-[clip-path]"
            >
              <div className="mb-5 flex items-center gap-4">
                <span
                  aria-hidden
                  className="h-px w-10"
                  style={{ backgroundColor: fg, opacity: 0.45 }}
                />
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.32em]"
                  style={{ opacity: 0.7 }}
                >
                  {product.origin}
                </span>
              </div>

              {/* Big product title intentionally omitted — the centered
               * card already carries the product name. */}
              <p
                className="text-[12px] md:text-[13px] font-medium uppercase tracking-[0.24em]"
                style={{ opacity: 0.8 }}
              >
                {product.tagline}
              </p>

              <p
                className="mt-7 max-w-[34rem] text-[13px] md:text-[14px] leading-relaxed"
                style={{ opacity: 0.8 }}
              >
                {product.overview}
              </p>

              <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-10">
                <div>
                  <h3
                    className="font-mono text-[10px] uppercase tracking-[0.32em]"
                    style={{ opacity: 0.55 }}
                  >
                    Capabilities
                  </h3>
                  <ul
                    className="mt-3 space-y-1.5 text-[13px]"
                    style={{ opacity: 0.85 }}
                  >
                    {product.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full"
                          style={{ backgroundColor: fg, opacity: 0.65 }}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3
                    className="font-mono text-[10px] uppercase tracking-[0.32em]"
                    style={{ opacity: 0.55 }}
                  >
                    Applications
                  </h3>
                  <ul
                    className="mt-3 space-y-1.5 text-[13px]"
                    style={{ opacity: 0.75 }}
                  >
                    {product.applications.map((application) => (
                      <li key={application} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full"
                          style={{ backgroundColor: fg, opacity: 0.4 }}
                        />
                        <span>{application}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
