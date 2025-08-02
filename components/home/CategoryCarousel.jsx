"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { featuredProducts } from "@/lib/mock-data";

/**
 * A responsive, text-based sliding carousel for product categories.
 */
export default function CategoryCarousel() {
  const categories = React.useMemo(() => {
    return [
      ...new Set(featuredProducts.map((p) => p.category).filter(Boolean)),
    ];
  }, []);

  return (
    // Removed vertical padding (py-4) to eliminate extra space.
    // Spacing should now be controlled by the parent layout.
    <section className='bg-emerald-50'>
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className='w-full container mx-auto'
      >
        <CarouselContent className='-ml-2'>
          {categories.map((category) => (
            <CarouselItem key={category} className='basis-auto pl-2'>
              <Button
                variant='ghost'
                className='text-emerald-900 font-semibold hover:bg-emerald-100 hover:text-emerald-900'
              >
                {category}
              </Button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='text-emerald-900 bg-white/80 hover:bg-white border-emerald-200' />
        <CarouselNext className='text-emerald-900 bg-white/80 hover:bg-white border-emerald-200' />
      </Carousel>
    </section>
  );
}
