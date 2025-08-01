import ProductCard from "@/components/products/ProductCard";
import { featuredProducts } from "@/lib/mock-data";

export default function FeaturedProducts() {
  return (
    <section className='py-16 sm:py-24'>
      <h2 className='text-center text-3xl font-bold tracking-tight text-gray-900'>
        Featured Products
      </h2>
      <div className='mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8'>
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
