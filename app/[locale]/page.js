// app/[locale]/page.js (or page.jsx)
import HomeContent from "../HomeContent";

export const dynamic = "force-dynamic";

// This works with Next.js 13/14 App Router & next-intl
export async function generateMetadata({ params }) {
  const { locale } = await params;

  // --- UPDATE THIS SECTION ---
  // Replace the placeholder domain and text with your project's actual details.
  const domain = "https://your-lcgpa-domain.com";

  // Localized meta data
  const meta =
    locale === "ar"
      ? {
          title: "هيئة المحتوى المحلي والمشتريات الحكومية | LCGPA",
          description:
            "موقع هيئة المحتوى المحلي والمشتريات الحكومية الرسمي. تعرف على مبادراتنا وخدماتنا لتعزيز المحتوى المحلي في المملكة.",
          keywords:
            "المحتوى المحلي, المشتريات الحكومية, صنع في السعودية, LCGPA, رؤية 2030",
          url: `${domain}/ar`,
          ogImage: `${domain}/og-image-ar.png`, // You need to create this image
          ogLocale: "ar-SA",
        }
      : {
          title: "Local Content & Government Procurement Authority | LCGPA",
          description:
            "The official website for the Local Content & Government Procurement Authority. Learn about our initiatives and services to enhance local content in the Kingdom.",
          keywords:
            "Local Content, Government Procurement, Made in Saudi, LCGPA, Vision 2030",
          url: `${domain}/en`,
          ogImage: `${domain}/og-image-en.png`, // You need to create this image
          ogLocale: "en-US",
        };

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: meta.url,
      languages: {
        ar: `${domain}/ar`,
        en: `${domain}/en`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.url,
      images: [meta.ogImage],
      locale: meta.ogLocale,
    },
  };
}

export default function HomePage() {
  return <HomeContent />;
}
