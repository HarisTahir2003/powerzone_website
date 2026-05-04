"use client";

import type { Product } from "@/data/products";

type Props = {
  /** The catalog whose product slugs are rendered as quick-links.
   * Mounted by `ProductsRoot` with the active category's items. */
  products: Product[];
};

export default function ProductNav({ products }: Props) {
  const handleClick = (index: number) => {
    window.dispatchEvent(
      new CustomEvent("pz:scrollToProduct", { detail: { index } }),
    );
  };

  return (
    <nav
      className="
        fixed right-6 top-6 z-[70] hidden md:flex items-center gap-7
        text-sm font-bold uppercase tracking-[0.22em] text-white font-display
        [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]
      "
    >
      {products.map((product, i) => (
        <button
          key={product.slug}
          type="button"
          onClick={() => handleClick(i)}
          className="cursor-pointer transition-opacity hover:opacity-75"
        >
          {product.slug}
        </button>
      ))}
    </nav>
  );
}
