import React from "react";
import { useTranslations } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";
import Currency from "@/components/global/CurrencySymbol";
import { Button } from "@/components/ui/button";

export default function MobileInvoice({
  supplier,
  buyer,
  items,
  totals,
  invoiceNumber,
  formattedDate,
  formattedTime,
  currentUrl,
  handleDownload,
  handlePrint,
  locale, // pass this from parent
}) {
  const t = useTranslations("invoice");
  const isRTL = locale === "ar";

  return (
    <div
      className='block md:hidden bg-white w-full max-w-md mx-auto min-h-screen p-2 text-xs'
      dir={isRTL ? "rtl" : "ltr"}
      lang={locale}
    >
      {/* Header */}
      <div className='flex flex-col items-center border-b pb-3'>
        <img src='/logo.png' alt='Logo' className='h-12 mb-2' />
        <span className='font-bold text-lg'>{t("taxInvoice")}</span>
        <div className='grid grid-cols-2 gap-2 w-full mt-2 text-xs'>
          <div>
            <span className='block text-gray-500'>{t("dateTime")}</span>
            <span>{formattedDate}</span>
          </div>
          <div>
            <span className='block text-gray-500'>
              {t("time") || t("dateTime")}
            </span>
            <span>{formattedTime}</span>
          </div>
          <div>
            <span className='block text-gray-500'>{t("invoiceNumber")}</span>
            <span>{invoiceNumber}</span>
          </div>
          <div className='flex justify-end items-center'>
            <QRCodeCanvas value={currentUrl || ""} size={40} />
          </div>
        </div>
      </div>

      {/* Supplier & Buyer Cards */}
      <div className='flex flex-col gap-3 my-4'>
        <div className='border rounded p-3 bg-gray-50'>
          <div className='font-semibold text-gray-700 mb-1'>
            {t("supplierInfo")}
          </div>
          <div>
            <span className='font-medium'>{t("name")}: </span>
            {supplier.companyName || supplier.authPersonName || "—"}
          </div>
          <div>
            <span className='font-medium'>{t("address")}: </span>
            {supplier.address || "—"}
          </div>
          <div>
            <span className='font-medium'>{t("vatNo")}: </span>
            {supplier.vatRegNumber || supplier.vatNumber || "—"}
          </div>
          <div>
            <span className='font-medium'>{t("crNo")}: </span>
            {supplier.commercialReg || supplier.crNumber || "—"}
          </div>
        </div>
        <div className='border rounded p-3 bg-gray-50'>
          <div className='font-semibold text-gray-700 mb-1'>
            {t("buyerInfo")}
          </div>
          <div>
            <span className='font-medium'>{t("name")}: </span>
            {buyer.companyName || buyer.authPersonName || buyer.email || "—"}
          </div>
          <div>
            <span className='font-medium'>{t("address")}: </span>
            {buyer.address || "—"}
          </div>
          <div>
            <span className='font-medium'>{t("vatNo")}: </span>
            {buyer.vatRegNumber || buyer.vatNumber || "—"}
          </div>
          <div>
            <span className='font-medium'>{t("crNo")}: </span>
            {buyer.commercialReg || buyer.crNumber || "—"}
          </div>
        </div>
      </div>

      {/* Product List as Cards */}
      <div className='my-3'>
        <div className='font-semibold text-gray-700 mb-2'>
          {t("productDetails")}
        </div>
        <div className='flex flex-col gap-2'>
          {items.map((i) => {
            const excl = i.quantity * i.price + (i.shippingCost || 0);
            const incl = excl + excl * 0.15;
            return (
              <div
                key={i.id}
                className='flex flex-col border rounded p-2 bg-gray-50'
              >
                <div className='font-medium'>{i.productName}</div>
                <div className='text-xs text-gray-700 flex flex-col gap-0.5'>
                  <span>
                    {t("unitPrice")}: <Currency amount={i.price} />
                  </span>
                  <span>
                    {t("qty")}: {i.quantity}
                  </span>
                  <span>
                    {t("shipping")}: <Currency amount={i.shippingCost || 0} />
                  </span>
                  <span>
                    {t("subtotal")}: <Currency amount={excl} />
                  </span>
                  <span>{t("tax")}: 15%</span>
                  <span>
                    {t("totalInclVat")}: <Currency amount={incl} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Totals */}
      <div className='border rounded p-3 bg-gray-50 my-4'>
        <div className='flex justify-between'>
          <span>{t("subtotal")}:</span>
          <span>
            <Currency amount={totals.sub} />
          </span>
        </div>
        <div className='flex justify-between'>
          <span>{t("vat")}:</span>
          <span>
            <Currency amount={totals.vat} />
          </span>
        </div>
        <div className='flex justify-between font-bold text-sm mt-1'>
          <span>{t("grandTotal")}:</span>
          <span>
            <Currency amount={totals.grand} />
          </span>
        </div>
      </div>

      {/* Terms */}
      <div className='bg-gray-100 rounded p-3 mb-3 text-xs'>
        <div className='font-semibold mb-1'>{t("terms")}</div>
        <ul className='list-disc list-inside space-y-1'>
          {t.raw("termsList").map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col gap-2 mt-4 print:hidden'>
        <Button
          variant='outline'
          size='sm'
          className='w-full'
          onClick={handleDownload}
        >
          {t("downloadPDF")}
        </Button>
        <Button size='sm' className='w-full' onClick={handlePrint}>
          {t("print")}
        </Button>
      </div>
    </div>
  );
}
