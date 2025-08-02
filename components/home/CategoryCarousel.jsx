"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { featuredProducts } from "@/lib/mock-data";

/**
 * A responsive carousel component that shows category links on desktop
 * and call-to-action buttons on mobile.
 */
export default function CategoryCarousel() {
  // --- Carousel Logic (for desktop) ---
  const categories = React.useMemo(() => {
    return [
      ...new Set(featuredProducts.map((p) => p.category).filter(Boolean)),
    ];
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

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

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setPrevBtnDisabled(!emblaApi.canScrollPrev());
      setNextBtnDisabled(!emblaApi.canScrollNext());
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <section className='bg-emerald-50'>
      {/* --- Desktop Carousel (Visible on md screens and up) --- */}
      <div className='hidden md:block container mx-auto py-3 relative px-12'>
        <div className='overflow-hidden' ref={emblaRef}>
          <div className='flex -ml-2'>
            {categories.map((category) => (
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
        <button
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
          className='absolute top-1/2 -translate-y-1/2 left-0 z-10 flex items-center justify-center h-10 w-10 rounded-full bg-white/80 hover:bg-white border border-emerald-200 text-emerald-900 disabled:opacity-50 transition'
        >
          <ChevronLeft className='h-5 w-5' />
        </button>
        <button
          onClick={scrollNext}
          disabled={nextBtnDisabled}
          className='absolute top-1/2 -translate-y-1/2 right-0 z-10 flex items-center justify-center h-10 w-10 rounded-full bg-white/80 hover:bg-white border border-emerald-200 text-emerald-900 disabled:opacity-50 transition'
        >
          <ChevronRight className='h-5 w-5' />
        </button>
      </div>

      {/* --- Mobile Buttons (Visible below md screens) --- */}
      <div className='md:hidden container mx-auto p-4'>
        <div className='flex gap-2 sm:gap-3'>
          {/* --- MODIFICATION --- */}
          {/* Removed size="lg" and added responsive text and padding classes */}
          <Button className='flex-1 bg-brand-green text-white hover:bg-brand-green/90 font-semibold h-11 rounded-md text-xs sm:text-sm px-3'>
            Request a Quotation
          </Button>
          <Button
            variant='outline'
            className='flex-1 border-brand-green text-brand-green hover:bg-brand-green/5 font-semibold h-11 rounded-md text-xs sm:text-sm px-3'
          >
            Import from Saudi
          </Button>
        </div>
      </div>
    </section>
  );
}
