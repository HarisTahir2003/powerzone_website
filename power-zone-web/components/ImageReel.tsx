"use client";

import Image from "next/image";
import { forwardRef } from "react";
import type { Product } from "@/data/products";

type Props = {
  products: Product[];
  side: "left" | "right";
};

const ImageReel = forwardRef<HTMLDivElement, Props>(function ImageReel(
  { products, side },
  ref,
) {
  return (
    <div
      ref={ref}
      className="will-change-transform"
      style={{ height: `${products.length * 100}%` }}
    >
      {products.map((product, i) => {
        const src = side === "left" ? product.leftImage : product.rightImage;
        return (
          <div
            key={product.id}
            className="relative h-screen w-full overflow-hidden"
            style={{ backgroundColor: product.accentColor }}
          >
            <Image
              src={src}
              alt={`${product.title} — ${side} view`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={i === 0}
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
});

export default ImageReel;
