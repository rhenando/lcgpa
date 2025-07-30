"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Mail, Phone, Copy } from "lucide-react";

export default function UserProfileDialog({ userId, open, onOpenChange }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("user-profile");
  const locale = useLocale();

  useEffect(() => {
    if (!userId || !open) return;
    setLoading(true);
    const fetchUser = async () => {
      const userSnap = await getDoc(doc(db, "users", userId));
      setUser(userSnap.exists() ? userSnap.data() : null);
      setLoading(false);
    };
    fetchUser();
  }, [userId, open]);

  // For copy feedback
  const [copied, setCopied] = useState("");
  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1200);
  };

  const N_A = t("not_available") || "N/A";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-full max-w-lg sm:rounded-lg px-2 sm:px-6 pb-0'>
        <DialogHeader className='bg-gradient-to-r from-[#2c6449]/80 to-[#71b391]/80 rounded-t-lg px-2 py-2 sm:px-6 sm:py-3 shadow-md'>
          <DialogTitle asChild>
            <div className='text-lg sm:text-xl font-bold text-white mb-1 flex flex-wrap items-center gap-1 sm:gap-2'>
              {user
                ? user.companyName ||
                  user.authPersonName ||
                  user.name ||
                  user.email
                : t("dialog_title") || "User Profile"}
              {user && user.role === "supplier" && (
                <Badge
                  className={`ml-2 ${
                    user.verified
                      ? "bg-primary text-white"
                      : "bg-gray-300 text-gray-600"
                  } flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium`}
                >
                  {user.verified ? (
                    <>
                      <CheckCircle size={12} className='inline mb-0.5' />
                      {t("verified")}
                    </>
                  ) : (
                    <>
                      <XCircle size={12} className='inline mb-0.5' />
                      {t("unverified")}
                    </>
                  )}
                </Badge>
              )}
            </div>
          </DialogTitle>
          <span className='text-white/80 font-medium block text-xs sm:text-sm'>
            {user
              ? user.role === "supplier"
                ? t("supplier")
                : user.role === "buyer"
                ? t("buyer")
                : ""
              : ""}
          </span>
        </DialogHeader>
        <div className='px-1 sm:px-6 pt-3 pb-6'>
          {loading ? (
            <p className='text-center py-6 text-sm sm:text-base'>
              {t("loading")}
            </p>
          ) : !user ? (
            <p className='text-center py-6 text-red-500 text-sm sm:text-base'>
              {t("no_profile_found")}
            </p>
          ) : (
            <>
              <div className='border-b mb-2' />
              {/* Supplier Details */}
              {user.role === "supplier" && (
                <div className='space-y-1'>
                  <ProfileRow
                    label={t("companyName")}
                    value={user.companyName}
                    N_A={N_A}
                  />
                  <ProfileRow
                    label={t("address")}
                    value={user.address}
                    N_A={N_A}
                  />
                  <ProfileRow
                    label={t("crNumber")}
                    value={user.commercialReg || user.crNumber}
                    N_A={N_A}
                  />
                  <ProfileRow
                    label={t("vatNumber")}
                    value={user.vatRegNumber || user.vatNumber}
                    N_A={N_A}
                  />
                  <ProfileRow
                    label={t("companyEmail")}
                    value={user.companyEmail}
                    N_A={N_A}
                    icon={
                      <Mail size={14} className='inline mr-1 text-gray-500' />
                    }
                    onCopy={() => handleCopy(user.companyEmail, "email")}
                    copied={copied === "email"}
                  />
                  <ProfileRow
                    label={t("companyPhone")}
                    value={user.companyPhone || user.phone}
                    N_A={N_A}
                    icon={
                      <Phone size={14} className='inline mr-1 text-gray-500' />
                    }
                    onCopy={() =>
                      handleCopy(user.companyPhone || user.phone, "phone")
                    }
                    copied={copied === "phone"}
                  />
                </div>
              )}
              {/* Buyer Details */}
              {user.role === "buyer" && (
                <div className='space-y-1'>
                  <ProfileRow label={t("name")} value={user.name} N_A={N_A} />
                  <ProfileRow
                    label={t("email")}
                    value={user.email}
                    N_A={N_A}
                    icon={
                      <Mail size={14} className='inline mr-1 text-gray-500' />
                    }
                    onCopy={() => handleCopy(user.email, "email")}
                    copied={copied === "email"}
                  />
                  <ProfileRow
                    label={t("address")}
                    value={user.address}
                    N_A={N_A}
                  />
                  <ProfileRow
                    label={t("phone")}
                    value={user.phone}
                    N_A={N_A}
                    icon={
                      <Phone size={14} className='inline mr-1 text-gray-500' />
                    }
                    onCopy={() => handleCopy(user.phone, "phone")}
                    copied={copied === "phone"}
                  />
                  <ProfileRow
                    label={t("crNumber")}
                    value={user.crNumber}
                    N_A={N_A}
                  />
                  <ProfileRow
                    label={t("vatNumber")}
                    value={user.vatNumber}
                    N_A={N_A}
                  />
                </div>
              )}
              {/* Fallback if unknown role */}
              {user.role !== "supplier" && user.role !== "buyer" && (
                <div>
                  <p className='text-gray-400 italic text-center'>
                    {t("no_profile_data_available")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compact and responsive ProfileRow
function ProfileRow({ label, value, icon, onCopy, copied, N_A = "N/A" }) {
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "");
  return (
    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-2 group py-0.5'>
      <span className='w-full sm:w-32 font-medium text-xs text-gray-700 mb-1 sm:mb-0'>
        {label}:
      </span>
      <span className='flex-1 truncate text-xs text-gray-900 mt-1 sm:mt-0'>
        {icon}
        {isEmpty ? <span className='italic text-gray-400'>{N_A}</span> : value}
      </span>
      {onCopy && !isEmpty && (
        <Button
          type='button'
          size='icon'
          variant='ghost'
          onClick={onCopy}
          className='ml-0 sm:ml-1 mt-1 sm:mt-0'
          tabIndex={-1}
        >
          {copied ? (
            <span className='text-green-600 text-xs px-1'>✓</span>
          ) : (
            <Copy
              size={14}
              className='text-gray-400 group-hover:text-gray-900'
            />
          )}
        </Button>
      )}
    </div>
  );
}
