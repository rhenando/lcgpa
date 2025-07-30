import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { db } from "@/firebase/config";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

// Helper: slugify a category label for URL use
function slugify(label) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^a-z0-9\-ء-ي]+/gi, "");
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const params = useParams();
  const locale = params?.locale || "en";
  const isRTL = locale === "ar";
  const t = useTranslations("section");

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const allProducts = snapshot.docs.map((doc) => doc.data());
        const categoryMap = {};

        allProducts.forEach((product) => {
          const catObj = product.category;
          const langKey = locale === "ar" ? "ar" : "en";
          let categoryLabel = "";

          if (typeof catObj === "object" && catObj !== null) {
            categoryLabel =
              catObj[langKey] || catObj.en || catObj.ar || "Uncategorized";
          } else if (typeof catObj === "string") {
            categoryLabel = catObj;
          }

          const normalizedLabel = categoryLabel
            .trim()
            .toLowerCase()
            .replace(/[\s_]+/g, "-")
            .replace(/-+/g, "-");

          if (!categoryMap[normalizedLabel]) {
            categoryMap[normalizedLabel] = {
              name: categoryLabel,
              slug: encodeURIComponent(slugify(categoryLabel)),
              image:
                product.mainImageUrl ||
                (product.additionalImageUrls &&
                  product.additionalImageUrls[0]) ||
                "https://via.placeholder.com/300x225?text=No+Image",
            };
          }
        });

        setCategories(Object.values(categoryMap));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchAllCategories();
  }, [locale]);

  if (!categories.length) return null;

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${
        isRTL ? "font-arabic" : ""
      }`}
    >
      <h2 className='text-2xl font-bold mb-10 text-[#2c6449] text-center'>
        {t("exploreCategories")}
      </h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
        {categories.map((cat) => (
          <div key={cat.slug} className='flex flex-col items-center'>
            <div className='mb-2'>
              <span className='text-base sm:text-lg font-semibold text-[#2c6449]'>
                {cat.name}
              </span>
            </div>
            <Link
              href={`/category/${cat.slug}`}
              className='relative group flex flex-col justify-end items-center
                bg-white rounded-2xl shadow border hover:shadow-lg transition
                overflow-hidden min-h-[190px] sm:min-h-[230px] w-full'
              style={{ aspectRatio: "4/3" }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className='absolute inset-0 w-full h-full object-cover object-center transition-transform group-hover:scale-105'
                loading='lazy'
              />
              <span className='sr-only'>{cat.name}</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
