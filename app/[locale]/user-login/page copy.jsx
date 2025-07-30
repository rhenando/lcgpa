"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Phone } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSessionUser } from "@/store/authSlice";

export default function AuthPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const t = useTranslations("login");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { user, loading: authLoading } = useSelector((s) => s.auth);

  const [phoneError, setPhoneError] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [countryCode, setCountryCode] = useState("+966");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("phone");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  useEffect(() => {
    setShowSignupPrompt(false);
  }, [countryCode, phone]);

  if (!mounted || authLoading) {
    return null;
  }

  const fullPhoneNumber = `${countryCode}${phone}`;

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      { size: "invisible", callback: () => {} }
    );
  };

  const handleSendOtp = async () => {
    if (!termsAccepted) {
      toast.error(t("errors.mustAcceptTerms"));
      return;
    }
    if (phone.length !== 9 || !phone.startsWith("5")) {
      toast.error(t("errors.invalidPhone"));
      return;
    }
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phone", "==", fullPhoneNumber));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setShowSignupPrompt(true);
        setLoading(false);
        return;
      }

      setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        window.recaptchaVerifier
      );
      window.confirmationResult = confirmationResult;
      toast.success(t("messages.otpSent"));
      setStage("otp");
    } catch (err) {
      console.error("OTP Send Error:", err);
      toast.error(t("errors.otpSendFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast.error(t("errors.invalidOtp"));
      return;
    }
    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      const userCred = result.user;
      setUserId(userCred.uid);
      const idToken = await userCred.getIdToken();
      await fetch("/api/sessionLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      await dispatch(fetchSessionUser()).unwrap();

      const userDoc = await getDoc(doc(db, "users", userCred.uid));
      let targetRoute;

      if (userDoc.exists()) {
        const data = userDoc.data();
        targetRoute = data.role === "supplier" ? "/supplier-dashboard" : "/";
      } else {
        targetRoute = `/user-choices?uid=${
          userCred.uid
        }&phone=${encodeURIComponent(fullPhoneNumber)}`;
      }
      toast.success(t("messages.welcomeBack"));
      router.push(targetRoute);
    } catch (err) {
      console.error("OTP Verify Error:", err);
      toast.error(t("errors.otpVerifyFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='lg:grid lg:grid-cols-2 min-h-[80vh] items-center'>
      <div
        className='bg-gray-50 px-4 sm:px-6 lg:px-8 h-full'
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className='flex items-center justify-center h-full'>
          <div className='w-full max-w-md space-y-8'>
            <div className='text-center mt-4'>
              <h2 className='text-xl sm:text-2xl font-extrabold text-gray-900'>
                {t(`title.${stage}`)}
              </h2>
              <p className='mt-2 text-sm text-gray-600'>{t(`desc.${stage}`)}</p>
            </div>
            <Card className='bg-white shadow-lg rounded-lg overflow-hidden'>
              <CardContent className='px-6 py-8 space-y-6'>
                {stage === "phone" && (
                  <>
                    {phoneError && (
                      <div className='mb-2 text-red-600 text-sm font-medium text-center'>
                        {phoneError}
                      </div>
                    )}
                    <div className='relative flex gap-2'>
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className='border rounded-md bg-white px-3 py-2 text-sm w-32'
                      >
                        <option value='+966'>
                          {t("phoneCodes.sa")} (+966)
                        </option>
                        <option value='+971'>
                          {t("phoneCodes.ae")} (+971)
                        </option>
                        <option value='+973'>
                          {t("phoneCodes.bh")} (+973)
                        </option>
                        <option value='+965'>
                          {t("phoneCodes.kw")} (+965)
                        </option>
                        <option value='+968'>
                          {t("phoneCodes.om")} (+968)
                        </option>
                        <option value='+974'>
                          {t("phoneCodes.qa")} (+974)
                        </option>
                        <option value='+63'>{t("phoneCodes.ph")} (+63)</option>
                      </select>
                      <div className='relative flex-1'>
                        <Input
                          dir={isRtl ? "rtl" : "ltr"}
                          type='tel'
                          placeholder={t("placeholders.phone")}
                          value={phone}
                          maxLength={9}
                          onChange={(e) => {
                            let raw = e.target.value;
                            let val = raw.replace(/\D/g, "");
                            const numbersOnlyMsg =
                              locale === "ar"
                                ? "يسمح فقط بالأرقام"
                                : "Numbers only allowed";
                            const mustStartWith5Msg =
                              locale === "ar"
                                ? "رقم الجوال يجب أن يبدأ بـ 5"
                                : "Phone number must start with 5";
                            if (raw && /[^0-9]/.test(raw)) {
                              setPhoneError(numbersOnlyMsg);
                            } else if (val && val[0] !== "5") {
                              setPhoneError(mustStartWith5Msg);
                            } else {
                              setPhoneError("");
                            }
                            if (val.length > 9) val = val.slice(0, 9);
                            setPhone(val);
                          }}
                          className='pr-10'
                        />
                        <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                          <Phone className='h-5 w-5 text-gray-400' />
                        </div>
                      </div>
                    </div>
                    <div className='space-y-4'>
                      <label className='flex items-center space-x-2 text-sm'>
                        <input
                          type='checkbox'
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className='h-4 w-4 text-black border-gray-300 rounded'
                        />
                        <span>
                          {t("labels.acceptTerms")}{" "}
                          <a
                            href='/updated-terms-and-conditions'
                            target='_blank'
                            className='text-primary font-medium hover:underline'
                          >
                            {t("links.terms")}
                          </a>{" "}
                          &amp;{" "}
                          <a
                            href='/updated-privacy-policy'
                            target='_blank'
                            className='text-primary font-medium hover:underline'
                          >
                            {t("links.privacy")}
                          </a>
                        </span>
                      </label>

                      {showSignupPrompt && (
                        <div className='space-y-2 text-center'>
                          <p className='text-sm text-gray-700'>
                            {t("messages.noAccount")}
                          </p>
                          <Button
                            onClick={() =>
                              router.push(
                                `/user-choices?phone=${encodeURIComponent(
                                  fullPhoneNumber
                                )}`
                              )
                            }
                            className='w-full'
                          >
                            {t("buttons.signUp")}
                          </Button>
                        </div>
                      )}

                      {!showSignupPrompt && (
                        <Button
                          onClick={handleSendOtp}
                          disabled={loading || !termsAccepted}
                          className='w-full'
                        >
                          {loading
                            ? t("buttons.sending")
                            : t("buttons.sendOtp")}
                        </Button>
                      )}
                    </div>
                  </>
                )}
                {stage === "otp" && (
                  <>
                    <div className='flex justify-center'>
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className='w-full'
                    >
                      {loading
                        ? t("buttons.verifying")
                        : t("buttons.verifyOtp")}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className='hidden lg:flex h-full bg-gradient-to-br from-[#2c6449] to-green-400 text-white flex-col items-center justify-center p-10'>
        <img src='/logo.svg' alt='Marsos Logo' className='w-28 mb-4' />
        <h1 className='text-4xl font-bold mb-4'>{t("welcome.title")}</h1>
        <p className='text-lg max-w-sm text-center opacity-80'>
          {t("welcome.subtitle")}
        </p>
      </div>
      <div id='recaptcha-container' className='hidden' />
    </div>
  );
}
