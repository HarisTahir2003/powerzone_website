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
  origin: string;
  tagline: string;
  overview: string;
  features: string[];
  applications: string[];
  url: string;
};

export const products: Product[] = [
  {
    id: 1,
    slug: "FPT",
    image: "/images/fpt1.png",
    title: "FPT Generator",
    subtitle: "Diesel — Italian Engineering",
    category: "Industrial",
    year: "Italy",
    accentColor: "#8B1F24",
    leftColor: "#6B1418",
    rightColor: "#B85450",
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
    image: "/images/perkins2.png",
    title: "Perkins Generator",
    subtitle: "Diesel — British Engineering",
    category: "Commercial",
    year: "UK",
    accentColor: "#2D4A2E",
    leftColor: "#1A2E1C",
    rightColor: "#5F8A5F",
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
    image: "/images/cummins2.png",
    title: "Cummins Generator",
    subtitle: "Diesel — American Power",
    category: "Utility",
    year: "USA",
    accentColor: "#1B2631",
    leftColor: "#0E1620",
    rightColor: "#4A5E72",
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
    image: "/images/yuchai2.png",
    title: "Yuchai Generator",
    subtitle: "Diesel — High Value Performance",
    category: "Industrial",
    year: "China",
    accentColor: "#6B4423",
    leftColor: "#3E2A14",
    rightColor: "#A07A3E",
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
