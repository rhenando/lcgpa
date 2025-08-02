import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <div
      className='flex flex-col min-h-screen bg-gray-50'
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale}
    >
      <NextIntlClientProvider messages={messages}>
        <Header />
        <main className='flex-grow container mx-auto px-4 py-8'>
          {children}
        </main>
        <Footer />
      </NextIntlClientProvider>
    </div>
  );
}
