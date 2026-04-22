/* -----------------------------------------------------------------------------
 * Power Zone — product showcase data
 *
 * HOW TO SWAP PLACEHOLDER IMAGES FOR REAL PRODUCT PHOTOS
 * ------------------------------------------------------
 *   1. Drop real photos into `public/products/` (e.g. `titan-x500-left.jpg`,
 *      `titan-x500-right.jpg`). Keep two images per product:
 *         - leftImage:  wider context / install shot
 *         - rightImage: close-up / detail shot
 *   2. Replace each `leftImage` / `rightImage` string below with the local path,
 *      e.g. `/products/titan-x500-left.jpg`. The `next/image` config in
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
    slug: "titan-x500",
    leftImage: placeholder("pz1-left", 1600, 2000),
    rightImage: placeholder("pz1-right", 1400, 2000),
    title: "Titan X500",
    subtitle: "Diesel — 500kVA",
    category: "Industrial",
    year: "2025",
    accentColor: "#C1623E", // terracotta
  },
  {
    id: 2,
    slug: "titan-x250",
    leftImage: placeholder("pz2-left", 1600, 2000),
    rightImage: placeholder("pz2-right", 1400, 2000),
    title: "Titan X250",
    subtitle: "Diesel — 250kVA",
    category: "Industrial",
    year: "2024",
    accentColor: "#8A9A7B", // sage
  },
  {
    id: 3,
    slug: "apex-100",
    leftImage: placeholder("pz3-left", 1600, 2000),
    rightImage: placeholder("pz3-right", 1400, 2000),
    title: "Apex 100",
    subtitle: "Natural Gas — 100kVA",
    category: "Commercial",
    year: "2025",
    accentColor: "#4A5562", // slate
  },
  {
    id: 4,
    slug: "nova-40",
    leftImage: placeholder("pz4-left", 1600, 2000),
    rightImage: placeholder("pz4-right", 1400, 2000),
    title: "Nova 40",
    subtitle: "Natural Gas — 40kVA",
    category: "Residential",
    year: "2024",
    accentColor: "#D4A038", // amber
  },
  {
    id: 5,
    slug: "sentinel-1000",
    leftImage: placeholder("pz5-left", 1600, 2000),
    rightImage: placeholder("pz5-right", 1400, 2000),
    title: "Sentinel 1000",
    subtitle: "Diesel — 1000kVA",
    category: "Utility",
    year: "2025",
    accentColor: "#1F2A44", // deep navy
  },
];
