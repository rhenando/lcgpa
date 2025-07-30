"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";
const ProductCard = ({ product }) => {
  const router = useRouter();
  const t = useTranslations("product_card");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const isMobile = useIsMobile();

  // Helper to get localized string from object or string
  const getLocalizedValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value[locale] || value.en || value.ar || "";
    }
    return "";
  };

  // Get name and supplier
  const productName =
    getLocalizedValue(product.productName) || t("unnamed_product");
  const supplierName = product.supplierName || t("unknown");

  // Optional: product main image
  const mainImage =
    product.mainImageUrl || "https://via.placeholder.com/300?text=No+Image";

  // Button handler
  const handleViewProduct = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`
        group flex flex-col
        p-2 sm:p-3 md:p-4
        bg-white
        rounded-lg md:rounded-2xl
        border border-gray-100
        shadow-sm md:shadow
        transition
        duration-200
        hover:shadow-lg hover:-translate-y-1
        relative
        overflow-hidden
        min-h-[290px] md:min-h-[340px]
        cursor-pointer
        w-full max-w-xs md:max-w-none
      `}
      onClick={handleViewProduct}
      tabIndex={0}
      aria-label={productName}
    >
      {/* Product image */}
      <div
        className={`
          w-full
          aspect-[5/4] md:aspect-[4/3]
          bg-white
          rounded-md md:rounded-xl
          border border-primary
          shadow-xs md:shadow
          mb-2 md:mb-3
          overflow-hidden
          flex items-center
          justify-center
          relative
        `}
      >
        <img
          src={mainImage}
          alt={productName}
          className={`
            w-full h-full object-cover
            transition-transform duration-300
            group-hover:scale-105
          `}
          loading='lazy'
        />
      </div>

      {/* Product Name */}
      <h3
        className={`
          text-sm sm:text-base md:text-lg
          font-bold text-gray-800
          mb-1 md:mb-2
          line-clamp-2
          group-hover:text-[#2c6449]
          transition
        `}
      >
        {productName}
      </h3>

      {/* Supplier Name with chip look */}
      <div className={`${isMobile ? "mb-1" : "mb-2"}`}>
        <span className='text-xs sm:text-sm text-gray-400 mr-1'>
          {t("supplier")}:
        </span>
        <span
          className={`
            inline-block bg-gray-50 border border-gray-200
            px-2 py-0.5 rounded-full
            text-xs sm:text-sm font-medium
            text-gray-700 capitalize
          `}
        >
          {supplierName}
        </span>
      </div>

      {/* Spacer to push button to bottom */}
      <div className='flex-1' />

      {/* View Details Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleViewProduct();
        }}
        className={`
          w-full
          py-2 md:py-2.5
          mt-2
          rounded-lg md:rounded-xl
          bg-[#2c6449]
          text-white
          font-semibold
          text-xs sm:text-sm md:text-base
          shadow
          hover:bg-[#24533b]
          hover:shadow-md
          transition
          duration-150
          outline-none
          focus:ring-2
          focus:ring-[#2c6449]/40
        `}
        tabIndex={0}
      >
        {t("view_details")}
      </button>
    </div>
  );
};

export default ProductCard;
