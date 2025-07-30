"use client";
import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

function ShinyButton({ children, onClick, colorClass }) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      x: ["-120%", "120%"],
      transition: {
        duration: 2.1,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      },
    });
  }, [controls]);

  const shineGold =
    "linear-gradient(120deg, rgba(249,215,131,0) 10%, rgba(249,215,131,0.20) 50%, rgba(249,215,131,0) 90%)";

  return (
    <button
      className={`relative overflow-hidden flex-1 flex items-center justify-center ${colorClass} font-bold rounded-xl px-4 py-2 text-base shadow-lg min-h-[3.5rem] text-center leading-snug`}
      style={{
        fontSize: "1.12rem",
        letterSpacing: "0.01em",
        boxShadow: colorClass?.includes("bg-[#2c6449]")
          ? "0 6px 20px 0 rgba(44,100,73,0.10), 0 2px 6px 0 rgba(44,100,73,0.15)"
          : "0 6px 20px 0 rgba(44,100,73,0.08), 0 2px 6px 0 rgba(44,100,73,0.11)",
        wordBreak: "break-word",
      }}
      onClick={onClick}
    >
      <motion.div
        initial={{ x: "-120%" }}
        animate={controls}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "55%",
          background: shineGold,
          filter: "blur(0.5px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <span className='relative z-10 w-full text-inherit'>{children}</span>
    </button>
  );
}

export default function HeroCategoriesBar({
  categoryLabels,
  isRTL,
  loadingText,
}) {
  const carouselContentRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const ref = carouselContentRef.current;
    if (!ref) return;
    let interval = setInterval(() => {
      ref.scrollBy?.({ left: isRTL ? -150 : 150, behavior: "smooth" });
    }, 3500);
    return () => clearInterval(interval);
  }, [carouselContentRef.current, categoryLabels.length, isRTL]);

  const rfqText = isRTL ? "طلب عرض سعر" : "Request for\nQuotation";
  const importText = isRTL ? "استيراد من السعودية" : "Import from\nSaudi";

  const handleRFQ = () => router.push("/rfq");
  const handleImport = () => router.push("/import-from-saudi");

  return (
    <>
      <div className='block md:hidden w-full bg-[#eaf3ed] border-b border-[#e7ecd8] px-2 py-3 flex-shrink-0'>
        <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <ShinyButton colorClass='bg-[#2c6449] text-white' onClick={handleRFQ}>
            {rfqText.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </ShinyButton>
          <ShinyButton
            colorClass='bg-white border border-[#2c6449] text-[#2c6449]'
            onClick={handleImport}
          >
            {importText.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </ShinyButton>
        </div>
      </div>

      <div className='hidden md:block w-full bg-[#eaf3ed] border-b border-[#e7ecd8] px-3 md:px-6 py-2 md:py-4 flex-shrink-0'>
        <Carousel
          opts={{ align: isRTL ? "end" : "start", loop: true }}
          className='w-full'
        >
          <CarouselContent ref={carouselContentRef}>
            {categoryLabels.length === 0 ? (
              <CarouselItem className='basis-auto'>
                <span className='text-gray-400 px-3'>{loadingText}</span>
              </CarouselItem>
            ) : (
              categoryLabels.map((cat, i) => (
                <CarouselItem key={cat + i} className='basis-auto'>
                  <span
                    title={cat}
                    className={`text-[#2c6449] font-semibold text-xs md:text-base hover:bg-[#e6f4ec] px-3 md:px-4 py-1 rounded cursor-pointer transition whitespace-nowrap ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {cat}
                  </span>
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselPrevious
            className={isRTL ? "right-1 rotate-180" : "left-1"}
          />
          <CarouselNext className={isRTL ? "left-1 rotate-180" : "right-1"} />
        </Carousel>
      </div>
    </>
  );
}
