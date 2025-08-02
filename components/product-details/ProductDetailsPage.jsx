"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Share2, Heart, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductDetailsPage({ product }) {
  const router = useRouter();

  // Use category and subcategory exactly as they are - don't clean them
  const breadcrumbs = [];

  // Add category exactly as it is
  if (product.category) {
    breadcrumbs.push(product.category);
  }

  // Add subcategory exactly as it is
  if (product.subcategory) {
    breadcrumbs.push(product.subcategory);
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Breadcrumb Navigation */}
      <nav className='flex items-center space-x-2 text-sm text-gray-500 mb-6'>
        <Link href='/' className='hover:text-brand-green'>
          Home
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <span key={index} className='flex items-center'>
            <span className='mx-2'>/</span>
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
        <span className='mx-2'>/</span>
        <span className='text-gray-900 font-medium'>{product.name}</span>
      </nav>

      {/* Back Button */}
      <Button
        variant='ghost'
        className='mb-6 p-0 h-auto font-normal text-gray-600 hover:text-brand-green'
        onClick={() => router.back()}
      >
        <ArrowLeft className='w-4 h-4 mr-2' />
        Back to Products
      </Button>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* Product Images */}
        <div className='space-y-4'>
          <div className='relative aspect-square w-full overflow-hidden rounded-lg border'>
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className='object-cover'
              sizes='(max-width: 768px) 100vw, 50vw'
              priority
            />
          </div>

          {/* Additional Images (if available) */}
          {product.additionalImages && product.additionalImages.length > 0 && (
            <div className='grid grid-cols-4 gap-2'>
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
                    sizes='25vw'
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {product.name}
            </h1>
            <p className='text-lg text-gray-600'>
              Product Code:{" "}
              <span className='font-medium'>{product.productCode}</span>
            </p>
          </div>

          {/* Category Badges */}
          <div className='flex flex-wrap gap-2'>
            {breadcrumbs.map((crumb, index) => (
              <Badge key={index} variant='secondary' className='text-xs'>
                {crumb}
              </Badge>
            ))}
          </div>

          {/* Price Range */}
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <p className='text-3xl font-bold text-brand-green mb-1'>
                  0 - {product.priceCeiling} Pc/s
                </p>
                <p className='text-sm text-gray-500 capitalize'>
                  {product.priceType} Range
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Sold by</CardTitle>
            </CardHeader>
            <CardContent>
              {product.factories && product.factories.length > 0 ? (
                <div className='space-y-3'>
                  {product.factories.map((factory) => (
                    <div
                      key={factory.id}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                    >
                      <div>
                        <Link
                          href={`/supplier/${factory.id}`}
                          className='text-brand-green hover:underline font-medium'
                        >
                          {factory.name}
                        </Link>
                        {factory.address && (
                          <p className='text-sm text-gray-500'>
                            {factory.address}
                          </p>
                        )}
                        {factory.contactNumber && (
                          <p className='text-sm text-gray-600'>
                            📞 {factory.contactNumber}
                          </p>
                        )}
                        {factory.email && (
                          <p className='text-sm text-gray-600'>
                            ✉️ {factory.email}
                          </p>
                        )}
                        <div className='flex items-center gap-2 mt-1'>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              factory.hasBaseLine
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {factory.hasBaseLine
                              ? "Has Baseline"
                              : "No Baseline"}
                          </span>
                        </div>
                      </div>
                      <Link href={`/supplier/${factory.id}`}>
                        <Button size='sm' variant='outline'>
                          View Supplier
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-gray-500'>
                  Factory information not available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='space-y-3'>
            <Button className='w-full' size='lg'>
              <ShoppingCart className='w-4 h-4 mr-2' />
              Request a Quotation
            </Button>
            <div className='flex gap-3'>
              <Button variant='outline' className='flex-1'>
                <Heart className='w-4 h-4 mr-2' />
                Add to Wishlist
              </Button>
              <Button variant='outline' className='flex-1'>
                <Share2 className='w-4 h-4 mr-2' />
                Share Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-700 leading-relaxed'>
                {product.definition ||
                  product.description ||
                  "No description available for this product."}
              </p>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4'>
                <div className='flex justify-between py-2 border-b border-gray-100'>
                  <span className='font-medium text-gray-600'>
                    Product Code:
                  </span>
                  <span className='text-gray-900'>{product.productCode}</span>
                </div>
                <div className='flex justify-between py-2 border-b border-gray-100'>
                  <span className='font-medium text-gray-600'>
                    Sector Code:
                  </span>
                  <span className='text-gray-900'>{product.sectorCode}</span>
                </div>
                <div className='flex justify-between py-2 border-b border-gray-100'>
                  <span className='font-medium text-gray-600'>Sector:</span>
                  <span className='text-gray-900'>{product.sectorName}</span>
                </div>
                <div className='flex justify-between py-2 border-b border-gray-100'>
                  <span className='font-medium text-gray-600'>Price Type:</span>
                  <span className='text-gray-900 capitalize'>
                    {product.priceType}
                  </span>
                </div>
                <div className='flex justify-between py-2 border-b border-gray-100'>
                  <span className='font-medium text-gray-600'>
                    Price Ceiling:
                  </span>
                  <span className='text-gray-900'>
                    {product.priceCeiling} SAR
                  </span>
                </div>
                {product.localContentCertificate && (
                  <div className='flex justify-between py-2'>
                    <span className='font-medium text-gray-600'>
                      Local Content Certificate:
                    </span>
                    <span className='text-gray-900'>
                      {product.localContentCertificate}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Remove Features section since it doesn't exist in your schema */}
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Quick Contact */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button variant='outline' className='w-full'>
                Contact Supplier
              </Button>
              <Button variant='outline' className='w-full'>
                Live Chat Support
              </Button>
              <p className='text-sm text-gray-500 text-center'>
                Get instant answers to your questions
              </p>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Delivery Info</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Price Type:</span>
                <span className='font-medium capitalize'>
                  {product.priceType}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Suppliers:</span>
                <span className='font-medium'>
                  {product.factories?.length || 0} available
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Local Content:</span>
                <span className='font-medium text-brand-green'>
                  {product.localContentCertificate
                    ? "Required"
                    : "Not Required"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Related Categories */}
          {breadcrumbs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Related Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {breadcrumbs.map((crumb, index) => (
                    <Link
                      key={index}
                      href={`/category/${crumb
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className='block text-sm text-brand-green hover:underline'
                    >
                      Browse all in {crumb}
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
