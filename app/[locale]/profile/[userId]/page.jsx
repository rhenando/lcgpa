"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useTranslations, useLocale } from "next-intl";

export default function ProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("user-profile");
  const locale = useLocale();

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      const userSnap = await getDoc(doc(db, "users", userId));
      setUser(userSnap.exists() ? userSnap.data() : null);
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  if (loading) return <p className='text-center p-8'>{t("loading")}</p>;
  if (!user)
    return (
      <p className='text-center p-8 text-red-500'>{t("no_profile_found")}</p>
    );

  // Role detection
  const isSupplier = user.role === "supplier";
  const isBuyer = user.role === "buyer";

  return (
    <div className='max-w-xl mx-auto p-6 bg-white rounded-xl shadow'>
      <div className='flex items-center gap-4 mb-6'>
        {user.logoUrl ? (
          <img
            src={user.logoUrl}
            alt='Logo'
            className='w-16 h-16 rounded-full border'
          />
        ) : (
          <div className='w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl'>
            {user.authPersonName?.[0] || user.name?.[0] || "?"}
          </div>
        )}
        <div>
          <h2 className='text-2xl font-bold'>
            {user.companyName || user.authPersonName || user.name || user.email}
          </h2>
          <span className='text-sm text-gray-500 capitalize'>
            {isSupplier
              ? t("designation") + ": " + (user.designation || t("supplier"))
              : t("buyer")}
          </span>
        </div>
      </div>

      {/* Supplier Details */}
      {isSupplier && (
        <div>
          <div className='mb-2'>
            <span className='font-medium'>{t("companyName")}:</span>{" "}
            {user.companyName}
          </div>
          <div className='mb-2'>
            <span className='font-medium'>{t("address")}:</span> {user.address}
          </div>
          <div className='mb-2'>
            <span className='font-medium'>{t("crNumber")}:</span>{" "}
            {user.commercialReg || user.crNumber}
          </div>
          <div className='mb-2'>
            <span className='font-medium'>{t("vatNumber")}:</span>{" "}
            {user.vatRegNumber || user.vatNumber}
          </div>
          <div className='mb-2'>
            <span className='font-medium'>{t("companyEmail")}:</span>{" "}
            {user.companyEmail}
          </div>
          <div className='mb-2'>
            <span className='font-medium'>{t("companyPhone")}:</span>{" "}
            {user.companyPhone || user.phone}
          </div>
        </div>
      )}

      {/* Buyer Details */}
      {isBuyer && (
        <div>
          <div className='mb-2'>
            <span className='font-medium'>{t("name")}:</span> {user.name}
          </div>
          <div className='mb-2'>
            <span className='font-medium'>{t("email")}:</span> {user.email}
          </div>
          <div className='mb-2'>
            <span className='font-medium'>{t("address")}:</span> {user.address}
          </div>
          <div className='mb-2'>
            <span className='font-medium'>{t("phone")}:</span> {user.phone}
          </div>
          <div className='mb-2'>
            <span className='font-medium'>{t("crNumber")}:</span>{" "}
            {user.crNumber}
          </div>
          <div className='mb-2'>
            <span className='font-medium'>{t("vatNumber")}:</span>{" "}
            {user.vatNumber}
          </div>
        </div>
      )}

      {/* Fallback if unknown role */}
      {!isSupplier && !isBuyer && (
        <div>
          <p className='text-gray-400 italic'>
            {t("no_profile_data_available")}
          </p>
        </div>
      )}
    </div>
  );
}
