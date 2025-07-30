"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import ProductCard from "@/components/global/ProductCard";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const CategoriesAndProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const productsPerPage = 12;

  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const saudiRegions = [
    "Riyadh",
    "Makkah",
    "Madinah",
    "Eastern Province",
    "Asir",
    "Tabuk",
    "Hail",
    "Northern Borders",
    "Jazan",
    "Najran",
    "Al Bahah",
    "Al Jawf",
    "Al Qassim",
  ];

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(list);

      const cats = [
        ...new Set(
          list.map((p) => p.category?.[locale]?.trim()).filter(Boolean)
        ),
      ];
      setCategories(cats);
      if (cats.length > 0) setActiveCategory(cats[0]);
    };
    fetchData();
  }, [locale]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory && p.category?.[locale]?.trim() === activeCategory;

    const selectedColors = Object.keys(filters.colors || {}).filter(
      (c) => filters.colors[c]
    );
    const selectedSizes = Object.keys(filters.sizes || {}).filter(
      (s) => filters.sizes[s]
    );

    const matchesColor =
      selectedColors.length === 0 ||
      selectedColors.some((color) => p.colors?.includes(color));

    const matchesSize =
      selectedSizes.length === 0 ||
      selectedSizes.some((size) => p.sizes?.includes(size));

    const name =
      typeof p.productName === "string"
        ? p.productName
        : p.productName?.[locale] || "";

    const matchesSearch =
      searchTerm.trim() === "" ||
      name.toLowerCase().includes(searchTerm.toLowerCase());

    const productLocation =
      typeof p.location === "string" ? p.location : p.location?.[locale] || "";

    const matchesLocation =
      selectedLocation === "" ||
      productLocation.toLowerCase() === selectedLocation.toLowerCase();

    return (
      matchesCategory &&
      matchesColor &&
      matchesSize &&
      matchesSearch &&
      matchesLocation
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <div className='font-sans bg-white'>
      {/* Hero Banner */}
      <section className='bg-gradient-to-br from-[#2c6449] to-[#1f4633] text-white px-4 sm:px-6 py-12 sm:py-16 text-center'>
        <h1 className='text-3xl sm:text-4xl md:text-6xl font-bold mb-4'>
          Explore Our Catalog
        </h1>
        <p className='max-w-sm mx-auto text-sm md:text-base'>
          {t("hero.subtitle", {
            defaultValue:
              "Browse by category and find quality products from trusted suppliers across Saudi Arabia.",
          })}
        </p>

        {/* Category Tabs */}
        <div className='mt-8 flex flex-wrap justify-center gap-3 sm:gap-4'>
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`bg-white text-[#2c6449] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition hover:bg-[#eaf1ed] ${
                activeCategory === cat ? "ring-2 ring-white" : ""
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Section */}
      <section className='px-4 sm:px-6 py-10 sm:py-12 max-w-screen-xl mx-auto flex flex-col md:flex-row gap-8'>
        {/* Sidebar Filters */}
        <aside className='w-full md:w-1/4 md:border-r md:pr-6'>
          <h4 className='font-bold mb-6 text-gray-700 text-lg'>Filter By</h4>

          {/* Search Input */}
          <div className='mb-6'>
            <h5 className='font-semibold text-gray-800 text-sm mb-2'>Search</h5>
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Enter product name'
              className='w-full border px-3 py-2 rounded text-sm'
            />
          </div>

          {/* Location Filter */}
          <div className='mb-6'>
            <h5 className='font-semibold text-gray-800 text-sm mb-2'>
              Location
            </h5>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className='w-full border px-3 py-2 rounded text-sm'
            >
              <option value=''>All</option>
              {saudiRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Color Filter */}
          <div className='mb-6'>
            <h5 className='font-semibold text-gray-800 text-sm mb-2'>Color</h5>
            <div className='space-y-2'>
              {["White", "Black", "Red", "Green", "Blue"].map((color) => (
                <label
                  key={color}
                  className='flex items-center gap-2 text-sm text-gray-700'
                >
                  <input
                    type='checkbox'
                    className='accent-[#2c6449]'
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        colors: {
                          ...(prev.colors || {}),
                          [color]: e.target.checked,
                        },
                      }))
                    }
                    checked={filters.colors?.[color] || false}
                  />
                  {color}
                </label>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className='mb-6'>
            <h5 className='font-semibold text-gray-800 text-sm mb-2'>Size</h5>
            <div className='space-y-2'>
              {["S", "M", "L", "XL"].map((size) => (
                <label
                  key={size}
                  className='flex items-center gap-2 text-sm text-gray-700'
                >
                  <input
                    type='checkbox'
                    className='accent-[#2c6449]'
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sizes: {
                          ...(prev.sizes || {}),
                          [size]: e.target.checked,
                        },
                      }))
                    }
                    checked={filters.sizes?.[size] || false}
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setFilters({});
              setSearchTerm("");
              setSelectedLocation("");
              setActiveCategory(categories[0] || "");
              setCurrentPage(1);
            }}
            className='mt-4 inline-block text-sm text-[#2c6449] font-medium hover:underline'
          >
            Clear All Filters
          </button>
        </aside>

        {/* Product Grid */}
        <div className='w-full md:w-3/4'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
            <h2 className='text-base sm:text-lg font-semibold text-gray-800'>
              {t("hero.section-title", {
                defaultValue: "All Products",
              })}
            </h2>
            <button className='text-[#2c6449] text-sm hover:underline'>
              {t("hero.view_more", { defaultValue: "View more →" })}
            </button>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6'>
            {currentProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => router.push(`/product/${product.id}`)}
                locale={locale}
                currencySymbol='SR'
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center items-center gap-4 mt-10'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='px-4 py-2 text-sm border rounded disabled:opacity-50'
              >
                Previous
              </button>
              <span className='text-sm'>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className='px-4 py-2 text-sm border rounded disabled:opacity-50'
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoriesAndProductsPage;
