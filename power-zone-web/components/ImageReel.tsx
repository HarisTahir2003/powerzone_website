"use client";

import Image from "next/image";
import { forwardRef } from "react";
import type { Product } from "@/data/products";

type Props = {
  products: Product[];
  reversed?: boolean;
};

const ImageReel = forwardRef<HTMLDivElement, Props>(function ImageReel(
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
      {ordered.map((product, i) => (
        <div
          key={product.id}
          className="relative h-screen w-full overflow-hidden"
          style={{ backgroundColor: product.leftColor }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-8 md:p-14 md:pr-[17vw]">
            <div className="relative h-full w-full">
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={i === 0}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default ImageReel;
