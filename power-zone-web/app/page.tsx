import Link from "next/link";
import GrainOverlay from "@/components/GrainOverlay";

export const metadata = {
  title: "Power Zone",
  description: "Power Zone — reliable generator solutions.",
};

const NAV_LINKS = [
  { label: "PRODUCTS", href: "/products" },
  { label: "SOLUTIONS", href: "/solutions" },
  { label: "ABOUT", href: "/about" },
  { label: "SUPPORT", href: "/support" },
  { label: "CONTACT", href: "/contact" },
];

export default function Home() {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col text-[#222]"
      style={{ backgroundColor: "#EFEAE0" }}
    >
      <GrainOverlay />

      {/* Top-left wordmark */}
      <div className="fixed left-6 top-6 z-[70] leading-[0.82] tracking-[-0.04em] mix-blend-difference">
        <div className="text-[15px] font-semibold text-white">P</div>
        <div className="text-[15px] font-semibold text-white">Z</div>
      </div>

      {/* Top-right nav */}
      <nav className="fixed right-6 top-6 z-[70] hidden md:flex items-center gap-5 text-[11px] tracking-[0.14em] text-black/80">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="hover:text-black transition-colors"
          >
            {link.label}
          </Link>
        ))}
        <span className="mx-2 h-3 w-px bg-black/20" aria-hidden />
        <a
          href="https://instagram.com/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-black transition-colors"
        >
          INSTAGRAM
        </a>
      </nav>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6">
        <div className="flex flex-col items-center gap-8 text-center">
          <span className="text-[11px] uppercase tracking-[0.24em] text-black/50">
            Power Zone
          </span>
          <h1
            className="font-semibold leading-[0.95] text-[clamp(48px,9vw,128px)]"
            style={{ letterSpacing: "-0.03em" }}
          >
            Power,
            <br />
            engineered.
          </h1>
          <p className="max-w-md text-[13px] leading-relaxed text-black/60">
            The landing experience is coming. In the meantime, step into the
            product lineup.
          </p>
          <Link
            href="/products"
            className="
              inline-flex h-11 items-center gap-3 rounded-full
              bg-black px-6 text-[12px] uppercase tracking-[0.14em]
              text-[#EFEAE0] transition-colors hover:bg-black/80
            "
          >
            Explore products
            <svg
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M4 12 L12 4" strokeLinecap="round" />
              <path d="M6 4 L12 4 L12 10" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
