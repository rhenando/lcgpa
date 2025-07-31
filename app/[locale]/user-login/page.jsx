"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "@/firebase/config";
import {
  doc,
  getDoc,
  setDoc,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Phone, Mail, Eye, EyeOff } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSessionUser } from "@/store/authSlice";

export default function AuthPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  // MODIFIED: Changed translation namespace for clarity, you can keep "login" if you prefer.
  const t = useTranslations("Auth");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { user, loading: authLoading } = useSelector((s) => s.auth);

  // Common states
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("phone");

  // Email/Password states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // Phone/OTP states
  const [phoneError, setPhoneError] = useState("");
  const [countryCode, setCountryCode] = useState("+966");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("phone");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // Terms acceptance
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleEmailAuth = async () => {
    if (!termsAccepted) {
      toast.error(t("errors.mustAcceptTerms"));
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t("errors.invalidEmail"));
      return;
    } else {
      setEmailError("");
    }

    if (!validatePassword(password)) {
      setPasswordError(t("errors.invalidPassword"));
      return;
    } else {
      setPasswordError("");
    }

    setLoading(true);
    try {
      let userCredential;

      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          phone: "",
          createdAt: new Date(),
          authMethod: "email",
        });
        toast.success(t("messages.accountCreated"));
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        toast.success(t("messages.welcomeBack"));
      }

      const idToken = await userCredential.user.getIdToken();
      await fetch("/api/sessionLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      await dispatch(fetchSessionUser()).unwrap();

      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      let targetRoute = "/";

      if (userDoc.exists()) {
        const data = userDoc.data();
        // NOTE: This logic is perfect for a procurement authority (e.g., redirecting suppliers).
        targetRoute = data.role === "supplier" ? "/supplier-dashboard" : "/";
      } else if (isSignUp) {
        // NOTE: This route is great for new users to define their role (e.g., supplier, agency).
        targetRoute = `/user-choices?uid=${
          userCredential.user.uid
        }&email=${encodeURIComponent(email)}`;
      }

      router.push(targetRoute);
    } catch (err) {
      console.error("Email Auth Error:", err);
      // MODIFIED: Using translation function for errors.
      if (err.code === "auth/user-not-found") {
        setIsSignUp(true);
        toast.info(t("messages.creatingNewAccount"));
      } else if (err.code === "auth/email-already-in-use") {
        setIsSignUp(false);
        toast.error(t("errors.emailInUse"));
      } else if (err.code === "auth/wrong-password") {
        toast.error(t("errors.incorrectPassword"));
      } else {
        toast.error(t("errors.authFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

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
      {
        size: "invisible",
        callback: () => {},
      }
    );
  };

  const handleSendOtp = async () => {
    if (!termsAccepted) {
      toast.error(t("errors.mustAcceptTerms"));
      return;
    }
    // NOTE: This validation is specific to KSA numbers and seems appropriate.
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

  // MODIFIED: Updated titles and descriptions to be more formal and relevant.
  const getTitle = () => {
    if (activeTab === "email") {
      return isSignUp ? t("title.register") : t("title.signIn");
    }
    return t(`title.${stage}`);
  };

  const getDescription = () => {
    if (activeTab === "email") {
      return isSignUp ? t("desc.register") : t("desc.signIn");
    }
    return t(`desc.${stage}`);
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
                {getTitle()}
              </h2>
              <p className='mt-2 text-sm text-gray-600'>{getDescription()}</p>
            </div>

            <Card className='bg-white shadow-lg rounded-lg overflow-hidden'>
              <CardContent className='px-6 py-8 space-y-6'>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className='grid w-full grid-cols-2'>
                    {/* MODIFIED: Tab titles changed for clarity */}
                    <TabsTrigger
                      value='email'
                      className='flex items-center gap-2'
                    >
                      <Mail className='h-4 w-4' />
                      {t("tabs.email")}
                    </TabsTrigger>
                    <TabsTrigger
                      value='phone'
                      className='flex items-center gap-2'
                    >
                      <Phone className='h-4 w-4' />
                      {t("tabs.phone")}
                    </TabsTrigger>
                  </TabsList>

                  {/* Email & Password Tab */}
                  <TabsContent value='email' className='space-y-4 pt-4'>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          {t("labels.email")}
                        </label>
                        <div className='relative'>
                          <Input
                            type='email'
                            placeholder='you@example.com'
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setEmailError("");
                            }}
                            className={`pl-10 ${
                              emailError ? "border-red-500" : ""
                            }`}
                            dir='ltr'
                          />
                          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <Mail className='h-5 w-5 text-gray-400' />
                          </div>
                        </div>
                        {emailError && (
                          <p className='mt-1 text-sm text-red-600'>
                            {emailError}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          {t("labels.password")}
                        </label>
                        <div className='relative'>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder='********'
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setPasswordError("");
                            }}
                            className={`pr-10 ${
                              passwordError ? "border-red-500" : ""
                            }`}
                          />
                          <button
                            type='button'
                            className='absolute inset-y-0 right-0 pr-3 flex items-center'
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className='h-5 w-5 text-gray-400' />
                            ) : (
                              <Eye className='h-5 w-5 text-gray-400' />
                            )}
                          </button>
                        </div>
                        {passwordError && (
                          <p className='mt-1 text-sm text-red-600'>
                            {passwordError}
                          </p>
                        )}
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
                          {/* MODIFIED: Links point to more standard government pages */}
                          <a
                            href='/terms-of-service'
                            target='_blank'
                            className='text-primary font-medium hover:underline'
                          >
                            {t("links.terms")}
                          </a>{" "}
                          &amp;{" "}
                          <a
                            href='/privacy-policy'
                            target='_blank'
                            className='text-primary font-medium hover:underline'
                          >
                            {t("links.privacy")}
                          </a>
                        </span>
                      </label>

                      <Button
                        onClick={handleEmailAuth}
                        disabled={loading || !termsAccepted}
                        className='w-full'
                      >
                        {loading
                          ? t("buttons.processing")
                          : isSignUp
                          ? t("buttons.register")
                          : t("buttons.signIn")}
                      </Button>

                      <div className='text-center'>
                        <button
                          type='button'
                          onClick={() => setIsSignUp(!isSignUp)}
                          className='text-sm text-primary hover:underline'
                        >
                          {isSignUp
                            ? t("links.alreadyRegistered")
                            : t("links.notRegistered")}
                        </button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Phone & OTP Tab */}
                  <TabsContent value='phone' className='space-y-4 pt-4'>
                    {stage === "phone" && (
                      <>
                        {phoneError && (
                          <div className='mb-2 text-red-600 text-sm font-medium text-center'>
                            {phoneError}
                          </div>
                        )}
                        <div className='relative flex gap-2'>
                          {/* NOTE: You can add more country codes if needed. */}
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
                          </select>
                          <div className='relative flex-1'>
                            <Input
                              dir={isRtl ? "rtl" : "ltr"}
                              type='tel'
                              placeholder={t("placeholders.phone")}
                              value={phone}
                              maxLength={9}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, "");
                                if (val.length > 9) val = val.slice(0, 9);
                                setPhone(val);
                                // Clear error as user types
                                if (phoneError) setPhoneError("");
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
                              onChange={(e) =>
                                setTermsAccepted(e.target.checked)
                              }
                              className='h-4 w-4 text-black border-gray-300 rounded'
                            />
                            <span>
                              {t("labels.acceptTerms")}{" "}
                              <a
                                href='/terms-of-service'
                                target='_blank'
                                className='text-primary font-medium hover:underline'
                              >
                                {t("links.terms")}
                              </a>{" "}
                              &amp;{" "}
                              <a
                                href='/privacy-policy'
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
                                {t("buttons.registerNow")}
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* MODIFIED: Right side branding section updated */}
      <div className='hidden lg:flex h-full bg-gradient-to-br from-[#004d40] to-[#00796b] text-white flex-col items-center justify-center p-10 text-center'>
        {/* NOTE: Replace with your authority's logo */}
        <img
          src='/logo.svg'
          alt='Government Procurement Authority Logo'
          className='w-96'
        />
        <h1 className='text-4xl font-bold mb-4'>{t("welcome.title")}</h1>
        <p className='text-lg max-w-sm opacity-80'>{t("welcome.subtitle")}</p>
      </div>

      <div id='recaptcha-container' className='hidden' />
    </div>
  );
}
