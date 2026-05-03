import GrainOverlay from "@/components/GrainOverlay";
import ProductExperience from "@/components/ProductExperience";
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

      {/* Top-right nav — generator quick-links */}
      <ProductNav />

      {/* The unified showcase + detail experience. The top-left "back/
       * home" logo lives inside this component because its behavior is
       * phase-dependent (links home in showcase, exits to listing in
       * detail). */}
      <ProductExperience />
    </div>
  );
}
