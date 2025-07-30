"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLocale } from "next-intl";
import LanguageSelector from "@/components/header/LanguageSelector";
import Link from "next/link";

// Inline translations
const messages = {
  en: {
    platformSubTitle: "Saudi Digital B2B Platform",
    title: "Empowering ",
    highlight: "Your Business",
    knowMore: "Know More",
    visitWebsite: "Visit Website",
    footerNote: "Established in 2024 • Riyadh, Saudi Arabia",
  },
  ar: {
    platformSubTitle: "منصة سعودية رقمية للأعمال بين الشركات (B2B)",
    title: "أعمالك ",
    highlight: "تمكين ",
    knowMore: "اعرف المزيد",
    visitWebsite: "زيارة الموقع",
    footerNote: "تأسست عام 2024 • الرياض، المملكة العربية السعودية",
  },
};

const HERO_IMAGE_DESKTOP = "/hero-bg.jpg";
const HERO_IMAGE_MOBILE = "/hero-bg-mobile.jpg";

export default function HeroSection({ aboutRef }) {
  const locale = useLocale?.() || "en";
  const lang = locale === "ar" ? "ar" : "en";
  const isRTL = lang === "ar";
  const t = messages[lang];

  // Responsive background
  const [bgImage, setBgImage] = useState(HERO_IMAGE_DESKTOP);
  useEffect(() => {
    function updateBgImage() {
      if (window.innerWidth < 640) setBgImage(HERO_IMAGE_MOBILE);
      else setBgImage(HERO_IMAGE_DESKTOP);
    }
    updateBgImage();
    window.addEventListener("resize", updateBgImage);
    return () => window.removeEventListener("resize", updateBgImage);
  }, []);

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`
        relative w-full min-h-screen flex items-center
        bg-[#2c6449] overflow-hidden pt-20 sm:pt-28 md:pt-36
        ${isRTL ? "rtl" : "ltr"}
      `}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlays */}
      <div
        className={`
          absolute inset-0 z-0
          ${
            isRTL
              ? "bg-gradient-to-r from-[#2c6449] via-[#2c6449] to-transparent"
              : "bg-gradient-to-l from-[#2c6449] via-[#2c6449] to-transparent"
          }
          opacity-80
        `}
      />
      <div
        className={`
          absolute inset-0 z-0
          ${
            isRTL
              ? "bg-gradient-to-tl from-black via-black/60 to-transparent"
              : "bg-gradient-to-tr from-black via-black/60 to-transparent"
          }
          opacity-90
        `}
      />

      {/* Logo (left LTR, right RTL) */}
      <div
        className={`
          absolute top-0 z-20 flex items-center
          p-2 sm:p-6 md:p-10
          ${isRTL ? "right-0" : "left-0"}
        `}
      >
        <Link href='/' className='group' prefetch={false}>
          <div className='bg-white/90 backdrop-blur-md rounded-xl p-1 sm:p-3 shadow-md inline-block transition hover:shadow-lg'>
            <Image
              src='/logo.svg'
              alt='Marsos Logo'
              height={72}
              width={100}
              className='h-16 sm:h-24 md:h-32 w-auto transition group-hover:scale-105'
              priority
            />
          </div>
        </Link>
      </div>

      {/* LanguageSelector (opposite side of logo) */}
      <div
        className={`
          absolute top-0 z-20 flex items-center
          p-2 sm:p-6 md:p-10
          ${isRTL ? "left-0" : "right-0"}
        `}
      >
        <LanguageSelector />
      </div>

      {/* Main content, mobile responsive */}
      <div
        className={`
          relative z-10 w-full max-w-lg sm:max-w-2xl
          py-5 sm:py-8 md:py-12 flex flex-col
          ${
            isRTL
              ? "items-end pr-3 sm:pr-8 md:pr-16 text-right"
              : "items-start pl-3 sm:pl-8 md:pl-16 text-left"
          }
        `}
      >
        {/* Subtitle: force RTL for Arabic only, always right aligned */}
        <span
          className={`
            block w-full text-[0.85rem] sm:text-xs font-semibold text-[#a9d5bf] mb-3 sm:mb-2
            text-left
          `}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {t.platformSubTitle}
        </span>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={`
            text-xl xs:text-2xl sm:text-3xl md:text-4xl
            font-extrabold leading-snug mb-5 sm:mb-6 text-[#eaf3ed]
            w-full ${isRTL ? "text-right" : "text-left"}
          `}
        >
          {t.title}
          <span className='text-[#b2e0c7]'>{t.highlight}</span>
        </motion.h1>
        {/* Button row: strongest RTL right alignment in Arabic */}
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className={`
            flex flex-col sm:flex-row w-full max-w-xs gap-3 sm:gap-0
            ${
              isRTL
                ? "justify-end items-end sm:flex-row-reverse sm:space-x-reverse sm:space-x-4 text-right"
                : "sm:flex-row sm:space-x-4"
            }
          `}
        >
          <button
            onClick={() =>
              aboutRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className={`
              bg-[#eaf3ed] text-[#2c6449] font-bold px-6 py-2 rounded-full shadow
              hover:bg-[#b2e0c7] transition text-sm w-full
              ${isRTL ? "text-right" : "text-center"}
            `}
          >
            {t.knowMore}
          </button>
          <a
            href='https://marsos.sa'
            className={`
              border border-[#eaf3ed] text-[#eaf3ed] font-bold px-6 py-2 rounded-full
              hover:bg-[#3c8e6c] transition text-sm w-full
              ${isRTL ? "text-right" : "text-center"}
            `}
            target='_blank'
            rel='noopener'
          >
            {t.visitWebsite}
          </a>
        </div>
      </div>

      {/* Footer note (bottom, mobile-aligned) */}
      <div
        className={`
          absolute bottom-0 z-20
          pb-2 xs:pb-3 sm:pb-6 md:pb-8 text-xs text-[#d4ede1]
          w-full
          ${
            isRTL
              ? "right-0 pr-3 sm:pr-8 md:pr-16 text-right"
              : "left-0 pl-3 sm:pl-8 md:pl-16 text-left"
          }
        `}
      >
        {t.footerNote}
      </div>
    </section>
  );
}
