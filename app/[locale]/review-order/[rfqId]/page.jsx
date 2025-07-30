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
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";

export default function ReviewOrderPage() {
  const params = useParams();
  const rfqId = params.rfqId;

  const currentUser = useSelector((s) => s.auth.user);

  const [cartItems, setCartItems] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, vat: 0, grand: 0 });
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [buyerInfo, setBuyerInfo] = useState(null);
  const [rfq, setRfq] = useState(null);

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

  // Fetch everything based on rfqId and user
  useEffect(() => {
    if (!rfqId || !currentUser?.uid) return;

    (async () => {
      // Load RFQ info
      const rfqDoc = await getDoc(doc(db, "rfqs", rfqId));
      if (!rfqDoc.exists()) return;
      const rfqData = rfqDoc.data();
      setRfq(rfqData);

      // Get supplierId from RFQ
      const supplierId = rfqData.supplierId;

      // Load cart item(s) that match this RFQ (should be just one, but can be multiple)
      const itemsQ = query(
        collection(db, "carts", currentUser.uid, "items"),
        where("rfqId", "==", rfqId)
      );
      const snap = await getDocs(itemsQ);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCartItems(items);

      // Totals
      const subtotal = items.reduce(
        (s, i) =>
          s +
          Number(i.price) * Number(i.quantity) +
          (Number(i.shippingCost) || 0),
        0
      );
      const vat = +(subtotal * 0.15).toFixed(2);
      setTotals({ subtotal, vat, grand: subtotal + vat });

      // Buyer info
      const cartDoc = await getDoc(doc(db, "carts", currentUser.uid));
      if (cartDoc.exists()) {
        const data = cartDoc.data();
        if (data.buyerId) {
          const bSnap = await getDoc(doc(db, "users", data.buyerId));
          if (bSnap.exists()) setBuyerInfo(bSnap.data());
        }
      }

      // Supplier info
      if (supplierId) {
        const sSnap = await getDoc(doc(db, "users", supplierId));
        if (sSnap.exists()) setSupplierInfo(sSnap.data());
      }
    })();
  }, [rfqId, currentUser]);

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
        supplierId: rfq?.supplierId,
        cartItems: cartItems.map((i) => ({
          name: i.productName || i.name,
          productId: i.productId,
          productImage: i.productImage,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          deliveryLocation: i.deliveryLocation,
          unitPrice: i.price,
          shippingCost: i.shippingCost || 0,
          discount: i.discount || 0,
          vat: "0.15",
        })),
        grandTotal: totals.grand,
        email: currentUser.email,
        name: buyerInfo?.name,
        phone: buyerInfo?.phone,
        paymentMethod: method,
        rfqId,
      };
      const { data } = await axios.post("/api/checkout", payload);
      if (data.paymentUrl) window.location.href = data.paymentUrl;
      else alert(t("errors.no_url"));
    } catch {
      alert(t("errors.fetch_failed"));
    }
  };

  return (
    <main
      className={`min-h-screen w-full p-8 bg-white ${
        isRTL ? "rtl text-right" : "ltr text-left"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className='max-w-5xl mx-auto'>
        <header>
          <h1 className='text-2xl mb-2'>🧾 {t("title")}</h1>
          <p className='text-gray-500 text-sm'>{t("subtitle")}</p>
        </header>
        <div className='space-y-8 mt-6'>
          {/* HEADER ROW */}
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
                  <div>{rfqId}</div>
                </div>
              </div>
            </div>
            <QRCodeCanvas
              value={typeof window !== "undefined" ? window.location.href : ""}
              size={120}
            />
          </div>

          {/* SUPPLIER INFO */}
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
                  <td className='p-3'>
                    {supplierInfo?.name || supplierInfo?.companyName || "—"}
                  </td>
                  <td className='p-3'>{supplierInfo?.address || "—"}</td>
                  <td className='p-3'>
                    {supplierInfo?.vatNumber ||
                      supplierInfo?.vatRegNumber ||
                      "—"}
                  </td>
                  <td className='p-3'>
                    {supplierInfo?.crNumber ||
                      supplierInfo?.commercialReg ||
                      "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* BUYER INFO */}
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
                  <td className='p-3'>
                    {buyerInfo?.name || buyerInfo?.companyName || "—"}
                  </td>
                  <td className='p-3'>{buyerInfo?.address || "—"}</td>
                  <td className='p-3'>
                    {buyerInfo?.vatNumber || buyerInfo?.vatRegNumber || "—"}
                  </td>
                  <td className='p-3'>
                    {buyerInfo?.crNumber || buyerInfo?.commercialReg || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* PRODUCT DETAILS (ALL FORWARDED FIELDS) */}
          <section>
            <h3 className='text-xl font-semibold border-b pb-2 mb-2'>
              {t("product_details.title")}
            </h3>
            {cartItems.length === 0 ? (
              <div className='text-center text-red-500'>
                {t("errors.empty_cart")}
              </div>
            ) : (
              cartItems.map((i) => (
                <div
                  key={i.id}
                  className='border rounded-lg p-4 mb-5 bg-gray-50'
                >
                  <div className='flex gap-4 items-center mb-2'>
                    {i.productImage && (
                      <img
                        src={i.productImage}
                        alt={i.productName || i.name}
                        className='w-16 h-16 object-cover rounded'
                      />
                    )}
                    <div>
                      <div className='font-bold text-[#2c6449]'>
                        {i.productName || i.name}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {i.productDetails}
                      </div>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-y-1 text-sm'>
                    <div>
                      <span className='font-semibold'>
                        {t("product_details.quantity")}:
                      </span>{" "}
                      {i.quantity}
                    </div>
                    <div>
                      <span className='font-semibold'>
                        {t("size") || "Size"}:
                      </span>{" "}
                      {i.size || "—"}
                    </div>
                    <div>
                      <span className='font-semibold'>
                        {t("color") || "Color"}:
                      </span>{" "}
                      {i.color || "—"}
                    </div>
                    <div>
                      <span className='font-semibold'>
                        {t("shipping") || "Delivery"}:
                      </span>{" "}
                      {i.deliveryLocation || "—"}
                    </div>
                    <div>
                      <span className='font-semibold'>
                        {t("product_details.unit_price")}:
                      </span>{" "}
                      <Currency amount={i.price} />
                    </div>
                    <div>
                      <span className='font-semibold'>
                        {t("product_details.shipping")}:
                      </span>{" "}
                      <Currency amount={i.shippingCost || 0} />
                    </div>
                    <div>
                      <span className='font-semibold'>
                        {t("subtotal") || "Subtotal"}:
                      </span>{" "}
                      <Currency
                        amount={i.price * i.quantity + (i.shippingCost || 0)}
                      />
                    </div>
                  </div>
                  {i.imageUrls && i.imageUrls.length > 0 && (
                    <div className='flex gap-2 mt-2'>
                      {i.imageUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`attachment-${idx}`}
                          className='w-8 h-8 object-cover border rounded'
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </section>

          {/* TOTALS */}
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

        {/* PAGE FOOTER BUTTONS */}
        <footer
          className={`flex ${
            isRTL ? "flex-row-reverse" : "flex-row"
          } justify-end gap-4 mt-10`}
        >
          <Button variant='outline' onClick={handlePrint}>
            {t("actions.print")}
          </Button>
          <Button onClick={handleCheckout}>{t("actions.checkout")}</Button>
        </footer>
      </div>
    </main>
  );
}
