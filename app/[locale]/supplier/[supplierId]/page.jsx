import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "../../../../i18n/routing";
import { featuredProducts } from "@/lib/mock-data";

// Dynamic data loading function
const getSupplierData = async (supplierId, locale) => {
  let supplierInfo = null;
  const supplierProducts = [];

  // Load appropriate mock data based on locale
  let localizedProducts = featuredProducts;
  if (locale === "ar") {
    try {
      const { featuredProducts: arabicProducts } = await import(
        "@/lib/mock-data-ar"
      );
      localizedProducts = arabicProducts;
    } catch (error) {
      console.log("Arabic mock data not found, using default");
    }
  }

  // Find the factory details and all associated products
  for (const product of localizedProducts) {
    // Find the specific factory from the product's list
    const factory = product.factories?.find((f) => f.id === supplierId);

    // If we find the factory and haven't stored its main details yet, save them.
    if (factory && !supplierInfo) {
      supplierInfo = {
        id: factory.id,
        name: factory.name,
        logoUrl: `https://placehold.co/100x100/2A4B41/FFFFFF?text=${factory.name.substring(
          0,
          2
        )}`,
        isVerified: true,
        location: factory.address,
        website: `https://www.${factory.id}.com`,
        email: factory.email,
        phone: factory.contactNumber,
        about:
          locale === "ar"
            ? `معلومات مفصلة عن ${factory.name}. كشركة رائدة في التصنيع في المنطقة، نحن ملتزمون بتقديم منتجات عالية الجودة وحلول مبتكرة لشركائنا في جميع أنحاء العالم. مرافقنا الحديثة وفريقنا المتفاني يضمنان التميز في كل مرحلة من مراحل الإنتاج.`
            : `Detailed information about ${factory.name}. As a leading manufacturer in the region, we are committed to delivering high-quality products and innovative solutions to our partners worldwide. Our state-of-the-art facilities and dedicated team ensure excellence at every stage of production.`,
        companyDetails: {
          yearEstablished: "2005",
          employees: "200+",
          businessType:
            locale === "ar" ? "مصنع، مصدر" : "Manufacturer, Exporter",
        },
        certificates: [
          {
            id: "cert-1",
            name: "ISO 9001:2015",
            description:
              locale === "ar"
                ? "نظام إدارة الجودة"
                : "Quality Management System",
            fileUrl: "#",
          },
          {
            id: "cert-2",
            name:
              locale === "ar"
                ? "شهادة الامتثال الإقليمي"
                : "Regional Compliance Certificate",
            description:
              locale === "ar"
                ? "يلبي جميع المعايير المحلية والإقليمية"
                : "Meets all local and regional standards",
            fileUrl: "#",
          },
        ],
      };
    }

    // If this product is made by the supplier, add it to their product list.
    const isProductBySupplier = product.factories?.some(
      (f) => f.id === supplierId
    );
    if (isProductBySupplier) {
      supplierProducts.push(product);
    }
  }

  if (!supplierInfo) {
    return null;
  }

  return {
    ...supplierInfo,
    products: supplierProducts,
  };
};

// Localized ProductCard component
const ProductCard = ({ product, locale, t }) => (
  <Card className='flex flex-col h-full'>
    <CardHeader className='p-0'>
      <div className='relative aspect-square w-full overflow-hidden rounded-t-md'>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className='object-cover'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
      </div>
    </CardHeader>
    <CardContent
      className={`p-4 flex-grow ${
        locale === "ar" ? "text-right" : "text-left"
      }`}
    >
      <CardTitle className='text-base font-semibold line-clamp-1'>
        {product.name}
      </CardTitle>
      <p className='text-sm text-gray-500'>
        {t("productCode") || (locale === "ar" ? "كود" : "Code")}:{" "}
        {product.productCode}
      </p>
      <p className='mt-2 text-sm text-gray-600 line-clamp-2'>
        {product.definition}
      </p>
    </CardContent>
    <div className='p-4 pt-0'>
      <Button
        asChild
        variant='outline'
        className='w-full border-brand-green text-brand-green hover:bg-brand-green hover:text-white transition-colors'
      >
        <Link href={`/product/${product.id}`}>
          {t("viewDetails") ||
            (locale === "ar" ? "عرض التفاصيل" : "View Details")}
        </Link>
      </Button>
    </div>
  </Card>
);

export default async function SupplierProfilePage({ params }) {
  const { locale, supplierId } = await params;
  const supplier = await getSupplierData(supplierId, locale);

  const isRTL = locale === "ar";

  // Static translations with fallbacks
  const translations = {
    supplierNotFound:
      locale === "ar" ? "المورد غير موجود" : "Supplier Not Found",
    supplierNotFoundDesc:
      locale === "ar"
        ? "المورد الذي تبحث عنه غير موجود."
        : "The supplier you are looking for does not exist.",
    goBackHome:
      locale === "ar" ? "العودة للصفحة الرئيسية" : "Go Back to Homepage",
    verifiedSupplier: locale === "ar" ? "مورد معتمد" : "Verified Supplier",
    contactInformation:
      locale === "ar" ? "معلومات الاتصال" : "Contact Information",
    sendInquiry: locale === "ar" ? "إرسال استفسار" : "Send an Inquiry",
    requestQuotation: locale === "ar" ? "طلب عرض سعر" : "Request a Quotation",
    aboutUs: locale === "ar" ? "معلومات عنا" : "About Us",
    products: locale === "ar" ? "المنتجات" : "Products",
    certificates: locale === "ar" ? "الشهادات" : "Certificates",
    companyOverview:
      locale === "ar" ? "نظرة عامة على الشركة" : "Company Overview",
    companyDetails: locale === "ar" ? "تفاصيل الشركة" : "Company Details",
    yearEstablished: locale === "ar" ? "سنة التأسيس:" : "Year Established:",
    businessType: locale === "ar" ? "نوع النشاط:" : "Business Type:",
    numberOfEmployees:
      locale === "ar" ? "عدد الموظفين:" : "Number of Employees:",
    view: locale === "ar" ? "عرض" : "View",
    productCode: locale === "ar" ? "كود" : "Code",
    viewDetails: locale === "ar" ? "عرض التفاصيل" : "View Details",
  };

  if (!supplier) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-50'>
        <div className={`text-center ${isRTL ? "text-right" : "text-left"}`}>
          <h1 className='text-2xl font-bold text-gray-800'>
            {translations.supplierNotFound}
          </h1>
          <p className='text-gray-600 mt-2'>
            {translations.supplierNotFoundDesc}
          </p>
          <Button asChild className='mt-4'>
            <Link href='/'>{translations.goBackHome}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gray-50 min-h-screen' dir={isRTL ? "rtl" : "ltr"}>
      <div className='container mx-auto p-4 md:p-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column */}
          <div
            className={`lg:col-span-1 space-y-6 ${
              isRTL ? "lg:order-2" : "lg:order-1"
            }`}
          >
            <Card>
              <CardContent className='p-6 flex flex-col items-center text-center'>
                <Avatar className='w-24 h-24 mb-4 border-4 border-white shadow-md'>
                  <AvatarImage src={supplier.logoUrl} alt={supplier.name} />
                  <AvatarFallback>
                    {supplier.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <h1 className='text-2xl font-bold text-gray-800'>
                  {supplier.name}
                </h1>
                {supplier.isVerified && (
                  <Badge
                    variant='secondary'
                    className={`mt-2 bg-green-100 text-brand-green border border-green-200 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <CheckCircle
                      className={`w-4 h-4 ${isRTL ? "ml-1.5" : "mr-1.5"}`}
                    />
                    {translations.verifiedSupplier}
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle
                  className={`text-lg ${isRTL ? "text-right" : "text-left"}`}
                >
                  {translations.contactInformation}
                </CardTitle>
              </CardHeader>
              <CardContent
                className={`space-y-4 text-sm ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`flex items-start gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <MapPin className='w-5 h-5 text-gray-400 mt-0.5' />
                  <span className='text-gray-700'>{supplier.location}</span>
                </div>
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Globe className='w-5 h-5 text-gray-400' />
                  <a
                    href={supplier.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-brand-green hover:underline truncate'
                  >
                    {supplier.website}
                  </a>
                </div>
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Mail className='w-5 h-5 text-gray-400' />
                  <a
                    href={`mailto:${supplier.email}`}
                    className='text-brand-green hover:underline'
                  >
                    {translations.sendInquiry}
                  </a>
                </div>
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Phone className='w-5 h-5 text-gray-400' />
                  <span className='text-gray-700'>{supplier.phone}</span>
                </div>
              </CardContent>
            </Card>

            <div className='p-4 bg-white rounded-lg shadow-sm'>
              <Button className='w-full bg-brand-green hover:bg-opacity-90'>
                {translations.requestQuotation}
              </Button>
            </div>
          </div>

          {/* Right Column */}
          <div
            className={`lg:col-span-2 ${isRTL ? "lg:order-1" : "lg:order-2"}`}
          >
            <Tabs
              defaultValue='about'
              className='w-full'
              dir={isRTL ? "rtl" : "ltr"}
            >
              <TabsList className='grid w-full grid-cols-3 bg-gray-200'>
                <TabsTrigger value='about'>{translations.aboutUs}</TabsTrigger>
                <TabsTrigger value='products'>
                  {translations.products}
                </TabsTrigger>
                <TabsTrigger value='certificates'>
                  {translations.certificates}
                </TabsTrigger>
              </TabsList>

              <TabsContent value='about' className='mt-6'>
                <Card>
                  <CardContent
                    className={`p-6 space-y-6 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800'>
                        {translations.companyOverview}
                      </h3>
                      <p className='mt-2 text-gray-600 leading-relaxed'>
                        {supplier.about}
                      </p>
                    </div>
                    <div className='border-t border-gray-200 pt-6'>
                      <h3 className='text-lg font-semibold text-gray-800'>
                        {translations.companyDetails}
                      </h3>
                      <dl className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                        <div
                          className={`flex ${
                            isRTL
                              ? "justify-between flex-row-reverse"
                              : "justify-between"
                          }`}
                        >
                          <dt className='text-gray-500'>
                            {translations.yearEstablished}
                          </dt>
                          <dd className='text-gray-800 font-medium'>
                            {supplier.companyDetails.yearEstablished}
                          </dd>
                        </div>
                        <div
                          className={`flex ${
                            isRTL
                              ? "justify-between flex-row-reverse"
                              : "justify-between"
                          }`}
                        >
                          <dt className='text-gray-500'>
                            {translations.businessType}
                          </dt>
                          <dd className='text-gray-800 font-medium'>
                            {supplier.companyDetails.businessType}
                          </dd>
                        </div>
                        <div
                          className={`flex ${
                            isRTL
                              ? "justify-between flex-row-reverse"
                              : "justify-between"
                          }`}
                        >
                          <dt className='text-gray-500'>
                            {translations.numberOfEmployees}
                          </dt>
                          <dd className='text-gray-800 font-medium'>
                            {supplier.companyDetails.employees}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='products' className='mt-6'>
                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
                  {supplier.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      locale={locale}
                      t={(key) => translations[key]}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value='certificates' className='mt-6'>
                <Card>
                  <CardContent className='p-6 space-y-4'>
                    {supplier.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`flex items-center gap-4 ${
                            isRTL ? "flex-row-reverse text-right" : "text-left"
                          }`}
                        >
                          <FileText className='w-6 h-6 text-brand-green' />
                          <div>
                            <p className='font-semibold text-gray-800'>
                              {cert.name}
                            </p>
                            <p className='text-sm text-gray-500'>
                              {cert.description}
                            </p>
                          </div>
                        </div>
                        <Button asChild variant='outline' size='sm'>
                          <a
                            href={cert.fileUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {translations.view}
                          </a>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
