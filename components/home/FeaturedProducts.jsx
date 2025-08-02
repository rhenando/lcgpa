"use client";

import { useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import { featuredProducts } from "@/lib/mock-data";

export default function FeaturedProducts() {
  const [activeFilter, setActiveFilter] = useState("All");

  // CHANGED: Use "Sector Code" as the filter name
  const filters = ["All", "Sector Code", "Product Code"];

  const filteredProducts = featuredProducts.filter((product) => {
    if (activeFilter === "All") {
      return true;
    }
    // CHANGED: Logic now checks for 'sectorCode'
    if (activeFilter === "Sector Code") {
      return Boolean(product.sectorCode);
    }
    if (activeFilter === "Product Code") {
      return Boolean(product.productCode);
    }
    return false;
  });

  return (
    <section className='py-16 sm:py-24'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='text-left text-3xl font-bold tracking-tight text-gray-900'>
          Featured Products
        </h2>
        <div className='mt-6 sm:mt-0 flex items-center gap-2 flex-wrap'>
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeFilter === filter
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className='mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8'>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
