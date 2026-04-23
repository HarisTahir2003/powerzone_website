/* -----------------------------------------------------------------------------
 * Power Zone — product showcase data
 *
 * HOW TO SWAP PLACEHOLDER IMAGES FOR REAL PRODUCT PHOTOS
 * ------------------------------------------------------
 *   1. Drop real photos into `public/products/` (e.g. `fpt-left.jpg`,
 *      `fpt-right.jpg`). Keep two images per product:
 *         - leftImage:  wider context / install shot
 *         - rightImage: close-up / detail shot
 *   2. Replace each `leftImage` / `rightImage` string below with the local path,
 *      e.g. `/products/fpt-left.jpg`. The `next/image` config in
 *      `next.config.ts` doesn't need `remotePatterns` for local paths — you can
 *      remove the `picsum.photos` entry once all images are local.
 *   3. If you want to centralise the image folder, change the `IMAGE_BASE`
 *      constant below. All placeholder URLs use it; local photos can ignore it.
 *
 * To add more products, append to the `products` array. All downstream
 * components (ImageReel, ProductCard, ProductShowcase) loop over this list, so
 * nothing else needs editing.
 * -------------------------------------------------------------------------- */

export const IMAGE_BASE = "https://picsum.photos/seed";

export type Product = {
  id: number;
  slug: string;
  leftImage: string;
  rightImage: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  accentColor: string;
};

const placeholder = (seed: string, w: number, h: number) =>
  `${IMAGE_BASE}/${seed}/${w}/${h}`;

export const products: Product[] = [
  {
    id: 1,
    slug: "fpt",
    leftImage: placeholder("pz-fpt-left", 1600, 2000),
    rightImage: placeholder("pz-fpt-right", 1400, 2000),
    title: "FPT Generator",
    subtitle: "Diesel — 500kVA",
    category: "Industrial",
    year: "2025",
    accentColor: "#C1623E", // terracotta
  },
  {
    id: 2,
    slug: "yuchai",
    leftImage: placeholder("pz-yuchai-left", 1600, 2000),
    rightImage: placeholder("pz-yuchai-right", 1400, 2000),
    title: "Yuchai Generator",
    subtitle: "Diesel — 250kVA",
    category: "Industrial",
    year: "2024",
    accentColor: "#8A9A7B", // sage
  },
  {
    id: 3,
    slug: "cummins",
    leftImage: placeholder("pz-cummins-left", 1600, 2000),
    rightImage: placeholder("pz-cummins-right", 1400, 2000),
    title: "Cummins Generator",
    subtitle: "Diesel — 1000kVA",
    category: "Utility",
    year: "2025",
    accentColor: "#4A5562", // slate
  },
  {
    id: 4,
    slug: "perkins",
    leftImage: placeholder("pz-perkins-left", 1600, 2000),
    rightImage: placeholder("pz-perkins-right", 1400, 2000),
    title: "Perkins Generator",
    subtitle: "Diesel — 100kVA",
    category: "Commercial",
    year: "2024",
    accentColor: "#1F2A44", // deep navy
  },
];
