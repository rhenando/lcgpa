"use client";
import React, { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import HeroCategoriesBar from "./HeroCategoriesBar";
import HeroSlides from "./HeroSlides";
import HeroTrendingBar from "./HeroTrendingBar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

const leftSlides = [
  {
    title: {
      en: "From Manufacturers to You",
      ar: "من المصانع إليك",
    },
    description: {
      en: "The Saudi B2B online platform for industrial products. Trusted, easy, and secure sourcing.",
      ar: "منصة إلكترونية سعودية لمنتجات المصانع. حلول موثوقة وسهلة وآمنة.",
    },
    bgImage: "/marsos-hero-bg-1.jpg",
    link: "/import-from-saudi",
  },
  {
    title: {
      en: "Empowering Saudi Industry",
      ar: "تمكين الصناعة السعودية",
    },
    description: {
      en: "Access to many manufactures in Saudi Arabia in majorty of sectors with a seamless transctions",
      ar: "تجميع المصنعين والمشترين. تقنية حديثة ومدفوعات سلسة وانتشار عالمي.",
    },
    bgImage: "/marsos-hero-bg-2.jpg",
    link: "/about-us",
  },
];
const rightSlides = [
  {
    title: {
      en: "Verified Saudi Suppliers",
      ar: "موردون سعوديون موثوقون",
    },
    description: {
      en: "Work directly with certified factories across Saudi Arabia. Quality you can trust.",
      ar: "تعامل مباشرة مع مصانع سعودية معتمدة. جودة موثوقة.",
    },
    bgImage: "/marsos-hero-bg-3.jpg",
    link: "/supplier-onboarding",
  },
  {
    title: {
      en: "Seamless & Secure",
      ar: "سلاسة وأمان",
    },
    description: {
      en: "Digital tools, fast onboarding, and secure payment for every business transaction.",
      ar: "أدوات رقمية وتسجيل سريع ودفع آمن لكل معاملة.",
    },
    bgImage: "/marsos-hero-bg-4.jpg",
    link: "/contact",
  },
];

function getBaseLocale(locale) {
  if (!locale) return "en";
  return locale.startsWith("ar") ? "ar" : "en";
}

function buildCategoriesFromProducts(products, locale = "en") {
  if (!Array.isArray(products)) return [];
  const seen = new Set();
  const trendingCategories = [];
  for (let product of products) {
    const slugObj = product.slug || {};
    const catObj = product.category || {};
    const rawSlug = slugObj[locale] || slugObj.en || slugObj.ar || "";
    const slug = rawSlug.trim().toLowerCase().replace(/\s+/g, "-");
    const label = (catObj[locale] || catObj.en || catObj.ar || "").trim();
    if (!slug || !label) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);
    trendingCategories.push({
      label,
      slug: slugObj,
      image:
        product.mainImageUrl ||
        (Array.isArray(product.additionalImageUrls) &&
          product.additionalImageUrls[0]) ||
        "/dummy1.jpg",
    });
  }
  return trendingCategories;
}

export default function HeroSection() {
  const locale = useLocale();
  const baseLocale = getBaseLocale(locale);
  const isRTL = baseLocale === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  const loadingText = isRTL ? "جاري التحميل..." : "Loading...";
  const categoriesText = isRTL ? "التصنيفات" : "Categories";

  const [products, setProducts] = useState([]);
  const [categoryLabels, setCategoryLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProductsAndCategories() {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "products"));
        const catsSet = new Set();
        const allProducts = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allProducts.push(data);
          const catLabel =
            isRTL && data?.category?.ar
              ? data.category.ar.trim()
              : data?.category?.en?.trim();
          if (catLabel) catsSet.add(catLabel);
        });

        setProducts(allProducts);
        setCategoryLabels(Array.from(catsSet));
        setLoading(false);
      } catch (err) {
        setProducts([]);
        setCategoryLabels([]);
        setLoading(false);
      }
    }
    fetchProductsAndCategories();
  }, [baseLocale, isRTL]);

  const trendingCategories = buildCategoriesFromProducts(products, baseLocale);

  if (!loading && products.length === 0) {
    return (
      <section className='w-full h-[80vh] flex items-center justify-center bg-[#f9fbe5]'>
        <div className='text-red-500 text-xl text-center'>
          No products found.
          <br />
          <span className='text-base text-gray-600'>
            Check Firestore, security rules, or data shape!
          </span>
        </div>
      </section>
    );
  }

  if (!loading && trendingCategories.length === 0) {
    return (
      <section className='w-full h-[80vh] flex items-center justify-center bg-[#f9fbe5]'>
        <div className='text-yellow-600 text-xl text-center'>
          No categories found.
          <br />
          <span className='text-base text-gray-600'>
            Make sure your products contain <b>category</b> and <b>slug</b>{" "}
            fields.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      dir={dir}
      className={`w-full h-[80vh] flex flex-col overflow-hidden bg-[#f9fbe5] ${
        isRTL ? "font-arabic" : ""
      }`}
    >
      <HeroCategoriesBar
        categoryLabels={categoryLabels}
        isRTL={isRTL}
        loadingText={loadingText}
      />

      <HeroSlides
        leftSlides={leftSlides}
        rightSlides={rightSlides}
        isRTL={isRTL}
        locale={baseLocale}
      />

      <div className='flex-1 flex items-center justify-center'>
        <HeroTrendingBar
          trendingCategories={trendingCategories}
          isRTL={isRTL}
          categoriesText={categoriesText}
          loading={loading}
          loadingText={loadingText}
          locale={baseLocale}
        />
      </div>
    </section>
  );
}
