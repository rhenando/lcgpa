"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import ProductCard from "@/components/global/ProductCard";
import Head from "next/head";
import Script from "next/script";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Newest");
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const locale = typeof window !== "undefined" ? navigator.language : "en-US";
  const currencySymbol = "SR";

  const formatNumber = (number, locale) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(number);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
        setFilteredProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let sorted = [...products];
    switch (activeTab) {
      case "Lowest":
        sorted.sort(
          (a, b) =>
            (a.priceRanges?.[0]?.price || 0) - (b.priceRanges?.[0]?.price || 0)
        );
        break;
      case "Highest":
        sorted.sort(
          (a, b) =>
            (b.priceRanges?.[0]?.price || 0) - (a.priceRanges?.[0]?.price || 0)
        );
        break;
      case "Newest":
        sorted.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "Oldest":
        sorted.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "Locations":
        sorted.sort((a, b) =>
          (a.mainLocation || "").localeCompare(b.mainLocation || "")
        );
        break;
      default:
        break;
    }
    setFilteredProducts(sorted);
  }, [activeTab, products]);

  if (loading) {
    return <p className='text-center py-8 text-sm'>Loading products...</p>;
  }

  if (products.length === 0) {
    return <p className='text-center py-8 text-sm'>No products available.</p>;
  }

  return (
    <>
      <Head>
        <title>Marsos | Discover Saudi Industrial Products</title>
        <meta
          name='description'
          content='Explore a wide range of high-quality industrial products sourced directly from Saudi suppliers. Competitive prices, verified vendors, and seamless ordering.'
        />
        <meta
          property='og:title'
          content='Marsos | Discover Verified Saudi Industrial Products'
        />
        <meta
          property='og:description'
          content='Explore top Saudi industrial products with Marsos – premium quality and competitive prices.'
        />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://marsos.sa/products' />
        <meta property='og:image' content='/og-image-en.png' />
        <link rel='canonical' href='https://marsos.sa/products' />
      </Head>

      <Script type='application/ld+json' strategy='afterInteractive'>
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Marsos Product Listing",
          description:
            "Industrial product listings from Saudi suppliers on Marsos.",
          url: "https://marsos.sa/products",
        })}
      </Script>

      <div className='px-4 sm:px-6 lg:px-8 py-6 max-w-screen-xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-xl sm:text-2xl font-bold text-[#2c6449] mb-2'>
              Discover Verified Saudi Industrial Products
            </h1>
            <p className='text-sm text-gray-600 max-w-3xl'>
              Browse a curated list of industrial goods from trusted Saudi
              manufacturers. Quality materials, raw resources, and factory-grade
              supplies available for direct B2B sourcing.
            </p>
          </div>

          {/* Sort Tabs */}
          {isSmallScreen ? (
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className='border border-gray-300 text-sm px-3 py-2 rounded'
            >
              {["Newest", "Oldest", "Lowest", "Highest", "Locations"].map(
                (tab) => (
                  <option key={tab} value={tab}>
                    {tab}
                  </option>
                )
              )}
            </select>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {["Newest", "Oldest", "Lowest", "Highest", "Locations"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium border rounded ${
                      activeTab === tab
                        ? "bg-[#2c6449] text-white"
                        : "border-gray-300 text-gray-600 hover:bg-[#2c6449] hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              currencySymbol={currencySymbol}
              formatNumber={formatNumber}
            />
          ))}
        </div>

        {/* Internal Links for SEO */}
        <div className='mt-12 text-sm text-center'>
          Looking for more? Explore our{" "}
          <a
            href='/categories'
            className='text-[#2c6449] underline hover:text-green-800'
          >
            product categories
          </a>{" "}
          or{" "}
          <a
            href='/rfq'
            className='text-[#2c6449] underline hover:text-green-800'
          >
            request a quote
          </a>{" "}
          from suppliers.
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
