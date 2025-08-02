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
import Link from "next/link";
// 1. Import your mock data. Adjust the path if necessary.
import { featuredProducts } from "@/lib/mock-data";

// 2. This function now dynamically finds the supplier and their products.
const getSupplierData = async (supplierId) => {
  let supplierInfo = null;
  const supplierProducts = [];

  // Find the factory details and all associated products
  for (const product of featuredProducts) {
    // Find the specific factory from the product's list
    const factory = product.factories.find((f) => f.id === supplierId);

    // If we find the factory and haven't stored its main details yet, save them.
    if (factory && !supplierInfo) {
      supplierInfo = {
        id: factory.id,
        name: factory.name,
        logoUrl: `https://placehold.co/100x100/2A4B41/FFFFFF?text=${factory.name.substring(
          0,
          2
        )}`,
        isVerified: true, // Default value
        location: factory.address,
        website: `https://www.${factory.id}.com`, // Placeholder website
        email: factory.email,
        phone: factory.contactNumber,
        about: `Detailed information about ${factory.name}. As a leading manufacturer in the region, we are committed to delivering high-quality products and innovative solutions to our partners worldwide. Our state-of-the-art facilities and dedicated team ensure excellence at every stage of production.`, // Placeholder about text
        companyDetails: {
          // Placeholder details
          yearEstablished: "2005",
          employees: "200+",
          businessType: "Manufacturer, Exporter",
        },
        certificates: [
          // Placeholder certificates
          {
            id: "cert-1",
            name: "ISO 9001:2015",
            description: "Quality Management System",
            fileUrl: "#",
          },
          {
            id: "cert-2",
            name: "Regional Compliance Certificate",
            description: "Meets all local and regional standards",
            fileUrl: "#",
          },
        ],
      };
    }

    // If this product is made by the supplier, add it to their product list.
    const isProductBySupplier = product.factories.some(
      (f) => f.id === supplierId
    );
    if (isProductBySupplier) {
      supplierProducts.push(product);
    }
  }

  // If no supplier was found with that ID, return null.
  if (!supplierInfo) {
    return null;
  }

  // Return the complete supplier profile
  return {
    ...supplierInfo,
    products: supplierProducts,
  };
};

// This is a placeholder for your ProductCard component
// In your actual app, you would import your existing ProductCard
const ProductCard = ({ product }) => (
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
    <CardContent className='p-4 flex-grow'>
      <CardTitle className='text-base font-semibold line-clamp-1'>
        {product.name}
      </CardTitle>
      <p className='text-sm text-gray-500'>Code: {product.productCode}</p>
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
        <Link href={`/product/${product.id}`}>View Details</Link>
      </Button>
    </div>
  </Card>
);

export default async function SupplierProfilePage({ params }) {
  // Fix: Await params before accessing its properties
  const { supplierId } = await params;
  const supplier = await getSupplierData(supplierId);

  // 3. Handle the case where no supplier is found
  if (!supplier) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-50'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-800'>
            Supplier Not Found
          </h1>
          <p className='text-gray-600 mt-2'>
            The supplier you are looking for does not exist.
          </p>
          <Button asChild className='mt-4'>
            <Link href='/'>Go Back to Homepage</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='container mx-auto p-4 md:p-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column */}
          <div className='lg:col-span-1 space-y-6'>
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
                    className='mt-2 bg-green-100 text-brand-green border border-green-200'
                  >
                    <CheckCircle className='w-4 h-4 mr-1.5' />
                    Verified Supplier
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4 text-sm'>
                <div className='flex items-start gap-3'>
                  <MapPin className='w-5 h-5 text-gray-400 mt-0.5' />
                  <span className='text-gray-700'>{supplier.location}</span>
                </div>
                <div className='flex items-center gap-3'>
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
                <div className='flex items-center gap-3'>
                  <Mail className='w-5 h-5 text-gray-400' />
                  <a
                    href={`mailto:${supplier.email}`}
                    className='text-brand-green hover:underline'
                  >
                    Send an Inquiry
                  </a>
                </div>
                <div className='flex items-center gap-3'>
                  <Phone className='w-5 h-5 text-gray-400' />
                  <span className='text-gray-700'>{supplier.phone}</span>
                </div>
              </CardContent>
            </Card>

            <div className='p-4 bg-white rounded-lg shadow-sm'>
              <Button className='w-full bg-brand-green hover:bg-opacity-90'>
                Request a Quotation
              </Button>
            </div>
          </div>

          {/* Right Column */}
          <div className='lg:col-span-2'>
            <Tabs defaultValue='about' className='w-full'>
              <TabsList className='grid w-full grid-cols-3 bg-gray-200'>
                <TabsTrigger value='about'>About Us</TabsTrigger>
                <TabsTrigger value='products'>Products</TabsTrigger>
                <TabsTrigger value='certificates'>Certificates</TabsTrigger>
              </TabsList>

              <TabsContent value='about' className='mt-6'>
                <Card>
                  <CardContent className='p-6 space-y-6'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800'>
                        Company Overview
                      </h3>
                      <p className='mt-2 text-gray-600 leading-relaxed'>
                        {supplier.about}
                      </p>
                    </div>
                    <div className='border-t border-gray-200 pt-6'>
                      <h3 className='text-lg font-semibold text-gray-800'>
                        Company Details
                      </h3>
                      <dl className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <dt className='text-gray-500'>Year Established:</dt>
                          <dd className='text-gray-800 font-medium'>
                            {supplier.companyDetails.yearEstablished}
                          </dd>
                        </div>
                        <div className='flex justify-between'>
                          <dt className='text-gray-500'>Business Type:</dt>
                          <dd className='text-gray-800 font-medium'>
                            {supplier.companyDetails.businessType}
                          </dd>
                        </div>
                        <div className='flex justify-between'>
                          <dt className='text-gray-500'>
                            Number of Employees:
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
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value='certificates' className='mt-6'>
                <Card>
                  <CardContent className='p-6 space-y-4'>
                    {supplier.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border'
                      >
                        <div className='flex items-center gap-4'>
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
                            View
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
