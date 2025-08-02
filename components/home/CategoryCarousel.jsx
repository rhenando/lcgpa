"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "../../i18n/routing";

import { Button } from "@/components/ui/button";
import { featuredProducts } from "@/lib/mock-data";

/**
 * A responsive carousel component that shows category links on desktop
 * and a call-to-action button on mobile.
 */
export default function CategoryCarousel() {
  const t = useTranslations("navigation");
  const locale = useLocale();
  const isRTL = locale === "ar";

  // --- Load appropriate mock data based on locale ---
  const [localizedProducts, setLocalizedProducts] = useState(featuredProducts);

  useEffect(() => {
    const loadLocalizedData = async () => {
      if (locale === "ar") {
        try {
          const { featuredProducts: arabicProducts } = await import(
            "@/lib/mock-data-ar"
          );
          setLocalizedProducts(arabicProducts);
        } catch (error) {
          console.log("Arabic mock data not found, using default");
          setLocalizedProducts(featuredProducts);
        }
      } else {
        setLocalizedProducts(featuredProducts);
      }
    };

    loadLocalizedData();
  }, [locale]);

  // --- Carousel Logic (for desktop) ---
  const categories = React.useMemo(() => {
    return [
      ...new Set(localizedProducts.map((p) => p.category).filter(Boolean)),
    ];
  }, [localizedProducts]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      direction: isRTL ? "rtl" : "ltr",
    },
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
          <div className={`flex ${isRTL ? "-mr-2" : "-ml-2"}`}>
            {categories.map((category) => (
              <div
                className={`flex-shrink-0 flex-grow-0 basis-auto ${
                  isRTL ? "pr-2" : "pl-2"
                }`}
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

        {/* Navigation buttons - swap positions for RTL */}
        <button
          onClick={isRTL ? scrollNext : scrollPrev}
          disabled={isRTL ? nextBtnDisabled : prevBtnDisabled}
          className={`absolute top-1/2 -translate-y-1/2 ${
            isRTL ? "right-0" : "left-0"
          } z-10 flex items-center justify-center h-10 w-10 rounded-full bg-white/80 hover:bg-white border border-emerald-200 text-emerald-900 disabled:opacity-50 transition`}
        >
          {isRTL ? (
            <ChevronRight className='h-5 w-5' />
          ) : (
            <ChevronLeft className='h-5 w-5' />
          )}
        </button>
        <button
          onClick={isRTL ? scrollPrev : scrollNext}
          disabled={isRTL ? prevBtnDisabled : nextBtnDisabled}
          className={`absolute top-1/2 -translate-y-1/2 ${
            isRTL ? "left-0" : "right-0"
          } z-10 flex items-center justify-center h-10 w-10 rounded-full bg-white/80 hover:bg-white border border-emerald-200 text-emerald-900 disabled:opacity-50 transition`}
        >
          {isRTL ? (
            <ChevronLeft className='h-5 w-5' />
          ) : (
            <ChevronRight className='h-5 w-5' />
          )}
        </button>
      </div>

      {/* --- Mobile Button (Visible below md screens) --- */}
      <div className='md:hidden container mx-auto p-4'>
        <div className='flex'>
          <Link href='/rfq' className='w-full'>
            <Button
              size='lg'
              className='w-full bg-brand-green text-white hover:bg-brand-green/90 font-semibold'
            >
              {t("rfq")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
