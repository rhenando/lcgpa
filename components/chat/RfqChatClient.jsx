"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useSelector, useDispatch } from "react-redux";
import { db } from "@/firebase/config";
import ChatMessages from "@/components/chat/ChatMessages";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Currency from "@/components/global/CurrencySymbol";
import { addOrUpdateCartItem } from "@/store/cartSlice";
import { toast } from "sonner";
import UserProfileDialog from "@/components/userprofile/UserProfileDialog";

export default function RfqChatClient({ chatId }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items) || [];
  const t = useTranslations("rfqChat");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [chatMeta, setChatMeta] = useState(null);
  const [rfqList, setRfqList] = useState([]);
  const router = useRouter();

  const [buyerProfile, setBuyerProfile] = useState(null);
  const [supplierProfile, setSupplierProfile] = useState(null);

  // For modal profile view
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);

  useEffect(() => {
    if (!chatMeta?.supplierId) return;
    getDoc(doc(db, "users", chatMeta.supplierId)).then((snap) => {
      if (snap.exists()) setSupplierProfile(snap.data());
      else setSupplierProfile(null);
    });
  }, [chatMeta?.supplierId]);

  const [editingFields, setEditingFields] = useState({});

  // --- Load chat metadata ---
  useEffect(() => {
    if (!chatId) return;
    getDoc(doc(db, "rfqChats", chatId)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setChatMeta({
          ...data,
          createdAt: data.createdAt?.toDate?.().toISOString() || null,
        });
      }
    });
  }, [chatId]);

  // --- Subscribe to all RFQs matching buyerId & supplierId ---
  useEffect(() => {
    if (!chatMeta?.buyerId || !chatMeta?.supplierId) return;

    const q = query(
      collection(db, "rfqs"),
      where("buyerId", "==", chatMeta.buyerId),
      where("supplierId", "==", chatMeta.supplierId),
      where("chatId", "==", chatId)
    );

    const unsub = onSnapshot(q, (snap) => {
      setRfqList(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            timestamp: data.timestamp?.toDate?.().toISOString() || "",
          };
        })
      );
    });

    return () => unsub();
  }, [chatMeta, chatId]);

  // --- Fetch buyer profile for supplier display ---
  useEffect(() => {
    if (!chatMeta?.buyerId) return;
    getDoc(doc(db, "users", chatMeta.buyerId)).then((snap) => {
      if (snap.exists()) setBuyerProfile(snap.data());
      else setBuyerProfile(null);
    });
  }, [chatMeta?.buyerId]);

  // --- Editing Handlers ---
  const latestRfq = rfqList[0] || {};
  const rfqId = latestRfq.id;

  const currentPrice =
    editingFields.price !== undefined
      ? editingFields.price
      : latestRfq.price || "";

  const currentShipping =
    editingFields.shippingPrice !== undefined
      ? editingFields.shippingPrice
      : latestRfq.shippingPrice || "";

  const currentQty =
    editingFields.purchaseQuantity !== undefined
      ? editingFields.purchaseQuantity
      : latestRfq.purchaseQuantity || "";

  // Supplier changes price or shipping
  const handleSupplierFieldChange = (field) => async (e) => {
    const value = e.target.value;
    setEditingFields((prev) => ({ ...prev, [field]: value }));
    if (rfqId) {
      await updateDoc(doc(db, "rfqs", rfqId), {
        [field]: value,
      });
    }
  };

  // Buyer changes quantity
  const handleBuyerQtyChange = async (e) => {
    const value = e.target.value;
    setEditingFields((prev) => ({ ...prev, purchaseQuantity: value }));
    if (rfqId) {
      await updateDoc(doc(db, "rfqs", rfqId), {
        purchaseQuantity: value,
      });
    }
  };

  // --- Check if RFQ is already in cart ---
  const isInCart = !!cartItems.find((item) => item.rfqId === latestRfq.id);

  // --- Add to Cart Handler ---
  const handleAddToCart = async (rfq) => {
    if (!rfq) return;
    if (isInCart) {
      toast.warning(t("alreadyInCart"));
      return;
    }
    if (!currentUser) {
      toast.error(t("loginFirst"));
      return;
    }
    const productId = rfq.productId || rfq.id;
    if (!productId) {
      toast.error(t("missingProductReference"));
      return;
    }
    if (!rfq.purchaseQuantity || Number(rfq.purchaseQuantity) < 1) {
      toast.error(t("enterValidQuantity"));
      return;
    }
    if (!rfq.price || isNaN(Number(rfq.price))) {
      toast.error(t("noPriceSet"));
      return;
    }

    // All looks good, prepare item
    const cartItem = {
      productId,
      productName: rfq.productName || "-",
      productImage: Array.isArray(rfq.imageUrls) ? rfq.imageUrls[0] : "",
      quantity: Number(rfq.purchaseQuantity),
      size: rfq.size || "",
      color: rfq.color || "",
      deliveryLocation: rfq.shippingCountryLabel || rfq.shippingCountry || "",
      price: Number(rfq.price),
      shippingCost: Number(rfq.shippingPrice) || 0,
      subtotal:
        Number(rfq.price) * Number(rfq.purchaseQuantity) +
        (Number(rfq.shippingPrice) || 0),
      supplierId: rfq.supplierId || chatMeta?.supplierId || "",
      supplierName: rfq.supplierName || chatMeta?.supplierName || "",
      currency: rfq.currency || "SAR",
      rfqId: rfq.id,
    };

    dispatch(
      addOrUpdateCartItem({
        userId: currentUser.uid,
        item: cartItem,
      })
    )
      .unwrap()
      .then(() => toast.success(t("addedToCart")))
      .catch((err) => {
        console.error("Add to cart failed:", err);
        toast.error(t("failedToAddToCart"));
      });
  };

  // --- Review Order Handler (dynamic route) ---
  const handleReviewOrder = (rfq) => {
    if (!rfq) return;
    router.push(`/review-order/${rfq.id}`);
  };

  if (!chatMeta) return null;

  // --- Calculate projected total cost (editing value aware) ---
  let totalCost = null;
  if (currentPrice && currentQty) {
    totalCost =
      parseFloat(currentPrice) * parseFloat(currentQty) +
      (currentShipping ? parseFloat(currentShipping) : 0);
  }

  // --- Info display (company/party names) ---
  let displayPartyLabel = "";
  let displayName = "";
  let displayNameUserId = null;
  let displayCompany = "";
  let displayCompanyUserId = null;

  if (chatMeta && currentUser) {
    if (currentUser.uid === chatMeta.buyerId) {
      // Buyer is viewing
      displayPartyLabel = t("supplierLabel");
      displayName =
        supplierProfile?.authPersonName ||
        latestRfq.supplierName ||
        chatMeta.supplierName ||
        "—";
      displayNameUserId = chatMeta.supplierId;
      displayCompany =
        supplierProfile?.companyName ||
        latestRfq.supplierCompany ||
        chatMeta.supplierCompany ||
        "—";
      displayCompanyUserId = chatMeta.supplierId;
    } else if (currentUser.uid === chatMeta.supplierId) {
      // Supplier is viewing — always try to show buyer profile
      displayPartyLabel = t("buyerLabel");
      displayName = buyerProfile?.authPersonName || chatMeta.buyerName || "—";
      displayNameUserId = chatMeta.buyerId;
      displayCompany =
        buyerProfile?.companyName || chatMeta.buyerCompany || "—";
      displayCompanyUserId = chatMeta.buyerId;
    }
  }

  return (
    <div
      className='max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6'
      dir={dir}
      lang={locale}
    >
      {/* --- Product Details Sidebar --- */}
      <div className='md:col-span-1 bg-white border rounded-lg shadow p-6 flex flex-col justify-between'>
        {rfqList.length === 0 ? (
          <p className='text-sm text-red-500'>{t("noRfqRecords")}</p>
        ) : (
          <>
            {/* --- Company & Contact --- */}
            <div className='mb-3'>
              <h1 className='text-md font-bold text-[#2c6449] mb-1'>
                {t("rfqDetails")}
              </h1>
              <div className='mb-1 text-xs text-gray-700'>
                <div>
                  <span className='font-semibold'>{displayPartyLabel}:</span>{" "}
                  {displayName !== "—" ? (
                    <button
                      type='button'
                      className='underline text-primary hover:text-secondary transition-colors cursor-pointer bg-transparent border-0 p-0'
                      title={t("viewProfile") || "View Profile"}
                      onClick={() => {
                        setProfileUserId(displayNameUserId);
                        setProfileOpen(true);
                      }}
                    >
                      {displayName}
                    </button>
                  ) : (
                    <span className='italic text-gray-400'>—</span>
                  )}
                </div>
                <div>
                  <span className='font-semibold'>{t("company")}:</span>{" "}
                  {displayCompany !== "—" ? (
                    <button
                      type='button'
                      className='underline text-primary hover:text-secondary transition-colors cursor-pointer bg-transparent border-0 p-0'
                      title={t("viewProfile") || "View Profile"}
                      onClick={() => {
                        setProfileUserId(displayCompanyUserId);
                        setProfileOpen(true);
                      }}
                    >
                      {displayCompany}
                    </button>
                  ) : (
                    <span className='italic text-gray-400'>—</span>
                  )}
                </div>
              </div>
            </div>

            {/* --- Product Overview --- */}
            <div className='mb-3 text-xs text-gray-700'>
              <div className='grid grid-cols-2 gap-y-1 items-center'>
                <div className='font-semibold'>{t("productName")}:</div>
                <div className='text-base font-bold text-[#2c6449]'>
                  {latestRfq?.productName || (
                    <span className='italic text-gray-400'>—</span>
                  )}
                </div>
              </div>
            </div>

            <div className='mb-3 text-xs text-gray-700'>
              <div className='grid grid-cols-2 gap-y-1'>
                <div className='font-semibold'>{t("category")}:</div>
                <div>
                  {latestRfq?.category || (
                    <span className='italic text-gray-400'>—</span>
                  )}
                </div>
                <div className='font-semibold'>{t("subcategory")}:</div>
                <div>
                  {latestRfq?.subcategory || (
                    <span className='italic text-gray-400'>—</span>
                  )}
                </div>
              </div>
            </div>

            {/* --- Product Specs --- */}
            <div className='mb-3 space-y-2'>
              <div className='mb-3 text-xs text-gray-700'>
                <div className='grid grid-cols-2 gap-y-1'>
                  <div className='font-semibold'>{t("shipTo")}:</div>
                  <div>
                    {latestRfq?.shippingCountryLabel ||
                      latestRfq?.shippingCountry || (
                        <span className='italic text-gray-400'>—</span>
                      )}
                  </div>
                  <div className='font-semibold'>{t("method")}:</div>
                  <div>
                    {latestRfq?.shippingMethod ? (
                      latestRfq.shippingMethod
                    ) : (
                      <span className='italic text-gray-400'>—</span>
                    )}
                  </div>
                  <div className='font-semibold'>{t("paymentTerms")}:</div>
                  <div>
                    {latestRfq?.paymentTerms ? (
                      latestRfq.paymentTerms
                    ) : (
                      <span className='italic text-gray-400'>—</span>
                    )}
                  </div>
                  <div className='font-semibold'>{t("deliveryTime")}:</div>
                  <div>
                    {latestRfq?.leadTime ? (
                      latestRfq.leadTime
                    ) : (
                      <span className='italic text-gray-400'>—</span>
                    )}
                  </div>
                  <div className='font-semibold'>{t("productDetails")}:</div>
                  <div>
                    {latestRfq?.productDetails ? (
                      latestRfq.productDetails
                    ) : (
                      <span className='italic text-gray-400'>—</span>
                    )}
                  </div>
                </div>
              </div>

              {/* === Editable Fields Grid === */}
              <div className='mb-3 text-xs text-gray-700'>
                <div className='grid grid-cols-2 gap-y-1 items-center'>
                  <div className='font-semibold'>{t("qty")}:</div>
                  <div>
                    {currentUser?.uid === chatMeta.buyerId ? (
                      <input
                        type='number'
                        min='1'
                        className='border rounded px-2 py-1 w-24'
                        value={currentQty}
                        onChange={handleBuyerQtyChange}
                        style={{ fontSize: "14px" }}
                      />
                    ) : currentQty ? (
                      `${currentQty} ${latestRfq?.purchaseUnit || ""}`
                    ) : (
                      <span className='italic text-gray-400'>—</span>
                    )}
                  </div>
                  <div className='font-semibold'>{t("size")}:</div>
                  <div>
                    {latestRfq?.size ? (
                      latestRfq.size
                    ) : (
                      <span className='italic text-gray-400'>—</span>
                    )}
                  </div>
                  <div className='font-semibold'>{t("color")}:</div>
                  <div>
                    {latestRfq?.color ? (
                      latestRfq.color
                    ) : (
                      <span className='italic text-gray-400'>—</span>
                    )}
                  </div>
                  <div className='font-semibold'>{t("price")}:</div>
                  <div>
                    {currentUser?.uid === chatMeta.supplierId ? (
                      <input
                        type='number'
                        min='0'
                        step='any'
                        className='border rounded px-2 py-1 w-24'
                        value={currentPrice}
                        onChange={handleSupplierFieldChange("price")}
                        style={{ fontSize: "14px" }}
                      />
                    ) : currentPrice ? (
                      <Currency
                        amount={currentPrice}
                        currency={latestRfq.currency || "SAR"}
                      />
                    ) : (
                      <span className='italic text-gray-400'>
                        {t("negotiable")}
                      </span>
                    )}
                  </div>
                  <div className='font-semibold'>{t("shippingPrice")}:</div>
                  <div>
                    {currentUser?.uid === chatMeta.supplierId ? (
                      <input
                        type='number'
                        min='0'
                        step='any'
                        className='border rounded px-2 py-1 w-24'
                        value={currentShipping}
                        onChange={handleSupplierFieldChange("shippingPrice")}
                        style={{ fontSize: "14px" }}
                      />
                    ) : currentShipping ? (
                      <Currency
                        amount={currentShipping}
                        currency={latestRfq.currency || "SAR"}
                      />
                    ) : (
                      <span className='italic text-gray-400'>
                        {t("negotiable")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* --- Total Cost Projection --- */}
              <div className='my-2'>
                <div className='flex justify-between text-sm font-semibold'>
                  <span>{t("total")}:</span>
                  {totalCost !== null ? (
                    <span>
                      <Currency
                        amount={totalCost}
                        currency={latestRfq.currency || "SAR"}
                      />
                    </span>
                  ) : (
                    <span className='italic text-gray-400'>
                      {t("negotiable")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* --- Attachments --- */}
            {latestRfq.imageUrls && latestRfq.imageUrls.length > 0 && (
              <div className='mb-3'>
                <div className='font-semibold mb-1 text-sm'>
                  {t("attachments")}:
                </div>
                <div className='flex gap-2 flex-wrap'>
                  {latestRfq.imageUrls.map((url, idx) => (
                    <a
                      key={url}
                      href={url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='block border rounded w-8 h-8 overflow-hidden hover:shadow hover:ring-2 ring-primary transition'
                    >
                      <img
                        src={url}
                        alt={`${t("attachment")} ${idx + 1}`}
                        className='object-cover w-full h-full'
                        loading='lazy'
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* --- Buttons: Add to Cart & Review Order --- */}
            {currentUser?.uid === chatMeta.buyerId && (
              <div className='flex flex-col gap-2 mt-4'>
                <button
                  className='bg-[#2c6449] text-white font-semibold px-4 py-2 rounded hover:bg-[#215039] transition disabled:opacity-60 disabled:cursor-not-allowed'
                  onClick={() => handleAddToCart(latestRfq)}
                  disabled={!latestRfq || isInCart}
                  type='button'
                >
                  {isInCart ? t("alreadyInCart") : t("addToCart")}
                </button>
              </div>
            )}
            {currentUser?.uid === chatMeta.supplierId && (
              <div className='mt-4 text-xs text-gray-500 italic'>
                {t("supplierInfoMsg")}
              </div>
            )}

            {/* Profile Modal */}
            <UserProfileDialog
              userId={profileUserId}
              open={profileOpen}
              onOpenChange={setProfileOpen}
            />
          </>
        )}
      </div>

      {/* --- Chat Section --- */}
      <div className='md:col-span-2 flex flex-col'>
        <h2 className='text-lg font-semibold mb-3 text-[#2c6449]'>
          {t("chatWithSupplier")}
        </h2>
        <div className='h-[480px] pb-2 border rounded-lg overflow-hidden bg-white'>
          <ChatMessages chatId={chatId} chatMeta={chatMeta} />
        </div>
      </div>
    </div>
  );
}
