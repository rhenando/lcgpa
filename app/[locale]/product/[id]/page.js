import ProductDetailsPage from "@/components/product-details/ProductDetailsPage";
import { notFound } from "next/navigation";

// NOTE: This component should be located at: app/[locale]/products/[id]/page.js

/**
 * The main page component that fetches product data based on locale and ID.
 * @param {object} props - The component props.
 * @param {object} props.params - The route parameters, including locale and id.
 * @returns {Promise<JSX.Element>} The rendered product details page.
 */
export default async function ProductPage({ params }) {
  // Await params before using its properties, as required in this Next.js version.
  const { locale, id } = await params;

  // Dynamically import the correct data file based on the locale
  let featuredProducts;
  if (locale === "ar") {
    // If locale is 'ar', import Arabic mock data
    const data = await import("@/lib/mock-data-ar.js");
    featuredProducts = data.featuredProducts;
  } else {
    // Otherwise, use the default English mock data
    const data = await import("@/lib/mock-data.js");
    featuredProducts = data.featuredProducts;
  }

  const productId = parseInt(id);
  const product = featuredProducts.find((p) => p.id === productId);

  // If no product is found, render the 404 page
  if (!product) {
    notFound();
  }

  return <ProductDetailsPage product={product} />;
}

/**
 * Generates metadata for SEO using the correct language.
 * @param {object} props - The component props.
 * @param {object} props.params - The route parameters.
 * @returns {Promise<object>} The metadata object for the page.
 */
export async function generateMetadata({ params }) {
  // Await params before using its properties.
  const { locale, id } = await params;

  let featuredProducts;
  if (locale === "ar") {
    const data = await import("@/lib/mock-data-ar.js");
    featuredProducts = data.featuredProducts;
  } else {
    const data = await import("@/lib/mock-data.js");
    featuredProducts = data.featuredProducts;
  }

  const productId = parseInt(id);
  const product = featuredProducts.find((p) => p.id === productId);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} - ${product.productCode}`,
    description: product.definition || `View details for ${product.name}`,
    openGraph: {
      title: product.name,
      description: product.definition,
      images: [product.imageUrl],
    },
  };
}

/**
 * Generates static params for all products in both English and Arabic.
 * This allows Next.js to pre-build all language versions of the product pages.
 * @returns {Promise<Array<object>>} An array of params for static generation.
 */
export async function generateStaticParams() {
  // Import both data sources
  const { featuredProducts: productsEn } = await import("@/lib/mock-data.js");
  const { featuredProducts: productsAr } = await import(
    "@/lib/mock-data-ar.js"
  );

  // Create paths for English pages (e.g., /en/products/1)
  const paramsEn = productsEn.map((product) => ({
    locale: "en",
    id: product.id.toString(),
  }));

  // Create paths for Arabic pages (e.g., /ar/products/1)
  const paramsAr = productsAr.map((product) => ({
    locale: "ar",
    id: product.id.toString(),
  }));

  // Combine them so Next.js pre-builds all language versions
  return [...paramsEn, ...paramsAr];
}
