import ContactForm from "./form"; // Imports the client-side form

export const metadata = {
  title: {
    default: "Contact Us | Government Procurement Authority",
    ar: "اتصل بنا | هيئة المشتريات الحكومية",
  },
  description: {
    default:
      "Contact the support team for inquiries about government tenders, supplier registration, or technical assistance with the official procurement portal.",
    ar: "تواصل مع فريق الدعم للاستفسارات حول المنافسات الحكومية، أو تسجيل الموردين، أو المساعدة التقنية المتعلقة بالبوابة الرسمية للمشتريات.",
  },
  keywords: [
    "government procurement support",
    "contact procurement authority",
    "supplier registration help",
    "tender inquiry",
    "Saudi Arabia government support",
    "دعم المشتريات الحكومية",
    "تسجيل الموردين",
    "استفسار عن منافسة",
  ],
  openGraph: {
    title: {
      default: "Contact the Government Procurement Authority",
      ar: "التواصل مع هيئة المشتريات الحكومية",
    },
    description: {
      default:
        "Get official support for tenders, supplier registration, and portal inquiries.",
      ar: "احصل على الدعم الرسمي للمنافسات وتسجيل الموردين والاستفسارات المتعلقة بالبوابة.",
    },
    // NOTE: Replace with your actual domain
    url: "https://gpa.gov.sa/contact",
    siteName: "Government Procurement Authority",
    images: [
      {
        // NOTE: Replace with your actual Open Graph image URL
        url: "https://gpa.gov.sa/og-contact.png",
        width: 1200,
        height: 630,
        alt: "Contact the Government Procurement Authority Support Center",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "Contact Us | Government Procurement Authority",
      ar: "اتصل بنا | هيئة المشتريات الحكومية",
    },
    description: {
      default:
        "Official support for government tenders, supplier registration, and technical portal assistance.",
      ar: "الدعم الرسمي للمنافسات الحكومية، وتسجيل الموردين، والمساعدة التقنية للبوابة.",
    },
    // NOTE: Replace with your actual Twitter image URL
    images: ["https://gpa.gov.sa/og-contact.png"],
  },
  alternates: {
    canonical: "/contact",
    languages: {
      "en-US": "/contact",
      "ar-SA": "/ar/contact",
    },
  },
};

export default function ContactPage() {
  return <ContactForm />;
}
