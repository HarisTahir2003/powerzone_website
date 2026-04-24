"use client";

import { products } from "@/data/products";

export default function ProductNav() {
  const handleClick = (index: number) => {
    window.dispatchEvent(
      new CustomEvent("pz:scrollToProduct", { detail: { index } }),
    );
  };

  return (
    <nav
      className="
        fixed right-6 top-6 z-[70] hidden md:flex items-center gap-7
        text-sm font-bold uppercase tracking-[0.22em] text-white
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
