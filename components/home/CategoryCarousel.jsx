"use client";

import React, { useCallback, useEffect, useState } from "react";
// 1. Import the core Embla Carousel hook and the Autoplay plugin
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { featuredProducts } from "@/lib/mock-data";

/**
 * An auto-sliding and fully responsive carousel for product categories,
 * using the standalone embla-carousel-react library.
 * NOTE: This component requires `embla-carousel-react` and `embla-carousel-autoplay`.
 */
export default function CategoryCarousel() {
  const categories = React.useMemo(() => {
    return [
      ...new Set(featuredProducts.map((p) => p.category).filter(Boolean)),
    ];
  }, []);

  // 2. Set up the Embla Carousel hook with the Autoplay plugin
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  // State for controlling the custom navigation buttons
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  // Update button states when the carousel selection changes
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setPrevBtnDisabled(!emblaApi.canScrollPrev());
      setNextBtnDisabled(!emblaApi.canScrollNext());
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect(); // Set initial state
  }, [emblaApi]);

  return (
    <section className='bg-emerald-50'>
      {/* Main container with relative positioning for the buttons */}
      <div className='container mx-auto py-3 relative'>
        {/* The Embla Carousel viewport */}
        <div className='overflow-hidden' ref={emblaRef}>
          {/* The Embla Carousel container */}
          <div className='flex -ml-2'>
            {categories.map((category) => (
              // Each slide in the carousel
              <div
                className='flex-shrink-0 flex-grow-0 basis-auto pl-2'
                key={category}
              >
                <Button
                  variant='ghost'
                  className='text-emerald-900 font-semibold hover:bg-emerald-100 hover:text-emerald-900 whitespace-nowrap'
                >
                  {category}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* --- MODIFICATION --- */}
        {/* Adjusted button positioning to prevent overlap with text */}
        <button
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
          className='absolute top-1/2 -translate-y-1/2 -left-4 z-10 hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-white/80 hover:bg-white border border-emerald-200 text-emerald-900 disabled:opacity-50 transition'
        >
          <ChevronLeft className='h-5 w-5' />
        </button>
        <button
          onClick={scrollNext}
          disabled={nextBtnDisabled}
          className='absolute top-1/2 -translate-y-1/2 -right-4 z-10 hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-white/80 hover:bg-white border border-emerald-200 text-emerald-900 disabled:opacity-50 transition'
        >
          <ChevronRight className='h-5 w-5' />
        </button>
        {/* --- END MODIFICATION --- */}
      </div>
    </section>
  );
}
