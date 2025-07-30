"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
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
import Currency from "@/components/global/CurrencySymbol";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import MobileInvoice from "@/components/invoice/MobileInvoice";

// Wait for all images in a node to load
function waitForImagesToLoad(node) {
  const images = node.querySelectorAll("img");
  const promises = [];
  images.forEach((img) => {
    if (!img.complete) {
      promises.push(
        new Promise((resolve) => {
          img.onload = img.onerror = resolve;
        })
      );
    }
  });
  return Promise.all(promises);
}

export default function PrintInvoicePage() {
  // --- next-intl hooks ---
  const t = useTranslations("invoice");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const { supplierId } = useParams();
  const currentUser = useSelector((s) => s.auth.user);
  const uid = currentUser?.uid;
  const containerRef = useRef();

  const [supplier, setSupplier] = useState({});
  const [buyer, setBuyer] = useState(null);
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({
    sub: 0,
    shipping: 0,
    vat: 0,
    grand: 0,
  });

  const [currentUrl, setCurrentUrl] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(null);
  const [formattedDate, setFormattedDate] = useState("");
  const [formattedTime, setFormattedTime] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
      setInvoiceNumber(Date.now());
      const now = new Date();
      setFormattedDate(
        now
          .toLocaleDateString(locale === "ar" ? "ar-EG" : "en-CA")
          .replace(/-/g, "/")
      );
      setFormattedTime(
        now.toLocaleTimeString(locale === "ar" ? "ar-EG" : undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  }, [locale]);

  // Fetch supplier and cart items
  useEffect(() => {
    if (!uid || !supplierId) return;
    (async () => {
      const itemsQ = query(
        collection(db, "carts", uid, "items"),
        where("supplierId", "==", supplierId)
      );
      const snap = await getDocs(itemsQ);
      const loaded = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        price: Number(d.data().price),
        quantity: Number(d.data().quantity),
        shippingCost: Number(d.data().shippingCost || 0),
      }));
      setItems(loaded);

      const sub = loaded.reduce((a, i) => a + i.price * i.quantity, 0);
      const shipping = loaded.reduce((a, i) => a + i.shippingCost, 0);
      const vat = +((sub + shipping) * 0.15).toFixed(2);
      const grand = +(sub + shipping + vat).toFixed(2);
      setTotals({
        sub: +sub.toFixed(2),
        shipping: +shipping.toFixed(2),
        vat,
        grand,
      });

      // Fetch supplier
      const sSnap = await getDoc(doc(db, "users", supplierId));
      if (sSnap.exists()) setSupplier(sSnap.data());
    })();
  }, [uid, supplierId]);

  // Fetch buyer info directly from Firestore, regardless of Redux
  useEffect(() => {
    if (!currentUser?.uid) return;
    getDoc(doc(db, "users", currentUser.uid)).then((snap) => {
      if (snap.exists()) setBuyer(snap.data());
      else setBuyer(null);
    });
  }, [currentUser]);

  // Show loading until buyer, time, invoice number are ready
  if (!buyer || !invoiceNumber || !formattedDate || !formattedTime) {
    return (
      <div
        style={{
          width: "70vw",
          margin: "0 auto",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#aaa" }}>{t("loading")}</span>
      </div>
    );
  }

  // Print
  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  // PDF Download: Remove all stylesheets during export and fix clone styling
  const handleDownload = async () => {
    if (!containerRef.current) return;
    setIsExporting(true);

    const clone = containerRef.current.cloneNode(true);

    // Fix the clone size & avoid any page flicker/enlarge
    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;
    clone.style.position = "fixed";
    clone.style.top = "-9999px";
    clone.style.left = "-9999px";
    clone.style.width = width + "px";
    clone.style.height = height + "px";
    clone.style.overflow = "hidden";
    clone.style.display = "block";
    clone.style.zIndex = 9999;
    clone.style.pointerEvents = "none";
    clone.style.backgroundColor = "#fff";

    // Remove all stylesheets from <head>
    const head = document.head;
    const styleNodes = Array.from(
      head.querySelectorAll("style,link[rel=stylesheet]")
    );
    styleNodes.forEach((node) => head.removeChild(node));

    document.body.appendChild(clone);
    await waitForImagesToLoad(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(
        pdfWidth / canvas.width,
        pdfHeight / canvas.height
      );
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const x = (pdfWidth - imgWidth) / 2;
      const y = 0;
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`invoice_${supplierId}_${invoiceNumber}.pdf`);
    } catch (err) {
      alert("Download failed: " + (err.message || err));
      console.error("Download failed:", err);
    } finally {
      document.body.removeChild(clone);
      // Restore all stylesheets
      styleNodes.forEach((node) => head.appendChild(node));
      setIsExporting(false);
    }
  };

  const zebra = { background: "#fafbfc" };

  return (
    <>
      {/* Desktop Version */}
      <div className='hidden md:block'>
        {/* Invoice Content */}
        <div
          ref={containerRef}
          dir={isRTL ? "rtl" : "ltr"}
          lang={locale}
          style={{
            width: "900px",
            margin: "40px auto",
            minHeight: "100vh",
            padding: "32px",
            background: "#fff",
            color: "#232323",
            fontFamily: "Montserrat, Arial, sans-serif",
            fontSize: "15px",
            borderRadius: "14px",
            boxShadow: "0 8px 32px rgba(44,100,73,0.15)",
            border: "1px solid #e0e0e0",
            position: "relative",
          }}
        >
          {/* Header */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 40,
              borderBottom: "2px solid #eee",
              paddingBottom: 18,
            }}
          >
            <img src='/logo.png' alt='Logo' style={{ height: 84 }} />
            <div style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 32,
                  letterSpacing: 2,
                  color: "#2c6449",
                }}
              >
                {t("taxInvoice")}
              </div>
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                  fontSize: 15,
                }}
              >
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    padding: "8px 16px",
                    minWidth: 110,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>
                    {t("dateTime")}
                  </div>
                  <div>
                    {formattedDate} {formattedTime}
                  </div>
                </div>
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    padding: "8px 16px",
                    minWidth: 110,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>
                    {t("invoiceNumber")}
                  </div>
                  <div>{invoiceNumber}</div>
                </div>
              </div>
            </div>
            <div
              style={{
                padding: 10,
                border: "1.5px solid #e0e0e0",
                borderRadius: 8,
                background: "#fafbfc",
              }}
            >
              <QRCodeCanvas value={currentUrl || ""} size={68} />
            </div>
          </header>

          {/* Supplier Info */}
          <section style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: "#2c6449",
                marginBottom: 6,
                letterSpacing: 1,
              }}
            >
              {t("supplierInfo")}
            </h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 15,
                marginTop: 8,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 12px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {t("name")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 12px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {t("address")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 12px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {t("vatNo")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 12px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {t("crNo")}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "7px 12px" }}
                  >
                    {supplier.companyName || supplier.authPersonName || "—"}
                  </td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "7px 12px" }}
                  >
                    {supplier.address || "—"}
                  </td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "7px 12px" }}
                  >
                    {supplier.vatRegNumber || supplier.vatNumber || "—"}
                  </td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "7px 12px" }}
                  >
                    {supplier.commercialReg || supplier.crNumber || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Buyer Info */}
          <section style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: "#2c6449",
                marginBottom: 6,
                letterSpacing: 1,
              }}
            >
              {t("buyerInfo")}
            </h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 15,
                marginTop: 8,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 12px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {t("name")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 12px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {t("address")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 12px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {t("vatNo")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 12px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {t("crNo")}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "7px 12px" }}
                  >
                    {buyer.companyName ||
                      buyer.authPersonName ||
                      buyer.email ||
                      "—"}
                  </td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "7px 12px" }}
                  >
                    {buyer.address || "—"}
                  </td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "7px 12px" }}
                  >
                    {buyer.vatRegNumber || buyer.vatNumber || "—"}
                  </td>
                  <td
                    style={{ border: "1px solid #e5e7eb", padding: "7px 12px" }}
                  >
                    {buyer.commercialReg || buyer.crNumber || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Product Details */}
          <section style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: "#2c6449",
                marginBottom: 6,
                letterSpacing: 1,
              }}
            >
              {t("productDetails")}
            </h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 15,
                marginTop: 8,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 10px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 700,
                    }}
                  >
                    {t("name")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 10px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 700,
                    }}
                  >
                    {t("unitPrice")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 10px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 700,
                    }}
                  >
                    {t("qty")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 10px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 700,
                    }}
                  >
                    {t("shipping")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 10px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 700,
                    }}
                  >
                    {t("subtotal")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 10px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 700,
                    }}
                  >
                    {t("tax")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "7px 10px",
                      background: "#f3f4f6",
                      textAlign: "left",
                      fontWeight: 700,
                    }}
                  >
                    {t("totalInclVat")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((i, idx) => {
                  const subtotal = +(i.price * i.quantity).toFixed(2);
                  const shipping = +i.shippingCost.toFixed(2);
                  const vat = +((subtotal + shipping) * 0.15).toFixed(2);
                  const totalIncl = +(subtotal + shipping + vat).toFixed(2);
                  return (
                    <tr key={i.id} style={idx % 2 === 1 ? zebra : undefined}>
                      <td
                        style={{
                          border: "1px solid #e5e7eb",
                          padding: "7px 10px",
                        }}
                      >
                        {i.productName}
                      </td>
                      <td
                        style={{
                          border: "1px solid #e5e7eb",
                          padding: "7px 10px",
                        }}
                      >
                        <Currency amount={i.price.toFixed(2)} />
                      </td>
                      <td
                        style={{
                          border: "1px solid #e5e7eb",
                          padding: "7px 10px",
                        }}
                      >
                        {i.quantity}
                      </td>
                      <td
                        style={{
                          border: "1px solid #e5e7eb",
                          padding: "7px 10px",
                        }}
                      >
                        <Currency amount={shipping} />
                      </td>
                      <td
                        style={{
                          border: "1px solid #e5e7eb",
                          padding: "7px 10px",
                        }}
                      >
                        <Currency amount={subtotal} />
                      </td>
                      <td
                        style={{
                          border: "1px solid #e5e7eb",
                          padding: "7px 10px",
                        }}
                      >
                        15%
                      </td>
                      <td
                        style={{
                          border: "1px solid #e5e7eb",
                          padding: "7px 10px",
                        }}
                      >
                        <Currency amount={totalIncl} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Totals Footer */}
          <footer
            style={{
              textAlign: "right",
              fontSize: 16,
              background: "#fafbfc",
              borderRadius: 6,
              padding: "12px 18px",
              marginBottom: 24,
              marginTop: 0,
              boxShadow: "0 2px 8px rgba(44,100,73,0.03)",
              border: "1px solid #e0e0e0",
            }}
          >
            <div>
              {t("subtotal")}:{" "}
              <span style={{ fontWeight: 700 }}>
                <Currency amount={totals.sub.toFixed(2)} />
              </span>
            </div>
            <div>
              {t("shipping")}:{" "}
              <span style={{ fontWeight: 700 }}>
                <Currency amount={totals.shipping.toFixed(2)} />
              </span>
            </div>
            <div>
              {t("vat")}:{" "}
              <span style={{ fontWeight: 700 }}>
                <Currency amount={totals.vat.toFixed(2)} />
              </span>
            </div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 19,
                color: "#2c6449",
                marginTop: 7,
                borderTop: "1px solid #e0e0e0",
                paddingTop: 7,
              }}
            >
              {t("grandTotal")}: <Currency amount={totals.grand.toFixed(2)} />
            </div>
          </footer>

          {/* Terms & Conditions */}
          <section
            style={{
              marginTop: 18,
              fontSize: 15,
              lineHeight: "1.55",
              marginBottom: 30,
            }}
          >
            <h3
              style={{
                fontWeight: 700,
                color: "#2c6449",
                marginBottom: 4,
                fontSize: 17,
              }}
            >
              {t("terms")}
            </h3>
            <ul style={{ listStyleType: "disc", paddingLeft: 24 }}>
              {t.raw("termsList").map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* Buttons: perfectly aligned under invoice */}
        <div
          style={{
            width: "900px",
            margin: "0 auto",
            marginTop: "14px",
            marginBottom: "14px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "16px",
          }}
        >
          <Button variant='outline' size='sm' onClick={handleDownload}>
            {t("downloadPDF")}
          </Button>
          <Button size='sm' onClick={handlePrint}>
            {t("print")}
          </Button>
        </div>
      </div>

      {/* Mobile Version */}
      <div className='block md:hidden'>
        <MobileInvoice
          supplier={supplier}
          buyer={buyer}
          items={items}
          totals={totals}
          invoiceNumber={invoiceNumber}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
          currentUrl={currentUrl}
          handleDownload={handleDownload}
          handlePrint={handlePrint}
          locale={locale}
        />
      </div>

      {/* Loading Overlay while exporting */}
      {isExporting && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.85)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              border: "6px solid #f3f3f3",
              borderTop: "6px solid #2c6449",
              borderRadius: "50%",
              width: 48,
              height: 48,
              animation: "spin 1s linear infinite",
            }}
          />
          <span
            style={{
              marginLeft: 24,
              fontSize: 18,
              color: "#2c6449",
              fontWeight: 700,
            }}
          >
            {t("generatingPDF") || "Generating PDF..."}
          </span>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg);}
              100% { transform: rotate(360deg);}
            }
          `}</style>
        </div>
      )}
    </>
  );
}
