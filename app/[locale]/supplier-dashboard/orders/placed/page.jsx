"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { db } from "@/firebase/config";
import { useSelector } from "react-redux";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function SupplierPlacedOrdersPage() {
  const t = useTranslations("supplier-placed-orders");
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useSelector(
    (s) => s.auth
  );

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) {
      if (!authLoading) setLoading(false);
      return;
    }

    const fetchPlacedOrders = async () => {
      setLoading(true);
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("userId", "==", currentUser.uid));
      const snap = await getDocs(q);

      const fetchedOrders = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();

        let createdAt = t("unknownDate");
        if (data.createdAt?.seconds) {
          createdAt = new Date(data.createdAt.seconds * 1000).toLocaleString();
        } else if (data.createdAt) {
          createdAt = new Date(data.createdAt).toLocaleString();
        }

        const billNumber = data.billNumber || data.orderId || t("na");
        const sadadNumber = data.sadadNumber || t("na");
        const total = data.total ?? 0;
        const vat = data.vat ?? 0;
        const net = total - vat;
        const status = data.status || "pending-payment";

        fetchedOrders.push({
          id: docSnap.id,
          sadadNumber,
          billNumber,
          total,
          vat,
          net,
          status,
          createdAt,
          supplierId: data.supplierId,
        });
      });

      setOrders(fetchedOrders);
      setLoading(false);
    };

    fetchPlacedOrders();
  }, [currentUser, authLoading, t]);

  const goToChat = (order) => {
    const supplierId = order.supplierId;
    if (!supplierId) {
      console.error("Supplier ID not found for this order.");
      toast.error("Cannot start chat: Supplier details are missing.");
      return;
    }

    const chatId = `order_${currentUser.uid}_${supplierId}`;
    const extra = encodeURIComponent(
      JSON.stringify({
        billNumber: order.billNumber,
        total: order.total,
        status: order.status,
      })
    );
    router.push(`/order-chat/${chatId}?extraData=${extra}`);
  };

  const statusClass = (s) => {
    const lowerCaseStatus = s?.toLowerCase() || "";
    if (
      lowerCaseStatus.includes("approved") ||
      lowerCaseStatus.includes("paid")
    ) {
      return "text-green-600 font-medium";
    }
    return "text-yellow-600";
  };

  if (authLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='animate-spin h-6 w-6' />
      </div>
    );
  }

  return (
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 py-6'>
      <h2 className='text-2xl font-semibold mb-6'>{t("title")}</h2>

      {loading ? (
        <p className='text-center text-sm text-muted-foreground'>
          {t("loading")}
        </p>
      ) : orders.length === 0 ? (
        <Card className='text-center p-12'>
          <p className='text-muted-foreground'>{t("none")}</p>
        </Card>
      ) : (
        <>
          {/* Desktop - Redesigned Table */}
          <div className='hidden md:block'>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[140px]'>{t("sadad")}</TableHead>
                    <TableHead className='w-[140px]'>{t("bill")}</TableHead>
                    {/* ✨ HIDDEN ON MEDIUM SCREENS: These columns are less critical */}
                    <TableHead className='hidden lg:table-cell'>
                      {t("net")}
                    </TableHead>
                    <TableHead className='hidden lg:table-cell'>
                      {t("fee")}
                    </TableHead>
                    <TableHead>{t("total")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className='hidden lg:table-cell'>
                      {t("date")}
                    </TableHead>
                    <TableHead className='text-right'>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className='font-medium truncate'>
                        {o.sadadNumber}
                      </TableCell>
                      <TableCell className='truncate'>{o.billNumber}</TableCell>
                      {/* ✨ HIDDEN ON MEDIUM SCREENS */}
                      <TableCell className='hidden lg:table-cell'>
                        {o.net.toFixed(2)} SR
                      </TableCell>
                      <TableCell className='hidden lg:table-cell'>
                        0.00 SR
                      </TableCell>
                      <TableCell>{o.total.toFixed(2)} SR</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs rounded-sm ${statusClass(
                            o.status
                          )} bg-opacity-10 ${
                            o.status.toLowerCase().includes("approved")
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {t(`statuses.${o.status.toLowerCase()}`, o.status)}
                        </span>
                      </TableCell>
                      <TableCell className='hidden lg:table-cell'>
                        {o.createdAt}
                      </TableCell>
                      {/* ✨ ACTION BUTTONS with better spacing and alignment */}
                      <TableCell className='text-right'>
                        <div className='flex justify-end items-center gap-2'>
                          <Button asChild size='sm' variant='outline'>
                            <Link href={`/review-invoice/${o.billNumber}`}>
                              {t("reviewInvoice")}
                            </Link>
                          </Button>
                          <Button size='sm' onClick={() => goToChat(o)}>
                            {t("contactSupplier")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Mobile - Card View (No change needed here, it's already responsive) */}
          <div className='md:hidden space-y-4'>
            {orders.map((o) => (
              <Card key={o.id} className='p-4 shadow-md'>
                <div className='flex justify-between items-start mb-2'>
                  <div>
                    <h3 className='text-sm font-medium'>
                      {t("invoice")}{" "}
                      <span className='text-muted-foreground font-normal'>
                        {o.billNumber}
                      </span>
                    </h3>
                    <p className='text-xs text-muted-foreground'>
                      {o.createdAt}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${statusClass(
                      o.status
                    )} bg-opacity-10 ${
                      o.status.toLowerCase().includes("approved")
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {t(`statuses.${o.status.toLowerCase()}`, o.status)}
                  </span>
                </div>

                <div className='border-t my-3'></div>

                <div className='flex justify-between items-center text-sm mb-4'>
                  <span className='text-muted-foreground'>{t("total")}</span>
                  <span className='font-semibold'>{o.total.toFixed(2)} SR</span>
                </div>

                <div className='flex flex-col sm:flex-row gap-2'>
                  <Button
                    asChild
                    size='sm'
                    variant='outline'
                    className='w-full'
                  >
                    <Link href={`/review-invoice/${o.billNumber}`}>
                      {t("reviewInvoice")}
                    </Link>
                  </Button>
                  <Button
                    size='sm'
                    onClick={() => goToChat(o)}
                    className='w-full'
                  >
                    {t("contactSupplier")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
