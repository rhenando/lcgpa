"use client";

import { useState, useEffect, useCallback } from "react";
import ProductCard from "@/components/products/ProductCard";
import { featuredProducts } from "@/lib/mock-data";

// 1. Import the core hook and the autoplay plugin
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// A helper component for the SVG icon
const CaretIcon = () => (
  <svg
    className='w-6 h-6'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M9 5l7 7-7 7'
    />
  </svg>
);

export default function FeaturedProducts() {
  const uniqueCategories = [
    "All",
    ...new Set(featuredProducts.map((product) => product.category)),
  ];

  const [activeFilter, setActiveFilter] = useState("All");

  // 2. Initialize the hook with the Autoplay plugin
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: true, // Looping is recommended for autoplay
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true })] // Autoplays every 4 seconds
  );

  // --- State for navigation buttons ---
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(); // Set initial state
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );
  // --- End of navigation logic ---

  const filteredProducts = featuredProducts.filter((product) => {
    if (activeFilter === "All") {
      return true;
    }
    return product.category === activeFilter;
  });

  return (
    <section className='py-16 sm:py-24'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='text-left text-3xl font-bold tracking-tight text-gray-900 shrink-0'>
          Featured Products
        </h2>

        {/* 3. Wrap the carousel in a relative container to position the buttons */}
        <div className='relative mt-6 sm:mt-0 sm:ml-6 w-full max-w-xl'>
          <div className='embla overflow-hidden' ref={emblaRef}>
            <div className='embla__container flex gap-x-3'>
              {uniqueCategories.map((category, index) => (
                <div
                  key={index}
                  className='embla__slide flex-[0_0_auto] min-w-0'
                >
                  <button
                    onClick={() => setActiveFilter(category)}
                    className={`w-42 truncate whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                      activeFilter === category
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Add the navigation buttons (carets) */}
          <button
            className='absolute top-1/2 left-0 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-white shadow-md disabled:opacity-30'
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          >
            <span className='sr-only'>Previous</span>
            <div className='rotate-180'>
              <CaretIcon />
            </div>
          </button>
          <button
            className='absolute top-1/2 right-0 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-white shadow-md disabled:opacity-30'
            onClick={scrollNext}
            disabled={!canScrollNext}
          >
            <span className='sr-only'>Next</span>
            <CaretIcon />
          </button>
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
