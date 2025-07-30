"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import DateDropdownPicker from "@/components/DateDropdownPicker";

const STEP_KEYS = [
  "supplier.steps.authNun",
  "supplier.steps.verifyDate",
  "supplier.steps.completeDetails",
];

const PHONE_CODES = ["+966", "+971", "+973", "+965", "+968", "+974", "+63"];

export default function SupplierOnboardingPage() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nun: "",
    dateType: "hijri",
    issueDate: "",

    companyName: "",
    companyEmail: "",
    commercialReg: "",
    crIssueG: "",
    crIssueH: "",
    crConfirmG: "",
    crConfirmH: "",
    vatRegNumber: "",
    companyPhoneCode: "+966",
    companyPhone: "",
    city: "",
    zipCode: "",
    country: "",
    address: "",

    authPersonName: "",
    authPersonEmail: "",
    authPassword: "",
    authPhoneCode: "+966",
    authPersonMobile: "",
    designation: "",
    personalIdNumber: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const authenticateNun = async () => {
    if (!form.nun) return toast.error(t("supplier.errors.nunRequired"));
    setLoading(true);
    try {
      toast.success(t("supplier.messages.authSuccess"));
      setStep(1);
    } catch {
      toast.error(t("supplier.errors.authFailed"));
    } finally {
      setLoading(false);
    }
  };

  const verifyIssueDate = async () => {
    if (!form.issueDate) return toast.error(t("supplier.errors.dateRequired"));
    setLoading(true);
    try {
      toast.success(t("supplier.messages.dateVerified"));
      setStep(2);
    } catch {
      toast.error(t("supplier.errors.dateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const submitOnboarding = async (e) => {
    e.preventDefault();
    const requiredFields = [
      "companyName",
      "companyEmail",
      "commercialReg",
      "crIssueG",
      "crIssueH",
      "crConfirmG",
      "crConfirmH",
      "vatRegNumber",
      "companyPhone",
      "city",
      "zipCode",
      "country",
      "address",
      "authPersonName",
      "authPersonEmail",
      "authPassword",
      "authPersonMobile",
      "designation",
      "personalIdNumber",
    ];

    const missing = requiredFields.some((key) => !form[key]);
    if (missing) return toast.error(t("supplier.errors.completeAllFields"));

    setLoading(true);
    try {
      await addDoc(collection(db, "users"), {
        ...form,
        phone: form.authPhoneCode + form.authPersonMobile,
        companyPhone: form.companyPhoneCode + form.companyPhone,
        authPersonMobile: form.authPhoneCode + form.authPersonMobile,
        role: "supplier",
        approved: false,
        createdAt: serverTimestamp(),
      });
      toast.success(t("supplier.messages.submitted"));
      router.push("/pending");
    } catch {
      toast.error(t("supplier.errors.submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className='min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-6'
    >
      <Card className='w-full max-w-4xl bg-white shadow-xl rounded-lg'>
        <CardContent className='p-6 sm:p-10 space-y-6'>
          <h2 className='text-2xl font-bold text-center text-[#2c6449]'>
            {t("supplier.welcome.title")}
          </h2>

          <div className='flex justify-center gap-6'>
            {STEP_KEYS.map((key, i) => (
              <div key={key} className='flex flex-col items-center'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    step === i ? "bg-[#2c6449]" : "bg-gray-300"
                  }`}
                >
                  {i + 1}
                </div>
                <div
                  className={`mt-1 text-xs text-center ${
                    step === i ? "text-[#2c6449] font-medium" : "text-gray-500"
                  }`}
                >
                  {t(key)}
                </div>
              </div>
            ))}
          </div>

          <div className='mt-6'>
            {/* Step 0: NUN */}
            {step === 0 && (
              <div className='space-y-4'>
                <label className='block text-sm font-medium text-gray-700'>
                  {t("supplier.labels.nun")} *
                </label>

                <div className='flex flex-col md:flex-row gap-4'>
                  <input
                    className='w-full md:flex-1 p-2 border rounded-md focus:ring-2 focus:ring-[#2c6449]'
                    value={form.nun}
                    onChange={(e) => handleChange("nun", e.target.value)}
                    placeholder={t("supplier.placeholders.nun")}
                  />

                  <button
                    onClick={authenticateNun}
                    disabled={loading}
                    className='w-full md:w-auto md:px-6 bg-[#2c6449] text-white py-2 rounded-md font-semibold hover:bg-[#24513b] transition'
                  >
                    {loading
                      ? t("supplier.buttons.authenticating")
                      : t("supplier.buttons.authenticate")}
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Date */}
            {step === 1 && (
              <div className='bg-white border rounded-lg shadow-sm p-5 space-y-6'>
                {/* Step Title */}
                <h3 className='text-lg font-semibold text-[#2c6449]'>
                  {t("supplier.labels.issueDate")}{" "}
                  <span className='text-red-500'>*</span>
                </h3>

                {/* Calendar Type Toggle (pill buttons) */}
                <div className='flex gap-2'>
                  {["hijri", "gregorian"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleChange("dateType", type)}
                      className={`px-4 py-1 text-sm rounded-full border font-medium transition
            ${
              form.dateType === type
                ? "bg-[#2c6449] text-white border-[#2c6449]"
                : "bg-white text-gray-700 border-gray-300 hover:border-[#2c6449]"
            }`}
                    >
                      {t(`supplier.labels.${type}`)}
                    </button>
                  ))}
                </div>

                {/* Date Picker + Button (Responsive Row) */}
                <div className='flex flex-col md:flex-row md:items-end gap-4'>
                  {/* Date Picker */}
                  <div className='w-full md:flex-1 relative'>
                    <DateDropdownPicker
                      type={form.dateType}
                      locale={locale}
                      required
                      onChange={({ formatted }) =>
                        handleChange("issueDate", formatted)
                      }
                    />

                    {/* Aligned Converted Gregorian */}
                    {form.dateType === "hijri" && (
                      <p className='text-xs text-gray-500 mt-1'>
                        {t("Converted Gregorian")}:{" "}
                        <strong className='text-gray-700'>
                          {form.issueDate}
                        </strong>
                      </p>
                    )}
                  </div>

                  {/* Verify Button - aligned right */}
                  <div className='w-full md:w-[160px]'>
                    <button
                      onClick={verifyIssueDate}
                      disabled={loading}
                      className='w-full bg-[#2c6449] text-white py-2.5 px-4 rounded-md font-semibold hover:bg-[#24513b] transition text-sm'
                    >
                      {loading
                        ? t("supplier.buttons.verifyingDate")
                        : t("supplier.buttons.verify")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={submitOnboarding} className='space-y-6'>
                {/* Company Details */}
                <div className='border rounded-lg p-4'>
                  <h3 className='text-[#2c6449] font-semibold mb-3'>
                    {t("supplier.legends.companyDetails")}
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <input
                      placeholder={t("supplier.placeholders.companyName")}
                      value={form.companyName}
                      onChange={(e) =>
                        handleChange("companyName", e.target.value)
                      }
                      className='p-2 border rounded-md'
                      required
                    />
                    <input
                      type='email'
                      placeholder={t("supplier.placeholders.companyEmail")}
                      value={form.companyEmail}
                      onChange={(e) =>
                        handleChange("companyEmail", e.target.value)
                      }
                      className='p-2 border rounded-md'
                      required
                    />

                    {/* Commercial + VAT */}
                    <input
                      placeholder={t("supplier.placeholders.commercialReg")}
                      value={form.commercialReg}
                      onChange={(e) =>
                        handleChange("commercialReg", e.target.value)
                      }
                      className='p-2 border rounded-md'
                      required
                    />
                    <input
                      placeholder={t("supplier.placeholders.vatRegNumber")}
                      value={form.vatRegNumber}
                      onChange={(e) =>
                        handleChange("vatRegNumber", e.target.value)
                      }
                      className='p-2 border rounded-md'
                      required
                    />

                    {/* CR Issue Dates */}
                    <DateDropdownPicker
                      type='gregorian'
                      locale={locale}
                      label={t("supplier.labels.crIssueG")}
                      required
                      onChange={({ formatted }) =>
                        handleChange("crIssueG", formatted)
                      }
                    />
                    <DateDropdownPicker
                      type='hijri'
                      locale={locale}
                      label={t("supplier.labels.crIssueH")}
                      required
                      onChange={({ formatted }) =>
                        handleChange("crIssueH", formatted)
                      }
                    />

                    {/* CR Confirm Dates */}
                    <DateDropdownPicker
                      type='gregorian'
                      locale={locale}
                      label={t("supplier.labels.crConfirmG")}
                      required
                      onChange={({ formatted }) =>
                        handleChange("crConfirmG", formatted)
                      }
                    />
                    <DateDropdownPicker
                      type='hijri'
                      locale={locale}
                      label={t("supplier.labels.crConfirmH")}
                      required
                      onChange={({ formatted }) =>
                        handleChange("crConfirmH", formatted)
                      }
                    />

                    {/* Company Phone */}
                    <div className='flex'>
                      <select
                        value={form.companyPhoneCode}
                        onChange={(e) =>
                          handleChange("companyPhoneCode", e.target.value)
                        }
                        className='p-2 border rounded-l-md bg-gray-50'
                      >
                        {PHONE_CODES.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                      <input
                        type='tel'
                        value={form.companyPhone}
                        onChange={(e) =>
                          handleChange("companyPhone", e.target.value)
                        }
                        placeholder={t("supplier.placeholders.companyPhone")}
                        className='flex-1 p-2 border rounded-r-md'
                        required
                      />
                    </div>

                    <input
                      placeholder={t("supplier.placeholders.city")}
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className='p-2 border rounded-md'
                      required
                    />
                    <input
                      placeholder={t("supplier.placeholders.zipCode")}
                      value={form.zipCode}
                      onChange={(e) => handleChange("zipCode", e.target.value)}
                      className='p-2 border rounded-md'
                      required
                    />
                    <input
                      placeholder={t("supplier.placeholders.country")}
                      value={form.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      className='p-2 border rounded-md'
                      required
                    />
                    <textarea
                      rows={3}
                      placeholder={t("supplier.placeholders.address")}
                      value={form.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className='p-2 border rounded-md md:col-span-2'
                      required
                    />
                  </div>
                </div>

                {/* Authorized Person */}
                <div className='border rounded-lg p-4'>
                  <h3 className='text-[#2c6449] font-semibold mb-3'>
                    {t("supplier.legends.authorizedPerson")}
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <input
                      placeholder={t("supplier.placeholders.authPersonName")}
                      value={form.authPersonName}
                      onChange={(e) =>
                        handleChange("authPersonName", e.target.value)
                      }
                      className='p-2 border rounded-md'
                      required
                    />
                    <input
                      type='email'
                      placeholder={t("supplier.placeholders.authPersonEmail")}
                      value={form.authPersonEmail}
                      onChange={(e) =>
                        handleChange("authPersonEmail", e.target.value)
                      }
                      className='p-2 border rounded-md'
                      required
                    />
                    <input
                      type='password'
                      placeholder={t("supplier.placeholders.authPassword")}
                      value={form.authPassword}
                      onChange={(e) =>
                        handleChange("authPassword", e.target.value)
                      }
                      className='p-2 border rounded-md'
                      required
                    />
                    <div className='flex'>
                      <select
                        value={form.authPhoneCode}
                        onChange={(e) =>
                          handleChange("authPhoneCode", e.target.value)
                        }
                        className='p-2 border rounded-l-md bg-gray-50'
                      >
                        {PHONE_CODES.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                      <input
                        type='tel'
                        value={form.authPersonMobile}
                        onChange={(e) =>
                          handleChange("authPersonMobile", e.target.value)
                        }
                        placeholder={t(
                          "supplier.placeholders.authPersonMobile"
                        )}
                        className='flex-1 p-2 border rounded-r-md'
                        required
                      />
                    </div>
                    <input
                      placeholder={t("supplier.placeholders.designation")}
                      value={form.designation}
                      onChange={(e) =>
                        handleChange("designation", e.target.value)
                      }
                      className='p-2 border rounded-md'
                      required
                    />
                    <input
                      placeholder={t("supplier.placeholders.personalIdNumber")}
                      value={form.personalIdNumber}
                      onChange={(e) =>
                        handleChange("personalIdNumber", e.target.value)
                      }
                      className='p-2 border rounded-md'
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full bg-[#2c6449] text-white py-2 rounded-md font-semibold hover:bg-[#24513b] transition'
                >
                  {loading
                    ? t("supplier.buttons.uploading")
                    : t("supplier.buttons.submit")}
                </button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
