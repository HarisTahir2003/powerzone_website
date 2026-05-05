/* -----------------------------------------------------------------------------
 * Power Zone — product showcase data
 *
 * Each product drives:
 *   - left reel  (ImageReel) — the generator photo
 *   - right reel (SpecReel)  — the marketing/spec copy
 *   - center card (ProductCard) — title, subtitle, category, year
 *
 * Three colors per product drive the scene:
 *   - leftColor  : deeper brand tone, anchors the generator image
 *   - rightColor : lighter sibling tone, improves readability of the spec copy
 *   - accentColor: mid-tone, tints the center card (sits visually between
 *                  the two panels so the card reads as a distinct object)
 *
 * Copy is sourced from https://powerzone.com.pk/ (`/fpt`, `/perkins`,
 * `/cummins`, `/yuchai`).
 * -------------------------------------------------------------------------- */

export type Product = {
  id: number;
  slug: string;
  image: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  accentColor: string;
  leftColor: string;
  rightColor: string;
  /** Background color for the horizontal-scroll detail panels (the
   * "product description" surface the user slides through after the
   * click choreography). Typically the lightest tone in the product's
   * palette so the description copy reads as black-on-paper. */
  descriptionBgColor: string;
  /** Two additional product images shown in the gallery panel inside
   * the detail experience. */
  gallery: [string, string];
  origin: string;
  tagline: string;
  overview: string;
  features: string[];
  applications: string[];
  url: string;
};

/** Returns "#FFFFFF" or "#000000" depending on which gives better
 * contrast on `bg`. Uses a perceived-luminance (YIQ) split so it
 * matches what the eye actually sees, not just the math. */
export function textOn(bg: string): "#FFFFFF" | "#000000" {
  const hex = bg.startsWith("#") ? bg.slice(1) : bg;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 140 ? "#000000" : "#FFFFFF";
}

export const products: Product[] = [
  {
    id: 1,
    slug: "FPT",
    image: "/images/fpt_product_1.png",
    title: "FPT Generator",
    subtitle: "Diesel — Italian Engineering",
    category: "Industrial",
    year: "Italy",
    accentColor: "#2f0000",
    leftColor: "#2f0000",
    rightColor: "#F4CCCC",
    descriptionBgColor: "#FFEEEE",
    gallery: ["/images/fpt_product_2.avif", "/images/fpt_product_3.avif"],
    origin: "Italian Engineering",
    tagline: "Built on European precision",
    overview:
      "Italian-engineered diesel gensets designed for reliable performance across residential, commercial, and industrial loads. Advanced combustion technology delivers fuel-efficient output with the durability FPT Industrial is known for.",
    features: [
      "Peak load handling with instant response",
      "Precise voltage and frequency regulation",
      "High fuel efficiency, extended service intervals",
      "Long operational life backed by Italian engineering",
    ],
    applications: [
      "Industrial facilities",
      "Hospitals",
      "Data centers",
      "Construction sites",
      "Residential backup",
      "Microgrid integration",
    ],
    url: "https://powerzone.com.pk/fpt",
  },
  {
    id: 2,
    slug: "Perkins",
    image: "/images/perkins_product_1.png",
    title: "Perkins Generator",
    subtitle: "Diesel — British Engineering",
    category: "Commercial",
    year: "UK",
    accentColor: "#101010",
    leftColor: "#101010",
    rightColor: "#D0D0D0",
    descriptionBgColor: "#FBFBFB",
    gallery: [
      "/images/perkins_product_2.avif",
      "/images/perkins_product_3.avif",
    ],
    origin: "British Engineering",
    tagline: "Built for durability and efficiency",
    overview:
      "Fuel-optimized Perkins engines deliver dependable power with minimal environmental impact. Rugged British engineering tuned for long service life in harsh operating environments.",
    features: [
      "High-efficiency combustion with rugged alternator",
      "Fuel-efficient performance reducing operating cost",
      "Extended service intervals, minimal maintenance",
      "Stable output protects sensitive equipment",
    ],
    applications: [
      "Factories & industrial facilities",
      "Hospitals & healthcare",
      "Construction sites",
      "Commercial offices & retail",
      "Residential backup",
      "Data centers",
    ],
    url: "https://powerzone.com.pk/perkins",
  },
  {
    id: 3,
    slug: "Cummins",
    image: "/images/cummins_product_1.png",
    title: "Cummins Generator",
    subtitle: "Diesel — American Power",
    category: "Utility",
    year: "USA",
    accentColor: "#002000",
    leftColor: "#002000",
    rightColor: "#CCF0CC",
    descriptionBgColor: "#EEFFEE",
    gallery: [
      "/images/cummins_product_2.avif",
      "/images/cummins_product_3.avif",
    ],
    origin: "American Power",
    tagline: "American muscle, global reliability",
    overview:
      "Long-term durability and reliable performance engineered for mission-critical loads. Advanced combustion technology with optimized fuel consumption, field-tested across decades of industrial service.",
    features: [
      "Rapid startup within seconds of an outage",
      "Smart load monitoring with live output adjustment",
      "Consistent voltage and frequency regulation",
      "Reduced emissions and operating cost",
    ],
    applications: [
      "Industrial facilities",
      "Healthcare",
      "Data centers",
      "Microgrids & hybrid renewables",
      "Off-grid installations",
    ],
    url: "https://powerzone.com.pk/cummins",
  },
  {
    id: 4,
    slug: "Yuchai",
    image: "/images/yuchai_product_1.png",
    title: "Yuchai Generator",
    subtitle: "Diesel — High Value Performance",
    category: "Industrial",
    year: "China",
    accentColor: "#000022",
    leftColor: "#000022",
    rightColor: "#CCCCE0",
    descriptionBgColor: "#EEEEFF",
    gallery: [
      "/images/yuchai_product_2.jpeg",
      "/images/yuchai_product_3.avif",
    ],
    origin: "Chinese Manufacturing",
    tagline: "High value performance",
    overview:
      "Cost-effective diesel generators from China's largest engine manufacturer. Reliable prime and standby power across a wide load spectrum, engineered for continuous service in demanding environments.",
    features: [
      "Strong engine output with low fuel consumption",
      "Voltage and frequency stability under peak load",
      "Long service intervals and extended lifespan",
      "Prime and standby power configurations",
    ],
    applications: [
      "Factories & warehouses",
      "Hospitals",
      "Offices",
      "Load-shedding backup",
      "Construction sites",
    ],
    url: "https://powerzone.com.pk/yuchai",
  },
];

/* -----------------------------------------------------------------------------
 * BESS — Battery Energy Storage Solutions catalog.
 *
 * Same Product shape as `products` so the same showcase + detail experience
 * can drive either catalog. Copy is placeholder for now and should be
 * replaced with real marketing language before launch.
 * -------------------------------------------------------------------------- */

export const bessProducts: Product[] = [
  {
    id: 1,
    slug: "Battery",
    image: "/images/battery_product_1.png",
    title: "Lithium Battery",
    subtitle: "High-Density Storage Module",
    category: "Energy Storage",
    year: "2025",
    accentColor: "#0F0F0F",
    leftColor: "#0F0F0F",
    rightColor: "#FAFAFA",
    descriptionBgColor: "#000000",
    gallery: [
      "/images/battery_product_1.png",
      "/images/battery_product_1.png",
    ],
    origin: "Pakistan Engineered",
    tagline: "Modular density for every load profile",
    overview:
      "High-cycle lithium iron phosphate cells packaged into a rack-mountable module. Pair multiple modules to scale capacity from a single-room UPS to industrial cabinets without re-engineering the BMS.",
    features: [
      "Long cycle life with thermal monitoring",
      "Active cell balancing for stable discharge",
      "Modular form factor — scale by adding units",
      "Integrated battery management system",
    ],
    applications: [
      "Off-grid solar storage",
      "Telecom backup",
      "Commercial UPS",
      "Industrial load shifting",
      "Microgrid integration",
    ],
    url: "https://powerzone.com.pk/battery",
  },
  {
    id: 2,
    slug: "BESS",
    image: "/images/bess_product_1.png",
    title: "BESS Cabinet",
    subtitle: "Battery Energy Storage System",
    category: "Storage System",
    year: "2025",
    accentColor: "#1A1A1A",
    leftColor: "#1A1A1A",
    rightColor: "#F0F0F0",
    descriptionBgColor: "#000000",
    gallery: [
      "/images/bess_product_1.png",
      "/images/bess_product_1.png",
    ],
    origin: "Pakistan Engineered",
    tagline: "Integrated cabinet for grid-edge storage",
    overview:
      "A complete cabinet that bundles battery racks, the BMS, the inverter interface, and thermal management. Drop in a single unit to convert intermittent renewable supply into steady-state power.",
    features: [
      "Pre-wired battery + power-conversion stack",
      "Active cooling tuned for sustained discharge",
      "Grid-tied or off-grid operation modes",
      "Remote telemetry and fleet monitoring",
    ],
    applications: [
      "Solar + storage installations",
      "Industrial peak shaving",
      "Backup for critical infrastructure",
      "Microgrid anchor storage",
    ],
    url: "https://powerzone.com.pk/bess",
  },
  {
    id: 3,
    slug: "Inverter",
    image: "/images/inverter_product_1.png",
    title: "Hybrid Inverter",
    subtitle: "Bi-directional Power Conversion",
    category: "Power Electronics",
    year: "2025",
    accentColor: "#252525",
    leftColor: "#252525",
    rightColor: "#E8E8E8",
    descriptionBgColor: "#000000",
    gallery: [
      "/images/inverter_product_1.png",
      "/images/inverter_product_1.png",
    ],
    origin: "Pakistan Engineered",
    tagline: "DC-AC conversion at grid-stable quality",
    overview:
      "A bi-directional hybrid inverter that handles both battery charging and AC inversion in one chassis. Sub-millisecond switchover keeps loads online during grid drops without dropping a frame.",
    features: [
      "Bi-directional MPPT for solar + battery",
      "Sub-millisecond grid-to-island transfer",
      "High-efficiency conversion across load range",
      "Configurable for single- or three-phase output",
    ],
    applications: [
      "Hybrid solar systems",
      "Backup power for residential & commercial",
      "Off-grid microgrids",
      "EV charging infrastructure",
    ],
    url: "https://powerzone.com.pk/inverter",
  },
];
