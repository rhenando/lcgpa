"use client";
import React, { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import HeroCategoriesBar from "./HeroCategoriesBar";
import HeroSlides from "./HeroSlides";
import HeroTrendingBar from "./HeroTrendingBar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

// --- UPDATED SLIDES WITH MORE RELEVANT UNSPLASH IMAGES ---
// These images from Unsplash are chosen to be more specific to Saudi Arabia's landscape.
const leftSlides = [
  {
    title: {
      en: "Enhancing Local Content",
      ar: "تعزيز المحتوى المحلي",
    },
    description: {
      en: "Championing national products and services to build a thriving, sustainable economy.",
      ar: "دعم المنتجات والخدمات الوطنية لبناء اقتصاد مزدهر ومستدام.",
    },
    // Image of a construction site with the Riyadh skyline in the background
    bgImage:
      "https://cordovaproperty.com/wp-content/uploads/2025/06/budget-plan-scaled-scaled.webp",
    link: "/",
  },
  {
    title: {
      en: "A Pillar of Vision 2030",
      ar: "ركيزة من ركائز رؤية 2030",
    },
    description: {
      en: "Aligning with Saudi Vision 2030 to maximize the economic impact of local industries.",
      ar: "المواءمة مع رؤية السعودية 2030 لتعظيم الأثر الاقتصادي للصناعات المحلية.",
    },
    // Image of Riyadh's iconic Kingdom Centre, a symbol of modernization
    bgImage:
      "https://cordovaproperty.com/wp-content/uploads/2025/06/dubaiskycrapper.webp",
    link: "/",
  },
];
const rightSlides = [
  {
    title: {
      en: "Efficient Government Procurement",
      ar: "كفاءة المشتريات الحكومية",
    },
    description: {
      en: "Developing strategies for transparent and effective government spending.",
      ar: "تطوير الاستراتيجيات واللوائح لتحقيق الشفافية والفعالية في الإنفاق الحكومي.",
    },
    // Image of a modern, professional business presentation
    bgImage:
      "https://cordovaproperty.com/wp-content/uploads/2025/04/post-4-26-2025.png",
    link: "/",
  },
  {
    title: {
      en: "Opportunities for Suppliers",
      ar: "فرص للموردين",
    },
    description: {
      en: "Connecting local suppliers with government projects to foster growth.",
      ar: "ربط الموردين المحليين بالمشاريع الحكومية لتعزيز النمو والشراكة.",
    },
    // Image of modern logistics and shipping containers
    bgImage:
      "https://cordovaproperty.com/wp-content/uploads/2024/06/Dubai-vision.webp",
    link: "/",
  },
];

// ... (The rest of the component code remains exactly the same)

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
          No data found.
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
            Make sure your data contains <b>category</b> and <b>slug</b> fields.
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
