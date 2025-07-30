"use client";
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useKeenSlider } from "keen-slider/react";

export default function HeroSlides({
  leftSlides,
  rightSlides,
  isRTL,
  locale,
  ctaText,
}) {
  const [activeLeftSlide, setActiveLeftSlide] = useState(0);
  const [activeRightSlide, setActiveRightSlide] = useState(0);
  const leftAutoSlideInterval = useRef();
  const rightAutoSlideInterval = useRef();

  const [leftSliderRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1 },
    drag: true,
    rtl: isRTL,
    slideChanged(slider) {
      setActiveLeftSlide(slider.track.details.rel);
    },
    created(slider) {
      setActiveLeftSlide(slider.track.details.rel);
      if (leftAutoSlideInterval.current)
        clearInterval(leftAutoSlideInterval.current);
      leftAutoSlideInterval.current = setInterval(() => {
        isRTL ? slider.prev() : slider.next();
      }, 5000);
    },
    destroyed() {
      if (leftAutoSlideInterval.current)
        clearInterval(leftAutoSlideInterval.current);
    },
  });

  const [rightSliderRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1 },
    drag: true,
    rtl: isRTL,
    slideChanged(slider) {
      setActiveRightSlide(slider.track.details.rel);
    },
    created(slider) {
      setActiveRightSlide(slider.track.details.rel);
      if (rightAutoSlideInterval.current)
        clearInterval(rightAutoSlideInterval.current);
      rightAutoSlideInterval.current = setInterval(() => {
        isRTL ? slider.prev() : slider.next();
      }, 5000);
    },
    destroyed() {
      if (rightAutoSlideInterval.current)
        clearInterval(rightAutoSlideInterval.current);
    },
  });

  useEffect(() => {
    return () => {
      if (leftAutoSlideInterval.current)
        clearInterval(leftAutoSlideInterval.current);
      if (rightAutoSlideInterval.current)
        clearInterval(rightAutoSlideInterval.current);
    };
  }, []);

  return (
    <div
      className={`flex flex-col md:flex-row gap-4 md:gap-6 px-4 md:px-8 flex-grow h-full bg-[#eaf3ed] ${
        isRTL ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className='w-full md:w-3/5 h-full rounded-xl shadow overflow-hidden p-0 m-0 flex'>
        <div ref={leftSliderRef} className='keen-slider w-full h-full'>
          {leftSlides.map((slide, i) => {
            const isMobile =
              typeof window !== "undefined" && window.innerWidth < 768;
            const isActive = activeLeftSlide === i;
            const isOverlayVisible = isMobile ? isActive : false;
            return (
              <Link
                key={slide.title.en + i}
                href={slide.link || "#"}
                className='keen-slider__slide h-full relative group block focus:outline-none'
                style={{ backgroundColor: "#2c6449" }}
                tabIndex={0}
              >
                {slide.bgImage && (
                  <img
                    src={slide.bgImage}
                    alt=''
                    className='absolute inset-0 w-full h-full object-cover object-center z-0'
                    draggable='false'
                  />
                )}
                <div
                  className={`
                    absolute inset-0 z-10
                    ${
                      isMobile
                        ? "bg-gradient-to-t from-white via-white/80 to-transparent"
                        : "bg-gradient-to-t from-white/90 via-white/60 to-transparent"
                    }
                    flex flex-col ${
                      isRTL ? "items-end" : "items-start"
                    } justify-end px-4
                    pb-2 md:pb-8
                    transition-opacity duration-300
                    ${isOverlayVisible ? "opacity-100" : "opacity-0"}
                    md:opacity-0 md:group-hover:opacity-100
                  `}
                >
                  <div dir={isRTL ? "rtl" : "ltr"} className='w-full'>
                    <div
                      className={`font-bold text-lg md:text-xl lg:text-2xl mb-1 ${
                        isRTL ? "text-right font-arabic" : "text-left"
                      }`}
                      style={{
                        color: "#2c6449",
                        textShadow: isMobile
                          ? "0 1px 3px rgba(0,0,0,0.13), 0 1px 0 #fff"
                          : "none",
                      }}
                    >
                      {slide.title[locale] || slide.title.en}
                    </div>
                    <div
                      className={`text-base md:text-lg mb-0 md:mb-3 ${
                        isRTL ? "text-right font-arabic" : "text-left"
                      }`}
                      style={{
                        color: "#2c6449",
                        textShadow: isMobile
                          ? "0 1px 2px rgba(0,0,0,0.10), 0 1px 0 #fff"
                          : "none",
                      }}
                    >
                      {slide.description[locale] || slide.description.en}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className='w-full md:w-2/5 h-full bg-white/80 rounded-xl shadow overflow-hidden flex items-center justify-center p-0 m-0'>
        <div ref={rightSliderRef} className='keen-slider w-full h-full'>
          {rightSlides.map((slide, i) => {
            const isMobile =
              typeof window !== "undefined" && window.innerWidth < 768;
            const isActive = activeRightSlide === i;
            const isOverlayVisible = isMobile ? isActive : false;
            return (
              <Link
                key={slide.title.en + i}
                href={slide.link || "#"}
                className='keen-slider__slide h-full relative group block focus:outline-none'
                style={{ backgroundColor: "#ffffff" }}
                tabIndex={0}
              >
                {slide.bgImage && (
                  <img
                    src={slide.bgImage}
                    alt=''
                    className='absolute inset-0 w-full h-full object-cover object-center z-0'
                    draggable='false'
                  />
                )}
                <div
                  className={`
                    absolute inset-0 z-10
                    ${
                      isMobile
                        ? "bg-gradient-to-t from-white via-white/80 to-transparent"
                        : "bg-gradient-to-t from-white/90 via-white/60 to-transparent"
                    }
                    flex flex-col ${
                      isRTL ? "items-end" : "items-start"
                    } justify-end px-4
                    pb-2 md:pb-8
                    transition-opacity duration-300
                    ${isOverlayVisible ? "opacity-100" : "opacity-0"}
                    md:opacity-0 md:group-hover:opacity-100
                  `}
                >
                  <div dir={isRTL ? "rtl" : "ltr"} className='w-full'>
                    <div
                      className={`font-bold text-lg md:text-xl lg:text-2xl mb-1 ${
                        isRTL ? "text-right font-arabic" : "text-left"
                      }`}
                      style={{
                        color: "#2c6449",
                        textShadow: isMobile
                          ? "0 1px 3px rgba(0,0,0,0.13), 0 1px 0 #fff"
                          : "none",
                      }}
                    >
                      {slide.title[locale] || slide.title.en}
                    </div>
                    <div
                      className={`text-base md:text-lg mb-0 md:mb-3 ${
                        isRTL ? "text-right font-arabic" : "text-left"
                      }`}
                      style={{
                        color: "#2c6449",
                        textShadow: isMobile
                          ? "0 1px 2px rgba(0,0,0,0.10), 0 1px 0 #fff"
                          : "none",
                      }}
                    >
                      {slide.description[locale] || slide.description.en}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
