import Image from "next/image";
import Link from "next/link";
import GrainOverlay from "@/components/GrainOverlay";
import ProductShowcase from "@/components/ProductShowcase";

export const metadata = {
  title: "Products — Power Zone",
  description: "The Power Zone generator lineup.",
};

const NAV_LINKS = [
  { label: "PRODUCTS", href: "/products" },
  { label: "SOLUTIONS", href: "/solutions" },
  { label: "ABOUT", href: "/about" },
  { label: "SUPPORT", href: "/support" },
  { label: "CONTACT", href: "/contact" },
];

export default function ProductsPage() {
  return (
    <div
      className="relative min-h-screen w-full text-[#222]"
      style={{ backgroundColor: "#EFEAE0" }}
    >
      <GrainOverlay />

      {/* Top-left logo — drop the attached Power Zone logo at public/power-zone-logo.png */}
      <Link
        href="/"
        aria-label="Power Zone home"
        className="fixed left-6 top-6 z-[70] mix-blend-difference"
      >
        <Image
          src="/power-zone-logo.png"
          alt="Power Zone"
          width={56}
          height={56}
          priority
          className="h-12 w-12 object-contain"
        />
      </Link>

      {/* Top-right nav */}
      <nav className="fixed right-6 top-6 z-[70] hidden md:flex items-center gap-5 text-[10px] font-bold tracking-[0.16em] text-white mix-blend-difference">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="transition-opacity hover:opacity-70"
          >
            {link.label}
          </Link>
        ))}
        <span className="mx-2 h-3 w-px bg-white/40" aria-hidden />
        <a
          href="https://instagram.com/"
          target="_blank"
          rel="noreferrer"
          className="transition-opacity hover:opacity-70"
        >
          INSTAGRAM
        </a>
      </nav>

      <ProductShowcase />
    </div>
  );
}
