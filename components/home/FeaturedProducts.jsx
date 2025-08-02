"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import ProductCard from "@/components/products/ProductCard";
import { featuredProducts } from "@/lib/mock-data";

// Import the core hook and the autoplay plugin
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
  const t = useTranslations("home");
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

  const uniqueCategories = [
    locale === "ar" ? "الكل" : "All",
    ...new Set(localizedProducts.map((product) => product.category)),
  ];

  const [activeFilter, setActiveFilter] = useState(
    locale === "ar" ? "الكل" : "All"
  );

  // Update active filter when locale changes
  useEffect(() => {
    setActiveFilter(locale === "ar" ? "الكل" : "All");
  }, [locale]);

  // Initialize the hook with the Autoplay plugin and RTL support
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: true,
      direction: isRTL ? "rtl" : "ltr",
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
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

  const filteredProducts = localizedProducts.filter((product) => {
    const allCategory = locale === "ar" ? "الكل" : "All";
    if (activeFilter === allCategory) {
      return true;
    }
    return product.category === activeFilter;
  });

  return (
    <section className='py-16 sm:py-24'>
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${
          isRTL ? "sm:flex-row-reverse" : ""
        }`}
      >
        <h2
          className={`text-3xl font-bold tracking-tight text-gray-900 shrink-0 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("featuredProducts") ||
            (locale === "ar" ? "المنتجات المميزة" : "Featured Products")}
        </h2>

        {/* Wrap the carousel in a relative container with RTL support */}
        <div
          className={`relative mt-6 sm:mt-0 w-full max-w-xl ${
            isRTL ? "sm:mr-6" : "sm:ml-6"
          }`}
        >
          <div className='embla overflow-hidden' ref={emblaRef}>
            <div
              className={`embla__container flex ${
                isRTL ? "gap-x-reverse gap-x-3" : "gap-x-3"
              }`}
            >
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

          {/* Navigation buttons with RTL support */}
          <button
            className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-md disabled:opacity-30 ${
              isRTL ? "right-0 translate-x-12" : "left-0 -translate-x-12"
            }`}
            onClick={isRTL ? scrollNext : scrollPrev}
            disabled={isRTL ? !canScrollNext : !canScrollPrev}
          >
            <span className='sr-only'>{isRTL ? "التالي" : "Previous"}</span>
            <div className={isRTL ? "" : "rotate-180"}>
              <CaretIcon />
            </div>
          </button>
          <button
            className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-md disabled:opacity-30 ${
              isRTL ? "left-0 -translate-x-12" : "right-0 translate-x-12"
            }`}
            onClick={isRTL ? scrollPrev : scrollNext}
            disabled={isRTL ? !canScrollPrev : !canScrollNext}
          >
            <span className='sr-only'>{isRTL ? "السابق" : "Next"}</span>
            <div className={isRTL ? "rotate-180" : ""}>
              <CaretIcon />
            </div>
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
