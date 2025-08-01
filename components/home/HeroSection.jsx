// src/components/CarouselHeroSection.jsx

"use client"; // Required for hooks like useState and useKeenSlider

import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css"; // Import the slider's CSS

import { Button } from "@/components/ui/button";

// --- Define your slide data here ---
// You can populate this array with data from a CMS or API.
// For the first slide, use the image you uploaded.
const slides = [
  {
    id: 1,
    title: "Empowering Local Commerce",
    description:
      "Quality products that support our national industry. Inspired by Vision 2030.",
    buttonText: "Shop All Products",
    imageUrl: "/hero2.png", // Replace with another image
  },
  {
    id: 2,
    title: "Join the National Movement",
    description: "Discover how your business can contribute and benefit.",
    buttonText: "Learn How",
    imageUrl: "/hero3.png", // Replace with another image
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
    // Add autoplay plugin
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
          }, 4000); // Change slide every 4 seconds
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

  return (
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
            {/* Dark green overlay to ensure text is readable */}
            <div className='absolute inset-0 bg-brand-green/80'></div>

            {/* Content */}
            <div className='relative z-10 flex flex-col justify-center h-[550px] md:h-[500px] p-8 md:p-12 text-white text-left'>
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

      {/* Navigation Dots */}
      {loaded && instanceRef.current && (
        <div className='absolute bottom-5 left-1/2 flex -translate-x-1/2 transform space-x-2'>
          {[
            ...Array(instanceRef.current.track.details.slides.length).keys(),
          ].map((idx) => {
            return (
              <button
                key={idx}
                onClick={() => {
                  instanceRef.current?.moveToIdx(idx);
                }}
                className={
                  "h-2 w-2 rounded-full transition-all duration-300 " +
                  (currentSlide === idx
                    ? "bg-white w-6" // Active dot
                    : "bg-white/50") // Inactive dot
                }
              ></button>
            );
          })}
        </div>
      )}
    </section>
  );
}
