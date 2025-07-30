"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "@/components/global/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

// Slugify utility (supports English/Arabic)
const slugify = (text) =>
  text
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function CategoryPage() {
  const params = useParams();
  // Always decode and normalize slug from URL
  const rawSlug = params?.slug ? decodeURIComponent(params.slug) : "";
  const urlSlug = slugify(rawSlug);

  // Next-intl hooks
  const t = useTranslations("single-category");
  const locale = useLocale();

  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  const currencySymbol = locale === "ar" ? "ر.س." : "SR ";

  const formatNumber = (number) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(number);

  // Helper to localize any {en, ar} or plain string field
  const getLocalizedText = (value) => {
    if (typeof value === "object" && value !== null) {
      return value[locale] || value.en || value.ar || "";
    }
    return typeof value === "string" ? value : "";
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!urlSlug || !mounted) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const allProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter products by the slugified category label (EN/AR)
        const matchedProducts = allProducts.filter((p) => {
          const catObj = p.category || {};
          const catLabel =
            typeof catObj === "object" && catObj !== null
              ? catObj[locale] || catObj.en || catObj.ar || ""
              : typeof catObj === "string"
              ? catObj
              : "";
          const catSlug = slugify(catLabel);
          return urlSlug === catSlug;
        });

        if (matchedProducts.length > 0) {
          const first = matchedProducts[0];
          setCategoryName(getLocalizedText(first.category));
        } else {
          // Fallback: Show decoded slug as a human-friendly string
          setCategoryName(
            rawSlug
              .replace(/-/g, " ")
              .replace(/\s+/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())
          );
        }

        setProducts(matchedProducts);
      } catch (error) {
        console.error("🔥 Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [urlSlug, mounted, locale, rawSlug]);

  if (!mounted) {
    return (
      <div className='container mx-auto px-4 py-6 capitalize'>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className='h-48 w-full rounded-md' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-6 capitalize'>
      <h2 className='text-center text-2xl font-semibold text-[#2c6449] mb-6'>
        {categoryName} {t("category")}
      </h2>

      {loading ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className='h-48 w-full rounded-md' />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              currencySymbol={currencySymbol}
              formatNumber={formatNumber}
            />
          ))}
        </div>
      ) : (
        <p className='text-center text-gray-500'>{t("noProductsFound")}</p>
      )}
    </div>
  );
}
