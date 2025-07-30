import ProductsPage from "@/components/products-page/ProductsPage";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = params.locale;

  const t = await getTranslations({ locale });

  const baseUrl = "https://marsos.sa";

  return {
    title: t("products-seo.title"),
    description: t("products-seo.description"),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}/products`,
    },
    openGraph: {
      title: t("products-seo.title"),
      description: t("products-seo.description"),
      url: `${baseUrl}/${locale}/products`,
      images: [
        {
          url: `/og-image-${locale}.png`,
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
      images: [`/og-image-${locale}.png`],
    },
  };
}

export default function ProductsPageWrapper() {
  return <ProductsPage />;
}
