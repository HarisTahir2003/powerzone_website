"use client";

/* -----------------------------------------------------------------------------
 * ProductsRoot
 *
 * Top-level client wrapper for the products page. Owns the category
 * state ("Generators" vs "BESS"), renders the top-center category
 * toggle, and mounts a ProductExperience for the active catalog.
 *
 * The `key={categoryId}` on ProductExperience is intentional — it
 * unmounts and remounts the experience on category change so the
 * showcase ScrollTrigger, Lenis instance, refs, and panel timeline all
 * reset cleanly. Trying to swap the products array in-place would
 * leave behind stale ScrollTriggers and pin spacers sized for the
 * previous catalog's N.
 * -------------------------------------------------------------------------- */

import { useState } from "react";
import {
  bessProducts,
  products as generators,
  type Product,
} from "@/data/products";
import ProductExperience from "./ProductExperience";
import ProductNav from "./ProductNav";

const CATEGORIES: ReadonlyArray<{
  id: string;
  label: string;
  items: Product[];
}> = [
  { id: "generators", label: "Generators", items: generators },
  { id: "bess", label: "BESS", items: bessProducts },
];

export default function ProductsRoot() {
  const [categoryId, setCategoryId] = useState<string>(CATEGORIES[0].id);
  const active = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0];

  return (
    <>
      {/* Top-center category toggle. Pill background sits above the
       * showcase so it's visible against any product accent color. */}
      <nav
        aria-label="Product category"
        className="fixed left-1/2 top-6 z-[80] flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/35 p-1 backdrop-blur-md ring-1 ring-white/10"
      >
        {CATEGORIES.map((c) => {
          const selected = c.id === categoryId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              aria-pressed={selected}
              className={`
                rounded-full px-5 py-2
                font-mono text-[11px] uppercase tracking-[0.28em]
                transition-colors
                ${
                  selected
                    ? "bg-white text-black"
                    : "text-white/75 hover:text-white"
                }
              `}
            >
              {c.label}
            </button>
          );
        })}
      </nav>

      {/* Brand quick-links — keyed on category so the buttons re-mount
       * when the active catalog changes. */}
      <ProductNav key={`nav-${categoryId}`} products={active.items} />

      <ProductExperience key={categoryId} products={active.items} />
    </>
  );
}
