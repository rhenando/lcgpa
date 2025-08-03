"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "../../i18n/routing";
import Image from "next/image";
import { Linkedin, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const currentYear = new Date().getFullYear();

  // NOTE: A Government Procurement Authority would have official social media accounts.
  // Replace '#' with your actual URLs.
  const socialLinks = [
    {
      href: "#",
      icon: <Twitter size={20} />,
      label: "Twitter",
    },
    {
      href: "#",
      icon: <Linkedin size={20} />,
      label: "LinkedIn",
    },
    {
      href: "#",
      icon: <Youtube size={20} />,
      label: "Youtube",
    },
  ];

  return (
    <footer className='bg-[#074d31] text-white' dir={isRTL ? "rtl" : "ltr"}>
      <div className='max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Top Grid: Re-structured for government context */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-right'>
          {/* About the Authority */}
          <div
            className={`sm:col-span-2 ${isRTL ? "order-first" : "order-first"}`}
          >
            <div
              className={`mb-4 ${
                isRTL ? "flex justify-end" : "flex justify-start"
              }`}
            >
              <Image
                src='/logo.svg' // NOTE: A white version of your logo is needed for dark backgrounds.
                alt={
                  t("logoAlt") ||
                  "Local Content & Government Procurement Authority"
                }
                width={180}
                height={40}
                className='bg-white rounded-sm'
              />
            </div>
            <p className='text-gray-300 text-sm'>
              {t("description") ||
                (locale === "ar"
                  ? "هيئة المحتوى المحلي والمشتريات الحكومية مسؤولة عن تطوير المحتوى المحلي وتحسين عمليات المشتريات الحكومية لدعم الاقتصاد الوطني."
                  : "The LCGPA is responsible for developing local content and improving government procurement processes to support the national economy.")}
            </p>
          </div>

          {/* Important Links */}
          <div className={isRTL ? "order-3" : "order-2"}>
            <h3 className='font-semibold mb-4 text-white uppercase tracking-wider'>
              {t("importantLinks") ||
                (locale === "ar" ? "روابط مهمة" : "Important Links")}
            </h3>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link
                  href='/tenders'
                  className='text-gray-300 hover:text-white hover:underline block'
                >
                  {t("tenders") ||
                    (locale === "ar"
                      ? "المناقصات والفرص"
                      : "Tenders & Opportunities")}
                </Link>
              </li>
              <li>
                <Link
                  href='/supplier-registration'
                  className='text-gray-300 hover:text-white hover:underline block'
                >
                  {t("supplierRegistration") ||
                    (locale === "ar"
                      ? "تسجيل المورد"
                      : "Supplier Registration")}
                </Link>
              </li>
              <li>
                <Link
                  href='/regulations'
                  className='text-gray-300 hover:text-white hover:underline block'
                >
                  {t("regulations") ||
                    (locale === "ar"
                      ? "القوانين واللوائح"
                      : "Laws & Regulations")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className={isRTL ? "order-2" : "order-3"}>
            <h3 className='font-semibold mb-4 text-white uppercase tracking-wider'>
              {t("support") || (locale === "ar" ? "الدعم" : "Support")}
            </h3>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link
                  href='/faq'
                  className='text-gray-300 hover:text-white hover:underline block'
                >
                  {t("helpCenter") ||
                    (locale === "ar" ? "مركز المساعدة" : "Help Center")}
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='text-gray-300 hover:text-white hover:underline block'
                >
                  {t("contactUs") ||
                    (locale === "ar" ? "اتصل بنا" : "Contact Us")}
                </Link>
              </li>
              <li>
                <Link
                  href='/terms-of-service'
                  className='text-gray-300 hover:text-white hover:underline block'
                >
                  {t("termsOfService") ||
                    (locale === "ar" ? "شروط الخدمة" : "Terms of Service")}
                </Link>
              </li>
              <li>
                <Link
                  href='/privacy-policy'
                  className='text-gray-300 hover:text-white hover:underline block'
                >
                  {t("privacyPolicy") ||
                    (locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Separator and social links */}
        <div
          className={`mt-10 border-t border-white/20 pt-8 flex flex-col sm:flex-row ${
            isRTL ? "sm:flex-row-reverse justify-start" : "justify-between"
          } items-center gap-6`}
        >
          {/* Social Links */}
          <div
            className={`flex items-center gap-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <p className='text-sm font-semibold'>
              {t("followUs") || (locale === "ar" ? "تابعونا:" : "Follow Us:")}
            </p>
            <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={link.label}
                  className='text-gray-300 hover:text-white transition-colors'
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Logos and Copyright */}
        <div
          className={`mt-10 border-t border-white/20 pt-8 flex flex-col md:flex-row items-center ${
            isRTL ? "md:flex-row-reverse justify-start" : "justify-between"
          } gap-8`}
        >
          <div className='text-center text-xs text-gray-400'>
            <span>
              {t("copyright", { year: currentYear }) ||
                (locale === "ar"
                  ? `© ${currentYear} هيئة المحتوى المحلي والمشتريات الحكومية. جميع الحقوق محفوظة.`
                  : `© ${currentYear} Local Content & Government Procurement Authority. All rights reserved.`)}
            </span>
          </div>

          {/* Local Government Trust Logos */}
          <div
            className={`flex items-center gap-x-6 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <a
              href='https://vision2030.gov.sa'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Image
                src='/vision_2030_logo.svg'
                alt={
                  locale === "ar" ? "رؤية السعودية 2030" : "Saudi Vision 2030"
                }
                width={180}
                height={55}
                className='object-contain'
              />
            </a>
            <a
              href='https://bc.gov.sa'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Image
                src='/saudi_business_logo.png'
                alt={
                  locale === "ar"
                    ? "مركز الأعمال السعودي"
                    : "Saudi Business Center"
                }
                width={100}
                height={55}
                className='object-contain'
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
