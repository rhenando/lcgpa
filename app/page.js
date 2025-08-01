import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";

export default function HomePage() {
  return (
    // The container can stay here or be moved to the layout file
    <div className='container mx-auto px-4 py-8'>
      <HeroSection />
      <FeaturedProducts />
    </div>
  );
}
