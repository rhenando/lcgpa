// src/components/CarouselHeroSection.jsx

"use client"; // Required for hooks like useState and useKeenSlider

import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css"; // Import the slider's CSS

import { Button } from "@/components/ui/button";

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
            <div className='absolute inset-0 bg-brand-green/80'></div>

            {/* Removed fixed height (h-[550px]) and used padding (py-32) for flexible spacing */}
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
                  (currentSlide === idx ? "bg-white w-6" : "bg-white/50")
                }
              ></button>
            );
          })}
        </div>
      )}
    </section>
  );
}
