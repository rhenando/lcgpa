"use client";

import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { db } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useTranslations, useLocale } from "next-intl";
import ProductCard from "@/components/global/ProductCard";

// SVGs
const VerifiedIcon = () => (
  <svg className='w-4 h-4 inline-block me-1' viewBox='0 0 20 20' fill='#2c6449'>
    <circle cx='10' cy='10' r='10' fill='#e8f6ef' />
    <path
      d='M7.8 10.9l1.8 1.7 3.4-4.2'
      stroke='#2c6449'
      strokeWidth='1.5'
      fill='none'
      strokeLinecap='round'
    />
  </svg>
);
const StarIcon = () => (
  <svg className='w-4 h-4 inline-block me-1' fill='#facc15' viewBox='0 0 20 20'>
    <polygon points='10,2 12.5,7.5 18,8 14,12 15,18 10,15 5,18 6,12 2,8 7.5,7.5' />
  </svg>
);

export default function SupplierProfile({ supplierId }) {
  const t = useTranslations("supplierProfileNew");
  const locale = useLocale();

  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("about");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supplierId) return;

    async function fetchData() {
      setLoading(true);

      // 1. Fetch company (user) info
      const userQ = query(
        collection(db, "users"),
        where("uid", "==", supplierId)
      );
      const userSnap = await getDocs(userQ);
      const userDoc = userSnap.docs[0];
      setCompany(userDoc ? userDoc.data() : null);

      // 2. Fetch products
      const prodQ = query(
        collection(db, "products"),
        where("supplierId", "==", supplierId)
      );
      const prodSnap = await getDocs(prodQ);
      setProducts(prodSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      setLoading(false);
    }
    fetchData();
  }, [supplierId]);

  if (loading)
    return (
      <div className='p-12 text-center text-lg text-gray-400'>
        {t("loading")}
      </div>
    );
  if (!company)
    return (
      <div className='p-12 text-center text-lg text-red-500'>
        {t("supplierNotFound")}
      </div>
    );

  // Helper for "not specified"
  const showOrNotSpecified = (val) =>
    val !== undefined && val !== "" ? (
      val
    ) : (
      <span className='text-gray-400'>{t("notSpecified")}</span>
    );

  // Badges (static for now)
  const badges = [
    { label: t("verified"), color: "bg-green-600", icon: <VerifiedIcon /> },
    { label: t("premium"), color: "bg-[#2c6449]", icon: <StarIcon /> },
  ];

  // Reviews summary
  function ReviewsSummary() {
    const rating = parseFloat(company.reviewsScore || company.rating || "5.0");
    const reviewsCount = company.reviewsCount;

    function renderStars(score) {
      const fullStars = Math.floor(score);
      const halfStar = score % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
      return (
        <span className='flex items-center ms-1'>
          {[...Array(fullStars)].map((_, i) => (
            <StarIcon key={"full-" + i} />
          ))}
          {halfStar && (
            <svg className='w-5 h-5 text-yellow-400' viewBox='0 0 20 20'>
              <defs>
                <linearGradient id='half'>
                  <stop offset='50%' stopColor='#facc15' />
                  <stop offset='50%' stopColor='#e5e7eb' />
                </linearGradient>
              </defs>
              <polygon
                fill='url(#half)'
                points='10,2 12.5,7.5 18,8 14,12 15,18 10,15 5,18 6,12 2,8 7.5,7.5'
              />
            </svg>
          )}
          {[...Array(emptyStars)].map((_, i) => (
            <svg
              key={"empty-" + i}
              className='w-5 h-5 text-gray-300'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <polygon points='10,2 12.5,7.5 18,8 14,12 15,18 10,15 5,18 6,12 2,8 7.5,7.5' />
            </svg>
          ))}
        </span>
      );
    }

    return (
      <div className='bg-gradient-to-br from-[#f3f8f6] to-white rounded-2xl shadow p-6 flex flex-col items-center mb-6 border border-[#e7ecec]'>
        <div className='flex items-center mb-1'>
          <span className='text-3xl font-extrabold text-[#2c6449] me-1'>
            {rating}
          </span>
          {renderStars(rating)}
        </div>
        <div className='font-medium text-gray-800'>
          {reviewsCount} {t("verifiedReviews", { count: reviewsCount })}
        </div>
        <div className='text-gray-500 text-xs mb-2'>
          {t("averageSupplierRating")}
        </div>
        <a
          href='#'
          className='inline-flex items-center mt-1 text-[#2c6449] font-semibold hover:underline group text-sm transition'
        >
          {t("readAllReviews")}
          <svg
            className='w-4 h-4 ms-1 group-hover:translate-x-1 transition-transform'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M9 5l7 7-7 7'
            />
          </svg>
        </a>
      </div>
    );
  }

  // About fields
  const aboutFields = [
    { label: t("businessType"), key: "businessType" },
    { label: t("mainProducts"), key: "mainProducts" },
    { label: t("yearOfEstablishment"), key: "yearOfEstablishment" },
    { label: t("numberOfEmployees"), key: "numberOfEmployees" },
    { label: t("productCertification"), key: "productCertification" },
    { label: t("plantArea"), key: "plantArea" },
    { label: t("registeredCapital"), key: "registeredCapital" },
    { label: t("crNumber"), key: "crNumber" },
    { label: t("vatRegistration"), key: "vatNumber" },
    { label: t("address"), key: "address" },
    { label: t("auditReport"), key: "auditReportNo" },
  ];
  const seen = new Set();
  const mergedAboutFields = aboutFields.filter((field) => {
    if (seen.has(field.label)) return false;
    seen.add(field.label);
    return true;
  });

  return (
    <section
      dir={locale === "ar" ? "rtl" : "ltr"}
      className='w-full bg-gray-50 min-h-screen pb-16'
    >
      {/* Banner/Header */}
      <div className='w-full bg-[#eaf2ef]'>
        <div
          className='h-44 sm:h-56 w-full bg-center bg-cover relative'
          style={{
            backgroundImage: `url(${
              company.bannerUrl || "/company-banner-default.jpg"
            })`,
          }}
        >
          <div className='absolute inset-0 bg-gradient-to-r from-[#2c6449]/80 to-transparent' />
          <div className='absolute left-1/2 transform -translate-x-1/2 lg:left-24 lg:translate-x-0 bottom-0 flex items-end gap-4 px-4 pb-4 w-full max-w-7xl mx-auto'>
            <img
              src={company.logoUrl || "/company-logo-default.png"}
              alt={company.companyName || company.name}
              className='w-24 h-24 sm:w-32 sm:h-32 rounded-xl shadow-lg border-4 border-white object-cover bg-white'
            />
            <div className='text-white drop-shadow w-auto max-w-xs sm:max-w-md'>
              <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
                {company.companyName || company.name}
              </h1>
              <div className='flex flex-wrap items-center gap-2 mb-1'>
                {badges.map((b, i) => (
                  <span
                    key={i}
                    className={`${b.color} text-white text-xs px-2 py-1 rounded-full flex items-center font-bold`}
                  >
                    {b.icon}
                    {b.label}
                  </span>
                ))}
              </div>
              <div className='flex items-center gap-2 text-xs'>
                <span>
                  {showOrNotSpecified(company.verifiedItems)}{" "}
                  {t("verifiedProducts", { count: company.verifiedItems || 0 })}
                </span>
                <span>•</span>
                <span>{showOrNotSpecified(company.numberOfEmployees)}</span>
                <span>•</span>
                <span>{t("since", { year: company.yearOfEstablishment })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-3 lg:px-8 mt-6 flex flex-col lg:flex-row gap-8'>
        {/* --- Sidebar: Contact & Supplier Info --- */}
        <aside className='w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-6 self-start'>
          <div className='bg-white rounded-2xl shadow-lg p-6 mb-6'>
            <div className='flex items-center gap-2 mb-4'>
              <img
                src={company.logoUrl || "/company-logo-default.jpg"}
                alt={company.companyName || company.name}
                className='w-8 h-8 rounded-full border border-gray-200'
              />
              <span className='font-semibold text-gray-800 text-sm'>
                {company.companyName || company.name}
              </span>
            </div>
            <h3 className='text-lg font-semibold text-[#2c6449] mb-2'>
              {t("contactSupplier")}
            </h3>
            <button className='w-full bg-[#2c6449] text-white rounded-lg py-2 mb-2 font-semibold text-sm hover:bg-[#215039] transition'>
              {t("chatNow")}
            </button>
            <button className='w-full border border-[#2c6449] text-[#2c6449] rounded-lg py-2 font-semibold text-sm hover:bg-[#f3f8f6] transition'>
              {t("sendInquiry")}
            </button>
            <div className='mt-5 text-xs text-gray-500'>
              <span className='font-semibold'>{t("supplierAddress")}</span>
              <br />
              {showOrNotSpecified(company.address)}
            </div>
          </div>
          <div className='bg-white rounded-2xl shadow p-6 mb-6'>
            <h4 className='font-semibold text-sm text-[#2c6449] mb-3'>
              {t("storeStats")}
            </h4>
            <ul className='text-sm text-gray-700 space-y-2'>
              <li>
                <span className='font-medium'>{t("avgResponse")}</span>{" "}
                {showOrNotSpecified(company.averageResponseTime)}
              </li>
              <li>
                <span className='font-medium'>{t("auditReport")}</span>{" "}
                {showOrNotSpecified(company.auditReportNo)}
              </li>
              <li>
                <span className='font-medium'>{t("crNumber")}</span>{" "}
                {showOrNotSpecified(company.crNumber)}
              </li>
              <li>
                <span className='font-medium'>{t("vatRegistration")}</span>{" "}
                {showOrNotSpecified(company.vatNumber)}
              </li>
            </ul>
          </div>
          <ReviewsSummary />
        </aside>

        {/* --- Main Content --- */}
        <main className='flex-1'>
          {/* --- Tabs --- */}
          <div className='bg-white rounded-2xl shadow mb-7'>
            <div className='border-b flex flex-col sm:flex-row gap-y-2 sm:gap-y-0 sm:gap-x-2 px-6 pt-4'>
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold text-sm border-b-2 transition ${
                  tab === "about"
                    ? "border-[#2c6449] text-[#2c6449] bg-[#f7faf9]"
                    : "border-transparent text-gray-500 hover:text-[#2c6449]"
                }`}
                onClick={() => setTab("about")}
              >
                {t("about")}
              </button>
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold text-sm border-b-2 transition ${
                  tab === "store"
                    ? "border-[#2c6449] text-[#2c6449] bg-[#f7faf9]"
                    : "border-transparent text-gray-500 hover:text-[#2c6449]"
                }`}
                onClick={() => setTab("store")}
              >
                {t("store")}
              </button>
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold text-sm border-b-2 transition ${
                  tab === "reviews"
                    ? "border-[#2c6449] text-[#2c6449] bg-[#f7faf9]"
                    : "border-transparent text-gray-500 hover:text-[#2c6449]"
                }`}
                onClick={() => setTab("reviews")}
              >
                {t("reviews")}
              </button>
            </div>
            <div className='px-4 py-6 sm:px-6'>
              {/* --- About Tab --- */}
              {tab === "about" && (
                <section>
                  <h2 className='text-xl font-bold text-[#2c6449] mb-2'>
                    {t("about")} {company.companyName || company.name}
                  </h2>
                  <p className='text-gray-800 text-base mb-4'>
                    {company.companyDescriptionEn || company.description}
                  </p>
                  {/* Download Company Profile button */}
                  {company.companyProfileUrl ? (
                    <a
                      href={company.companyProfileUrl}
                      target='_blank'
                      rel='noopener'
                      className='inline-flex items-center bg-[#2c6449] text-white px-4 py-2 rounded-lg font-semibold text-sm mb-4 hover:bg-[#215039] transition'
                      download
                    >
                      {t("downloadCompanyProfile")}
                      <Download className='w-4 h-4 ms-2' />
                    </a>
                  ) : (
                    <span className='inline-flex items-center bg-gray-300 text-gray-600 px-4 py-2 rounded-lg font-semibold text-sm mb-4 cursor-not-allowed opacity-60'>
                      {t("companyProfileNotUploaded")}
                      <Download className='w-4 h-4 ms-2' />
                    </span>
                  )}
                  <dl className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-4'>
                    {mergedAboutFields.map((field) => (
                      <div key={field.key}>
                        <dt className='font-medium text-gray-500'>
                          {field.label}
                        </dt>
                        <dd className='font-semibold text-gray-800'>
                          {showOrNotSpecified(company[field.key])}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
              {/* --- Store Tab (Product grid) --- */}
              {tab === "store" && (
                <section>
                  <div className='flex items-center justify-between mb-3'>
                    <h3 className='text-lg font-bold text-gray-900'>
                      {t("featuredProducts")}
                    </h3>
                    <a
                      href='#'
                      className='text-sm text-[#2c6449] font-medium hover:underline'
                    >
                      {t("viewAllProducts")}
                    </a>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5'>
                    {products.length === 0 ? (
                      <div className='col-span-full text-gray-400 text-center py-10'>
                        {t("noProductsYet")}
                      </div>
                    ) : (
                      products.map((prod) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          locale={locale}
                          t={t}
                        />
                      ))
                    )}
                  </div>
                </section>
              )}

              {/* --- Reviews Tab (static demo) --- */}
              {tab === "reviews" && (
                <section>
                  <h3 className='text-lg font-bold mb-4'>
                    {t("customerReviews")}
                  </h3>
                  <div className='space-y-6'>
                    <div className='bg-gray-50 border rounded-xl p-4 flex gap-3'>
                      <div>
                        <span className='font-bold text-yellow-500'>5.0</span>{" "}
                        <StarIcon />
                      </div>
                      <div className='flex-1'>
                        <div className='font-semibold'>
                          “High quality, fast delivery!”
                        </div>
                        <div className='text-gray-500 text-xs'>
                          — Ahmad, KSA
                        </div>
                      </div>
                    </div>
                    <div className='bg-gray-50 border rounded-xl p-4 flex gap-3'>
                      <div>
                        <span className='font-bold text-yellow-500'>4.5</span>{" "}
                        <StarIcon />
                      </div>
                      <div className='flex-1'>
                        <div className='font-semibold'>
                          “Great supplier for our packaging needs.”
                        </div>
                        <div className='text-gray-500 text-xs'>
                          — Sara, Riyadh
                        </div>
                      </div>
                    </div>
                    <div className='text-end mt-2'>
                      <a
                        href='#'
                        className='text-sm text-[#2c6449] font-medium hover:underline'
                      >
                        {t("seeMoreReviews")}
                      </a>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
