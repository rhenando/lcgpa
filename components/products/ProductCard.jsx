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

  // This constant is defined but not used in the JSX.
  // You could use it to render breadcrumbs if needed.
  const breadcrumbs = [
    product.sectorName,
    product.category,
    product.subcategory,
  ].filter(Boolean);

  return (
    <Card className='flex flex-col h-full'>
      <CardHeader>
        <div className='relative aspect-square w-full overflow-hidden rounded-md'>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        </div>
      </CardHeader>
      <CardContent className='flex-grow'>
        <CardTitle className='text-lg font-semibold'>{product.name}</CardTitle>
        <p className='text-sm text-gray-500'>
          Product Code: {product.productCode}
        </p>
        <p className='text-sm font-medium text-gray-700 mt-1'>
          <span className='font-semibold'>Sold by:</span> {factoryNames}
        </p>
        {/* 1. Truncated the definition to 2 lines */}
        <p className='mt-2 text-sm text-gray-600 line-clamp-2'>
          {product.definition}
        </p>
      </CardContent>
      <CardFooter className='flex flex-col items-start gap-4 pt-4'>
        <div>
          <p className='text-xl font-bold text-brand-green'>
            0 - {product.priceCeiling} Pc/s
          </p>
          <p className='text-xs text-gray-500'>Aqustiable Range</p>
        </div>

        {/* 2. Added a container for the two buttons */}
        <div className='w-full flex flex-col gap-2'>
          <Button className='w-full'>Request a Quotation</Button>
          {/* 3. Added brand color styling to the outline button */}
          <Button
            variant='outline'
            className='w-full border-brand-green text-brand-green hover:bg-brand-green hover:text-white transition-colors'
          >
            View Product Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
