import Image from "next/image";
import Link from "next/link";
import GrainOverlay from "@/components/GrainOverlay";
import ProductShowcase from "@/components/ProductShowcase";
import ProductNav from "@/components/ProductNav";

export const metadata = {
  title: "Products — Power Zone",
  description: "The Power Zone generator lineup.",
};

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

      {/* Top-right nav — generator quick-links */}
      <ProductNav />

      <ProductShowcase />
    </div>
  );
}
