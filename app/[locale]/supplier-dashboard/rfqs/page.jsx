"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useSelector } from "react-redux";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  MessageCircle,
  Info,
  X,
  Image as LucideImage,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

// Helper to build the correct chat path for a given type
function getChatPath(chatId, type = "rfq") {
  if (!chatId) return "#";
  if (type === "rfq") return `/chat/rfq/${chatId}`;
  if (type === "product") return `/chat/product/${chatId}`;
  if (type === "cart") return `/chat/cart/${chatId}`;
  if (type === "order") return `/order-chat/${chatId}`;
  // fallback
  return `/chat/${chatId}`;
}

// Helper for multi-lang fields (handles {en,ar} or string)
function getLocalized(field, locale = "en") {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && (field.en || field.ar)) {
    return field[locale] || field.en || "";
  }
  return JSON.stringify(field);
}

const SupplierRFQs = () => {
  // i18n
  const t = useTranslations("rfq");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  const auth = getAuth();
  const { user: userData, loading: authLoading } = useSelector(
    (state) => state.auth
  );

  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [imageModal, setImageModal] = useState({
    open: false,
    imgs: [],
    idx: 0,
  });

  useEffect(() => {
    if (authLoading) return;
    const currentUser = auth.currentUser;
    const supplierId = userData?.uid || currentUser?.uid;
    if (!supplierId) {
      setLoading(false);
      return;
    }
    const fetchRFQs = async () => {
      try {
        const q = query(
          collection(db, "rfqs"),
          where("supplierId", "==", supplierId)
        );
        const snapshot = await getDocs(q);
        setRfqs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching RFQs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRFQs();
  }, [authLoading, auth.currentUser, userData]);

  // Date formatting
  const formatDate = (ts) => {
    if (!ts) return "-";
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  // Column label helper
  const L = (key) =>
    ({
      en: {
        product: "Product",
        details: "Product Details",
        category: "Category",
        subcategory: "Subcategory",
        color: "Color",
        size: "Size",
        qty: "Quantity",
        unit: "Unit",
        date: "Date",
        images: "Images",
        file: "File",
        chat: "Chat",
        info: "Details",
        leadTime: "Lead Time (days)",
        paymentTerms: "Payment Terms",
        shippingCountry: "Shipping Country",
        shippingMethod: "Shipping Method",
      },
      ar: {
        product: "المنتج",
        details: "تفاصيل المنتج",
        category: "الفئة",
        subcategory: "الفئة الفرعية",
        color: "اللون",
        size: "المقاس",
        qty: "الكمية",
        unit: "الوحدة",
        date: "التاريخ",
        images: "الصور",
        file: "ملف",
        chat: "الدردشة",
        info: "تفاصيل",
        leadTime: "مدة التسليم (يوم)",
        paymentTerms: "شروط الدفع",
        shippingCountry: "بلد الشحن",
        shippingMethod: "طريقة الشحن",
      },
    }[locale][key]);

  return (
    <div
      dir={dir}
      lang={locale}
      className={`w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <h2 className='text-2xl font-semibold mb-4'>{t("title")}</h2>
      {loading ? (
        <div className='space-y-3'>
          <Skeleton className='h-6 w-1/3' />
          <Skeleton className='h-10 rounded-md' />
          <Skeleton className='h-10 rounded-md' />
        </div>
      ) : rfqs.length === 0 ? (
        <p className='text-muted-foreground text-sm'>{t("no_suppliers")}</p>
      ) : (
        <div className='overflow-x-auto rounded-md border'>
          <table
            className={`min-w-full text-sm align-middle ${
              isRTL ? "rtl" : "ltr"
            }`}
          >
            <thead>
              <tr className='bg-muted/30'>
                <th className='p-2'>{L("product")}</th>
                <th className='p-2'>{L("category")}</th>
                <th className='p-2'>{L("subcategory")}</th>
                <th className='p-2'>{L("color")}</th>
                <th className='p-2'>{L("size")}</th>
                <th className='p-2'>{L("qty")}</th>
                <th className='p-2'>{L("unit")}</th>
                <th className='p-2'>{L("shippingCountry")}</th>
                <th className='p-2'>{L("date")}</th>
                <th className='p-2 text-center'>{L("images")}</th>
                <th className='p-2 text-center'>{L("file")}</th>
                <th className='p-2 text-center'>{L("chat")}</th>
                <th className='p-2 text-center'>{L("info")}</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq) => (
                <tr key={rfq.id} className='border-b hover:bg-muted/10'>
                  <td className='p-2 max-w-xs truncate' title={rfq.productName}>
                    {rfq.productName || "-"}
                  </td>
                  <td className='p-2'>{rfq.category || "-"}</td>
                  <td className='p-2'>{rfq.subcategory || "-"}</td>
                  <td className='p-2'>{rfq.color || "-"}</td>
                  <td className='p-2'>{rfq.size || "-"}</td>
                  <td className='p-2'>{rfq.purchaseQuantity || "-"}</td>
                  <td className='p-2'>{rfq.purchaseUnit || "-"}</td>
                  <td className='p-2'>
                    {rfq.shippingCountryLabel || rfq.shippingCountry || "-"}
                  </td>
                  <td className='p-2'>{formatDate(rfq.createdAt)}</td>
                  <td className='p-2 text-center'>
                    {Array.isArray(rfq.imageUrls) &&
                    rfq.imageUrls.length > 0 ? (
                      <button
                        title={L("images")}
                        onClick={() =>
                          setImageModal({
                            open: true,
                            imgs: rfq.imageUrls,
                            idx: 0,
                          })
                        }
                        className='inline-flex items-center gap-1 text-blue-600 hover:underline'
                      >
                        <LucideImage className='w-4 h-4 inline-block' />
                        {rfq.imageUrls.length}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className='p-2 text-center'>
                    {rfq.fileURL ? (
                      <a
                        href={rfq.fileURL}
                        target='_blank'
                        rel='noopener noreferrer'
                        title={L("file")}
                      >
                        <FileText className='w-4 h-4 text-blue-600 inline-block' />
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className='p-2 text-center'>
                    {rfq.chatId ? (
                      <Link
                        href={getChatPath(rfq.chatId, "rfq")}
                        target='_blank'
                        title={L("chat")}
                      >
                        <MessageCircle className='w-4 h-4 text-blue-600 inline-block' />
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className='p-2 text-center'>
                    <button
                      onClick={() => setSelectedRFQ(rfq)}
                      className='hover:text-blue-600'
                      title={L("info")}
                    >
                      <Info className='w-4 h-4 inline-block' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Images Modal */}
      {imageModal.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
          <div className='bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full relative'>
            <button
              className='absolute top-2 right-3 text-xl font-bold'
              onClick={() => setImageModal({ open: false, imgs: [], idx: 0 })}
              aria-label='Close'
            >
              <X />
            </button>
            <div className='flex flex-col items-center gap-4'>
              <img
                src={imageModal.imgs[imageModal.idx]}
                alt={`RFQ Image ${imageModal.idx + 1}`}
                className='max-h-80 rounded shadow'
                style={{ objectFit: "contain" }}
              />
              <div className='flex gap-2'>
                {imageModal.imgs.map((img, idx) => (
                  <img
                    key={img}
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    className={`h-12 w-12 object-cover rounded cursor-pointer border ${
                      imageModal.idx === idx
                        ? "border-blue-600"
                        : "border-gray-300"
                    }`}
                    onClick={() => setImageModal((im) => ({ ...im, idx }))}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for RFQ details */}
      {selectedRFQ && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
          <div className='bg-white max-w-md w-full rounded-lg shadow-lg p-6 relative'>
            <button
              className='absolute top-2 right-3 text-xl font-bold'
              onClick={() => setSelectedRFQ(null)}
            >
              ×
            </button>
            <h3 className='text-lg font-bold mb-2'>{L("details")}</h3>
            <div className='space-y-2 text-sm'>
              <div>
                <strong>ID:</strong>{" "}
                <Badge variant='outline'>{selectedRFQ.id}</Badge>
              </div>
              <div>
                <strong>{L("product")}:</strong> {selectedRFQ.productName}
              </div>
              <div>
                <strong>{L("details")}:</strong>{" "}
                {selectedRFQ.productDetails || "-"}
              </div>
              <div>
                <strong>{L("category")}:</strong> {selectedRFQ.category || "-"}
              </div>
              <div>
                <strong>{L("subcategory")}:</strong>{" "}
                {selectedRFQ.subcategory || "-"}
              </div>
              <div>
                <strong>{L("color")}:</strong> {selectedRFQ.color || "-"}
              </div>
              <div>
                <strong>{L("size")}:</strong> {selectedRFQ.size || "-"}
              </div>
              <div>
                <strong>{L("qty")}:</strong>{" "}
                {selectedRFQ.purchaseQuantity || "-"}{" "}
                <strong>{L("unit")}:</strong> {selectedRFQ.purchaseUnit || "-"}
              </div>
              <div>
                <strong>{L("leadTime")}:</strong> {selectedRFQ.leadTime || "-"}
              </div>
              <div>
                <strong>{L("paymentTerms")}:</strong>{" "}
                {selectedRFQ.paymentTerms || "-"}
              </div>
              <div>
                <strong>{L("shippingCountry")}:</strong>{" "}
                {selectedRFQ.shippingCountryLabel ||
                  selectedRFQ.shippingCountry ||
                  "-"}
              </div>
              <div>
                <strong>{L("shippingMethod")}:</strong>{" "}
                {selectedRFQ.shippingMethod || "-"}
              </div>
              <div>
                <strong>{L("date")}:</strong>{" "}
                {formatDate(selectedRFQ.createdAt)}
              </div>
              <div>
                <strong>Images:</strong>{" "}
                {Array.isArray(selectedRFQ.imageUrls) &&
                selectedRFQ.imageUrls.length > 0 ? (
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {selectedRFQ.imageUrls.map((img, idx) => (
                      <img
                        key={img}
                        src={img}
                        alt={`RFQ Img ${idx + 1}`}
                        className='h-12 w-12 rounded object-cover border border-gray-300 cursor-pointer'
                        onClick={() =>
                          setImageModal({
                            open: true,
                            imgs: selectedRFQ.imageUrls,
                            idx,
                          })
                        }
                      />
                    ))}
                  </div>
                ) : (
                  "N/A"
                )}
              </div>
              <div>
                <strong>{L("file")}:</strong>{" "}
                {selectedRFQ.fileURL ? (
                  <a
                    href={selectedRFQ.fileURL}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 underline'
                  >
                    {L("file")}
                  </a>
                ) : (
                  "N/A"
                )}
              </div>
              <div>
                <strong>{L("chat")}:</strong>{" "}
                {selectedRFQ.chatId ? (
                  <Link
                    href={getChatPath(selectedRFQ.chatId, "rfq")}
                    target='_blank'
                    className='text-blue-600 underline'
                  >
                    {L("chat")}
                  </Link>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierRFQs;
