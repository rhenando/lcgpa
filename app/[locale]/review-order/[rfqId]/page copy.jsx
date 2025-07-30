"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  doc,
  getDoc,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import Currency from "@/components/global/CurrencySymbol";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";

export default function ReviewOrderModal({ isOpen, onClose, supplierId }) {
  const currentUser = useSelector((s) => s.auth.user);
  const [cartItems, setCartItems] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, vat: 0, grand: 0 });
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [buyerInfo, setBuyerInfo] = useState(null);

  // next-intl
  const t = useTranslations("review_order");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const getCurrentDateTime = () => {
    const now = new Date();
    return `${now
      .toLocaleDateString(locale === "ar" ? "ar-EG" : "en-CA")
      .replace(/-/g, "/")} ${now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  useEffect(() => {
    if (!isOpen || !currentUser?.uid || !supplierId) return;
    (async () => {
      // 1) Load line items
      const itemsQ = query(
        collection(db, "carts", currentUser.uid, "items"),
        where("supplierId", "==", supplierId)
      );
      const snap = await getDocs(itemsQ);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCartItems(items);

      // 2) Totals
      const subtotal = items.reduce(
        (s, i) => s + i.price * i.quantity + (i.shippingCost || 0),
        0
      );
      const vat = +(subtotal * 0.15).toFixed(2);
      setTotals({ subtotal, vat, grand: subtotal + vat });

      // 3) Buyer info
      const cartDoc = await getDoc(doc(db, "carts", currentUser.uid));
      if (cartDoc.exists()) {
        const data = cartDoc.data();
        if (data.buyerId) {
          const bSnap = await getDoc(doc(db, "users", data.buyerId));
          if (bSnap.exists()) setBuyerInfo(bSnap.data());
        }
      }

      // 4) Supplier info
      const sSnap = await getDoc(doc(db, "users", supplierId));
      if (sSnap.exists()) setSupplierInfo(sSnap.data());
    })();
  }, [isOpen, currentUser, supplierId]);

  const handlePrint = () => window.print();

  const handleCheckout = async () => {
    if (!currentUser || cartItems.length === 0) {
      alert(t("errors.empty_cart"));
      return;
    }
    const method = prompt(t("select_payment"));
    if (!method) return;
    try {
      const payload = {
        userId: currentUser.uid,
        supplierId,
        cartItems: cartItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          discount: i.discount || 0,
          vat: "0.15",
        })),
        grandTotal: totals.grand,
        email: currentUser.email,
        name: buyerInfo?.name,
        phone: buyerInfo?.phone,
        paymentMethod: method,
      };
      const { data } = await axios.post("/api/checkout", payload);
      if (data.paymentUrl) window.location.href = data.paymentUrl;
      else alert(t("errors.no_url"));
    } catch {
      alert(t("errors.fetch_failed"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className='fixed inset-0 bg-black/50 z-40' />
        <DialogContent
          className={`
            fixed inset-0 z-50 w-screen h-screen
            bg-white p-8 overflow-y-auto
            ${isRTL ? "rtl text-right" : "ltr text-left"}
          `}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <DialogHeader>
            <DialogTitle className='text-2xl'>🧾 {t("title")}</DialogTitle>
            <DialogDescription className='text-sm text-gray-500'>
              {t("subtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-8 mt-6'>
            {/* Header row */}
            <div className='flex flex-col md:flex-row justify-between items-center gap-5'>
              <img src='/logo.png' alt='Logo' className='h-12' />
              <div className='text-center flex-1'>
                <h5 className='font-semibold'>{t("invoice.tax_invoice")}</h5>
                <div className='flex flex-col md:flex-row gap-4 mt-2 justify-center'>
                  <div className='bg-gray-100 p-4 rounded'>
                    <div className='font-medium'>{t("invoice.date_time")}</div>
                    <div>{getCurrentDateTime()}</div>
                  </div>
                  <div className='bg-gray-100 p-4 rounded'>
                    <div className='font-medium'>
                      {t("invoice.serial_number")}
                    </div>
                    <div>{Date.now()}</div>
                  </div>
                </div>
              </div>
              <QRCodeCanvas
                value={
                  typeof window !== "undefined" ? window.location.href : ""
                }
                size={120}
              />
            </div>

            {/* Supplier Info */}
            <section>
              <h3 className='text-xl font-semibold border-b pb-2 mb-2'>
                {t("supplier_info.title")}
              </h3>
              <table
                className={`w-full table-fixed text-sm mt-4 ${
                  isRTL ? "text-right" : ""
                }`}
              >
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='p-3'>{t("supplier_info.name")}</th>
                    <th className='p-3'>{t("supplier_info.address")}</th>
                    <th className='p-3'>{t("supplier_info.vat_number")}</th>
                    <th className='p-3'>{t("supplier_info.cr_number")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='bg-white'>
                    <td className='p-3'>{supplierInfo?.name || "—"}</td>
                    <td className='p-3'>{supplierInfo?.address || "—"}</td>
                    <td className='p-3'>{supplierInfo?.vatNumber || "—"}</td>
                    <td className='p-3'>{supplierInfo?.crNumber || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Buyer Info */}
            <section>
              <h3 className='text-xl font-semibold border-b pb-2 mb-2'>
                {t("buyer_info.title")}
              </h3>
              <table
                className={`w-full table-fixed text-sm mt-4 ${
                  isRTL ? "text-right" : ""
                }`}
              >
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='p-3'>{t("buyer_info.name")}</th>
                    <th className='p-3'>{t("buyer_info.address")}</th>
                    <th className='p-3'>{t("buyer_info.vat_number")}</th>
                    <th className='p-3'>{t("buyer_info.cr_number")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='bg-white'>
                    <td className='p-3'>{buyerInfo?.name || "—"}</td>
                    <td className='p-3'>{buyerInfo?.address || "—"}</td>
                    <td className='p-3'>{buyerInfo?.vatNumber || "—"}</td>
                    <td className='p-3'>{buyerInfo?.crNumber || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Product Details */}
            <section>
              <h3 className='text-xl font-semibold border-b pb-2 mb-2'>
                {t("product_details.title")}
              </h3>
              <table
                className={`w-full table-fixed text-sm mt-4 ${
                  isRTL ? "text-right" : ""
                }`}
              >
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='p-3'>{t("product_details.name")}</th>
                    <th className='p-3'>{t("product_details.unit_price")}</th>
                    <th className='p-3'>{t("product_details.quantity")}</th>
                    <th className='p-3'>{t("product_details.shipping")}</th>
                    <th className='p-3'>
                      {t("product_details.total_excl_vat")}
                    </th>
                    <th className='p-3'>{t("product_details.tax_rate")}</th>
                    <th className='p-3'>
                      {t("product_details.total_incl_vat")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((i) => {
                    const excl = i.quantity * i.price + (i.shippingCost || 0);
                    const taxAmt = excl * 0.15;
                    const incl = excl + taxAmt;
                    return (
                      <tr key={i.id} className='bg-white'>
                        <td className='p-3'>{i.name}</td>
                        <td className='p-3'>
                          <Currency amount={i.price} />
                        </td>
                        <td className='p-3'>{i.quantity}</td>
                        <td className='p-3'>
                          <Currency amount={i.shippingCost || 0} />
                        </td>
                        <td className='p-3'>
                          <Currency amount={excl} />
                        </td>
                        <td className='p-3'>15%</td>
                        <td className='p-3'>
                          <Currency amount={incl} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            {/* Totals */}
            <div
              className={`flex flex-col md:flex-row ${
                isRTL ? "md:flex-row-reverse" : ""
              } justify-end gap-6 mt-8 text-lg font-medium`}
            >
              <div>
                {t("totals.total")}: <Currency amount={totals.subtotal} />
              </div>
              <div>
                {t("totals.vat")}: <Currency amount={totals.vat} />
              </div>
              <div className='text-2xl font-semibold'>
                {t("totals.grand_total")}: <Currency amount={totals.grand} />
              </div>
            </div>
          </div>

          <DialogFooter
            className={`flex ${
              isRTL ? "flex-row-reverse" : "flex-row"
            } justify-end gap-4 mt-10`}
          >
            <Button variant='outline' onClick={handlePrint}>
              {t("actions.print")}
            </Button>
            <Button onClick={handleCheckout}>{t("actions.checkout")}</Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
