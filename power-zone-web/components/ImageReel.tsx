"use client";

import Image from "next/image";
import type { MutableRefObject } from "react";
import type { Product } from "@/data/products";

type Props = {
  products: Product[];
  panelRefs: MutableRefObject<(HTMLElement | null)[]>;
};

/* Stacked image panels — first product on top (highest z-index), each
 * subsequent product underneath. ProductShowcase peels the topmost panel
 * up to reveal the next one. The revealed panel is static at `inset-0`;
 * only the transform of the panel currently being peeled changes during
 * a transition. This is the "Mersi" reveal — pages don't slide as a unit,
 * only the cover comes off. */
export default function ImageReel({ products, panelRefs }: Props) {
  return (
    <>
      {products.map((product, i) => (
        <div
          key={`${product.slug}-${i}`}
          ref={(el) => {
            panelRefs.current[i] = el;
          }}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundColor: product.leftColor,
            zIndex: products.length - i,
          }}
        >
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={i === 0}
            className="object-cover"
          />
        </div>
      ))}
    </>
  );
}
