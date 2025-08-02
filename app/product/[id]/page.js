import ProductDetailsPage from "@/components/product-details/ProductDetailsPage";
import { featuredProducts } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }) {
  // Await params before using its properties
  const { id } = await params;

  // Convert id to number since your data uses numeric ids
  const productId = parseInt(id);

  // Find the product by id from your mock data
  const product = featuredProducts.find((p) => p.id === productId);

  if (!product) {
    notFound();
  }

  return <ProductDetailsPage product={product} />;
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  // Await params before using its properties
  const { id } = await params;

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

// Generate static params for all your products (for static generation)
export async function generateStaticParams() {
  return featuredProducts.map((product) => ({
    id: product.id.toString(),
  }));
}
