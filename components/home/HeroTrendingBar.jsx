import React from "react";
import TrendingSlider from "./TrendingSlider";

export default function HeroTrendingBar({
  trendingCategories = [],
  isRTL,
  categoriesText,
  loading = false,
  loadingText = "Loading...",
  locale = "en",
}) {
  const dedupedCategories = [];
  const seenCategories = new Set();

  trendingCategories.forEach((cat) => {
    const rawLabel =
      cat.label || cat.label?.[locale] || cat.label?.en || cat.label?.ar || "";
    const normalizedLabel = rawLabel
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");

    if (!normalizedLabel) return;
    if (!seenCategories.has(normalizedLabel)) {
      seenCategories.add(normalizedLabel);
      dedupedCategories.push(cat);
    }
  });

  return (
    <div className='w-full py-4 px-2 bg-[#eaf3ed] text-center'>
      <div className='mb-2 text-[#2c6449] font-bold text-base md:text-lg'>
        {categoriesText || "Categories"}
      </div>
      {loading ? (
        <div className='text-[#2c6449] text-center py-4'>{loadingText}</div>
      ) : dedupedCategories.length === 0 ? (
        <div className='text-red-500 text-center py-4'>
          {isRTL ? "لا توجد فئات للعرض." : "No categories to show."}
          <br />
          <span className='text-base text-gray-600'>
            {isRTL
              ? "تأكد من وجود فئات ومنتجات في قاعدة البيانات."
              : "Check your Firestore product data for category and slug fields!"}
          </span>
        </div>
      ) : (
        <TrendingSlider
          categories={dedupedCategories}
          isRTL={isRTL}
          locale={locale}
        />
      )}
    </div>
  );
}
