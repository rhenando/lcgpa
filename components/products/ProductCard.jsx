import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function ProductCard({ product }) {
  const factoryNames =
    product.factories && product.factories.length > 0
      ? product.factories.map((factory) => factory.name).join(", ")
      : "Factory info not available";

  const breadcrumbs = [
    product.sectorName,
    product.category,
    product.subcategory,
  ].filter(Boolean);

  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <div className='relative aspect-square w-full overflow-hidden rounded-md'>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className='object-cover'
          />
        </div>
      </CardHeader>
      <CardContent className='flex-grow'>
        {/* --- MODIFIED CATEGORY DISPLAY --- */}
        <div className='mb-2 space-y-1 text-sm text-gray-600'>
          {product.category && (
            <p>
              <span className='font-semibold text-gray-800'>Category:</span>{" "}
              {product.category}
            </p>
          )}
          {product.subcategory && (
            <p>
              <span className='font-semibold text-gray-800'>Subcategory:</span>{" "}
              {product.subcategory}
            </p>
          )}
        </div>
        {/* --- END OF MODIFIED PART --- */}
        <CardTitle className='text-lg font-semibold'>{product.name}</CardTitle>
        <p className='text-sm text-gray-500'>
          Product Code: {product.productCode}
        </p>
        <p className='text-sm font-medium text-gray-700 mt-1'>
          <span className='font-semibold'>Sold by:</span> {factoryNames}
        </p>
        <p className='mt-2 text-sm text-gray-600'>{product.definition}</p>
      </CardContent>
      <CardFooter className='flex flex-col items-start gap-4'>
        <div>
          <p className='text-xl font-bold text-brand-green'>
            0 - {product.priceCeiling} Pc/s
          </p>
          <p className='text-xs text-gray-500'>Aqustiable Range</p>
        </div>
        <Button className='w-full'>Request a Quotation</Button>
      </CardFooter>
    </Card>
  );
}
