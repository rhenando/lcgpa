// src/components/CarouselHeroSection.jsx

"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image"; // 1. Import next/image
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import { Button } from "@/components/ui/button";
import { featuredProducts } from "@/lib/mock-data"; // 2. Import your product data

// --- Slide Data ---
const slides = [
  {
    id: 1,
    title: "Empowering Local Commerce",
    description:
      "Quality products that support our national industry. Inspired by Vision 2030.",
    buttonText: "Shop All Products",
    imageUrl: "/hero2.png",
  },
  {
    id: 2,
    title: "Join the National Movement",
    description: "Discover how your business can contribute and benefit.",
    buttonText: "Learn How",
    imageUrl: "/hero3.png",
  },
];

export default function CarouselHeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      initial: 0,
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
      created() {
        setLoaded(true);
      },
    },
    [
      (slider) => {
        let timeout;
        let mouseOver = false;
        function clearNextTimeout() {
          clearTimeout(timeout);
        }
        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 4000);
        }
        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  // 3. Dynamically generate categories from mock-data.js
  const categories = useMemo(() => {
    const uniqueCategories = new Map();
    featuredProducts.forEach((product) => {
      if (product.category && !uniqueCategories.has(product.category)) {
        uniqueCategories.set(product.category, {
          name: product.category,
          img: product.imageUrl, // Use the local image URL from the product
        });
      }
    });
    return Array.from(uniqueCategories.values());
  }, []);

  return (
    // 4. Use a parent div to contain both sections
    <div>
      {/* --- Hero Slider Section --- */}
      <section className='relative rounded-lg overflow-hidden'>
        <div ref={sliderRef} className='keen-slider'>
          {slides.map((slide) => (
            <div
              key={slide.id}
              className='keen-slider__slide'
              style={{
                backgroundImage: `url(${slide.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className='absolute inset-0 bg-brand-green/80'></div>
              <div className='relative z-10 flex flex-col justify-center min-h-[400px] py-24 md:py-32 p-8 md:p-12 text-white text-left'>
                <div className='max-w-3xl'>
                  <h1 className='text-4xl font-extrabold tracking-tight md:text-5xl'>
                    {slide.title}
                  </h1>
                  <p className='mt-4 max-w-2xl text-lg text-green-100'>
                    {slide.description}
                  </p>
                  <Button
                    size='lg'
                    className='mt-8 bg-white text-brand-green hover:bg-gray-200 font-bold'
                  >
                    {slide.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loaded && instanceRef.current && (
          <div className='absolute bottom-5 left-1/2 flex -translate-x-1/2 transform space-x-2'>
            {[
              ...Array(instanceRef.current.track.details.slides.length).keys(),
            ].map((idx) => (
              <button
                key={idx}
                onClick={() => instanceRef.current?.moveToIdx(idx)}
                className={
                  "h-2 w-2 rounded-full transition-all duration-300 " +
                  (currentSlide === idx ? "bg-white w-6" : "bg-white/50")
                }
              ></button>
            ))}
          </div>
        )}
      </section>

      {/* 5. --- Category Grid Section --- */}
      <section className='bg-emerald-50 py-8 md:py-12 mt-[-2rem] rounded-b-lg'>
        <div className='container mx-auto pt-8'>
          <h2 className='text-center text-3xl font-bold text-gray-800 mb-8 md:mb-12'>
            Categories
          </h2>
          <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-x-4 gap-y-8'>
            {categories.map((category) => (
              <div
                key={category.name}
                className='flex flex-col items-center justify-start gap-3 cursor-pointer group'
              >
                <div className='relative w-24 h-24'>
                  <Image
                    src={category.img}
                    alt={category.name}
                    fill
                    className='rounded-full object-cover border-2 border-transparent group-hover:border-emerald-400 transition-all duration-300'
                    sizes='(max-width: 768px) 33vw, 11vw'
                  />
                </div>
                <p className='text-center text-sm font-medium text-gray-700 group-hover:text-emerald-800 line-clamp-2'>
                  {category.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
