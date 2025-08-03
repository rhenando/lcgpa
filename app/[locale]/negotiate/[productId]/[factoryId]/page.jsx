"use client"; // Convert the page to a Client Component

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // Import the client-side hook for params
import { NegotiationClientPage } from "@/components/negotiation-chat/NegotiationClientPage";
import { featuredProducts as mockProducts } from "@/lib/mock-data";
import { featuredProducts as mockProductsAr } from "@/lib/mock-data-ar";

export default function NegotiatePage() {
  const params = useParams(); // Get params using the hook
  const { locale, productId, factoryId } = params;

  // State for holding the data and loading status
  const [data, setData] = useState({ product: null, factory: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This logic now runs on the client after the component mounts
    const products = locale === "ar" ? mockProductsAr : mockProducts;
    const product = products.find((p) => p.id === Number(productId));

    if (product) {
      const factory = product.factories.find((f) => f.id === factoryId);
      setData({ product, factory: factory || null });
    }

    setIsLoading(false); // Set loading to false after fetching
  }, [locale, productId, factoryId]); // Re-run if params change

  // 1. Show a loading state
  if (isLoading) {
    return (
      <div className='container mx-auto py-8 text-center'>
        <h1 className='text-2xl font-bold'>Loading...</h1>
      </div>
    );
  }

  // 2. Show a not-found state if data is missing after loading
  if (!data.product || !data.factory) {
    return (
      <div className='container mx-auto py-8 text-center'>
        <h1 className='text-2xl font-bold'>Not Found</h1>
        <p>The product or supplier you are looking for does not exist.</p>
      </div>
    );
  }

  // 3. Render the page with the data
  return (
    <NegotiationClientPage product={data.product} factory={data.factory} />
  );
}
