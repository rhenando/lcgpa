import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoryCarousel from "@/components/home/CategoryCarousel";

export default function HomePage() {
  return (
    <main className='flex flex-col min-h-[80vh]'>
      <CategoryCarousel />

      {/* --- MODIFICATION --- */}
      {/* Reduced vertical padding (py) and gap (gap-y) for a more compact layout */}
      <div className='container mx-auto px-4 flex-grow flex flex-col gap-y-6 md:gap-y-6 py-6 md:py-6'>
        {/* --- END MODIFICATION --- */}
        <HeroSection />
        <FeaturedProducts />
      </div>
    </main>
  );
}
