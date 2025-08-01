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
        <CardTitle className='text-lg font-semibold'>{product.name}</CardTitle>
        <p className='text-sm text-gray-500'>
          Product Code: {product.productCode}
        </p>
        <p className='text-sm font-medium text-gray-700 mt-1'>
          Sold by: {product.factoryName}
        </p>
        <p className='mt-2 text-sm text-gray-600'>{product.definition}</p>
      </CardContent>
      <CardFooter className='flex justify-between items-center'>
        <div>
          <p className='text-xl font-bold text-brand-green'>
            SAR 0 - {product.priceCeiling}
          </p>
          <p className='text-xs text-gray-500'>Auctionable Range</p>
        </div>
        <Button>Place Bid</Button>
      </CardFooter>
    </Card>
  );
}
