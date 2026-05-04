import GrainOverlay from "@/components/GrainOverlay";
import ProductsRoot from "@/components/ProductsRoot";

export const metadata = {
  title: "Products — Power Zone",
  description: "The Power Zone generator and BESS lineup.",
};

export default function ProductsPage() {
  return (
    <div
      className="relative min-h-screen w-full text-[#222]"
      style={{ backgroundColor: "#EFEAE0" }}
    >
      <GrainOverlay />

      {/* ProductsRoot owns category state (Generators vs BESS), renders
       * the top-center toggle, and mounts the ProductExperience for the
       * active catalog. The top-left "back/home" logo lives inside the
       * experience because its behavior is phase-dependent (links home
       * in showcase, exits to listing in detail). */}
      <ProductsRoot />
    </div>
  );
}
