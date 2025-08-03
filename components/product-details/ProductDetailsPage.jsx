"use client";

import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Share2, Heart, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

// The state, handlers, and chat component import have been removed as they are no longer needed for the "new page" approach.

export default function ProductDetailsPage({ product }) {
  const t = useTranslations("ProductDetailsPage");
  const locale = useLocale();
  const router = useRouter();

  const breadcrumbs = [];
  if (product.category) {
    breadcrumbs.push(product.category);
  }
  if (product.subcategory) {
    breadcrumbs.push(product.subcategory);
  }

  return (
    <div className='container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8'>
      <nav className='flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 overflow-x-auto'>
        <Link
          href={`/${locale}`}
          className='hover:text-brand-green whitespace-nowrap'
        >
          {t("home")}
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <span key={index} className='flex items-center whitespace-nowrap'>
            <span className='mx-1 sm:mx-2'>/</span>
            <span
              className={
                index === breadcrumbs.length - 1
                  ? "text-gray-900"
                  : "hover:text-brand-green cursor-pointer"
              }
            >
              {crumb}
            </span>
          </span>
        ))}
        <span className='mx-1 sm:mx-2'>/</span>
        <span className='text-gray-900 font-medium truncate'>
          {product.name}
        </span>
      </nav>

      <Button
        variant='ghost'
        className='mb-4 sm:mb-6 p-0 h-auto font-normal text-sm sm:text-base text-gray-600 hover:text-brand-green'
        onClick={() => router.back()}
      >
        <ArrowLeft className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' />
        {t("backToProducts")}
      </Button>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8'>
        <div className='space-y-3 sm:space-y-4'>
          <div className='relative aspect-square w-full overflow-hidden rounded-lg border'>
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className='object-cover'
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw'
              priority
            />
          </div>
          {product.additionalImages && product.additionalImages.length > 0 && (
            <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
              {product.additionalImages.map((img, index) => (
                <div
                  key={index}
                  className='relative aspect-square overflow-hidden rounded-md border cursor-pointer hover:opacity-80'
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 33vw, 25vw'
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='space-y-4 sm:space-y-6'>
          <div>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight'>
              {product.name}
            </h1>
            <p className='text-sm sm:text-base lg:text-lg text-gray-600'>
              {t("productCodeLabel")}{" "}
              <span className='font-medium'>{product.productCode}</span>
            </p>
          </div>

          <div className='flex flex-wrap gap-1 sm:gap-2'>
            {breadcrumbs.map((crumb, index) => (
              <Badge key={index} variant='secondary' className='text-xs'>
                {crumb}
              </Badge>
            ))}
          </div>

          <Card>
            <CardContent className='pt-4 sm:pt-6'>
              <div className='text-center'>
                <p className='text-2xl sm:text-3xl font-bold text-brand-green mb-1'>
                  {t("priceCeilingValue", { price: product.priceCeiling })}
                </p>
                <p className='text-xs sm:text-sm text-gray-500 capitalize'>
                  {t("priceTypeRange", { priceType: product.priceType })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3 sm:pb-4'>
              <CardTitle className='text-base sm:text-lg'>
                {t("soldBy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.factories && product.factories.length > 0 ? (
                <div className='space-y-3'>
                  {product.factories.map((factory) => (
                    <div
                      key={factory.id}
                      className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0'
                    >
                      <div className='flex-1'>
                        <Link
                          href={`/${locale}/supplier/${factory.id}`}
                          className='text-brand-green hover:underline font-medium text-sm sm:text-base'
                        >
                          {factory.name}
                        </Link>
                        {factory.address && (
                          <p className='text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2'>
                            {factory.address}
                          </p>
                        )}
                        <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1'>
                          {factory.contactNumber && (
                            <p className='text-xs sm:text-sm text-gray-600'>
                              📞 {factory.contactNumber}
                            </p>
                          )}
                          {factory.email && (
                            <p className='text-xs sm:text-sm text-gray-600'>
                              ✉️ {factory.email}
                            </p>
                          )}
                        </div>
                        <div className='flex items-center gap-2 mt-2'>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              factory.hasBaseLine
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {t(
                              factory.hasBaseLine ? "hasBaseline" : "noBaseline"
                            )}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/${locale}/supplier/${factory.id}`}
                        className='self-start sm:self-center'
                      >
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-xs sm:text-sm'
                        >
                          {t("viewSupplier")}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-gray-500 text-sm'>
                  {t("factoryInfoNotAvailable")}
                </p>
              )}
            </CardContent>
          </Card>

          <div className='space-y-3'>
            <Button className='w-full text-sm sm:text-base' size='lg'>
              <ShoppingCart className='w-4 h-4 mr-2' />
              {t("requestQuotation")}
            </Button>
            <div className='flex gap-2 sm:gap-3'>
              <Button variant='outline' className='flex-1 text-xs sm:text-sm'>
                <Heart className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' />
                <span className='hidden sm:inline'>{t("addToWishlist")}</span>
                <span className='sm:hidden'>{t("wishlist")}</span>
              </Button>
              <Button variant='outline' className='flex-1 text-xs sm:text-sm'>
                <Share2 className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' />
                <span className='hidden sm:inline'>{t("shareProduct")}</span>
                <span className='sm:hidden'>{t("share")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8'>
        <div className='lg:col-span-2 space-y-4 sm:space-y-6'>
          <Card>
            <CardHeader className='pb-3 sm:pb-4'>
              <CardTitle className='text-base sm:text-lg'>
                {t("productDescriptionTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-700 leading-relaxed text-sm sm:text-base'>
                {product.definition ||
                  product.description ||
                  t("noDescription")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3 sm:pb-4'>
              <CardTitle className='text-base sm:text-lg'>
                {t("productInformationTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-3 sm:gap-4'>
                <div className='flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-0'>
                  <span className='font-medium text-gray-600 text-sm sm:text-base'>
                    {t("productCodeLabel")}
                  </span>
                  <span className='text-gray-900 text-sm sm:text-base'>
                    {product.productCode}
                  </span>
                </div>
                <div className='flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-0'>
                  <span className='font-medium text-gray-600 text-sm sm:text-base'>
                    {t("sectorCodeLabel")}
                  </span>
                  <span className='text-gray-900 text-sm sm:text-base'>
                    {product.sectorCode}
                  </span>
                </div>
                <div className='flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-0'>
                  <span className='font-medium text-gray-600 text-sm sm:text-base'>
                    {t("sectorLabel")}
                  </span>
                  <span className='text-gray-900 text-sm sm:text-base'>
                    {product.sectorName}
                  </span>
                </div>
                <div className='flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-0'>
                  <span className='font-medium text-gray-600 text-sm sm:text-base'>
                    {t("priceTypeLabel")}
                  </span>
                  <span className='text-gray-900 capitalize text-sm sm:text-base'>
                    {product.priceType}
                  </span>
                </div>
                <div className='flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 gap-1 sm:gap-0'>
                  <span className='font-medium text-gray-600 text-sm sm:text-base'>
                    {t("priceCeilingLabel")}
                  </span>
                  <span className='text-gray-900 text-sm sm:text-base'>
                    {t("pcs", { count: product.priceCeiling })}
                  </span>
                </div>
                {product.localContentCertificate && (
                  <div className='flex flex-col sm:flex-row sm:justify-between py-2 gap-1 sm:gap-0'>
                    <span className='font-medium text-gray-600 text-sm sm:text-base'>
                      {t("localContentCertificateLabel")}
                    </span>
                    <span className='text-gray-900 text-sm sm:text-base'>
                      {product.localContentCertificate}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-4 sm:space-y-6'>
          <Card>
            <CardHeader className='pb-3 sm:pb-4'>
              <CardTitle className='text-base sm:text-lg'>
                {t("needHelp")}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Link
                href={`/${locale}/negotiate/${product.id}/${product.factories[0]?.id}`}
                target='_blank'
                rel='noopener noreferrer'
                className={
                  !product.factories || product.factories.length === 0
                    ? "pointer-events-none"
                    : ""
                }
                aria-disabled={
                  !product.factories || product.factories.length === 0
                }
                tabIndex={
                  !product.factories || product.factories.length === 0
                    ? -1
                    : undefined
                }
              >
                <Button
                  variant='outline'
                  className='w-full text-sm mb-2'
                  disabled={
                    !product.factories || product.factories.length === 0
                  }
                >
                  {t("contactSupplier")}
                </Button>
              </Link>
              <Button variant='outline' className='w-full text-sm'>
                {t("liveChatSupport")}
              </Button>
              <p className='text-xs sm:text-sm text-gray-500 text-center'>
                {t("instantAnswers")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3 sm:pb-4'>
              <CardTitle className='text-base sm:text-lg'>
                {t("deliveryInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-xs sm:text-sm'>
              <div className='flex justify-between items-start'>
                <span className='text-gray-600'>{t("priceTypeLabel")}</span>
                <span className='font-medium capitalize text-right'>
                  {product.priceType}
                </span>
              </div>
              <div className='flex justify-between items-start'>
                <span className='text-gray-600'>{t("suppliersLabel")}</span>
                <span className='font-medium text-right'>
                  {t("suppliersAvailable", {
                    count: product.factories?.length || 0,
                  })}
                </span>
              </div>
              <div className='flex justify-between items-start'>
                <span className='text-gray-600'>{t("localContentLabel")}</span>
                <span className='font-medium text-brand-green text-right'>
                  {t(
                    product.localContentCertificate ? "required" : "notRequired"
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {breadcrumbs.length > 0 && (
            <Card>
              <CardHeader className='pb-3 sm:pb-4'>
                <CardTitle className='text-base sm:text-lg'>
                  {t("relatedCategories")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {breadcrumbs.map((crumb, index) => (
                    <Link
                      key={index}
                      href={`/${locale}/category/${crumb
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className='block text-xs sm:text-sm text-brand-green hover:underline'
                    >
                      {t("browseAllInCategory", { category: crumb })}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
