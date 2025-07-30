import CategoriesAndProductsPage from "@/components/categories-page/CategoriesAndProductsPage";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(props) {
  const resolvedParams = await props.params;
  const locale = resolvedParams.locale;

  const t = await getTranslations({ locale });

  return {
    title: t("products-seo.title"),
    description: t("products-seo.description"),
    alternates: {
      canonical: `https://marsos.sa/${locale}/categories`,
    },
    openGraph: {
      title: t("products-seo.title"),
      description: t("products-seo.description"),
      url: `https://marsos.sa/${locale}/categories`,
      images: [
        {
          url: `https://marsos.sa/og-image-${locale}.png`,
          width: 1200,
          height: 630,
          alt: t("products-seo.title"),
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("products-seo.title"),
      description: t("products-seo.description"),
      images: [`https://marsos.sa/og-image-${locale}.png`],
    },
  };
}

// ✅ Must NOT be async if rendering a Client Component
export default function CategoriesPage() {
  return <CategoriesAndProductsPage />;
}
