"use client";
import SupplierProfile from "@/components/supplier-profile/SupplierProfile";
import { useParams } from "next/navigation";

export default function SupplierProductsPage() {
  const params = useParams();
  return <SupplierProfile supplierId={params.supplierId} />;
}
