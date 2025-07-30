"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import CreatableSelect from "react-select/creatable";
import CountryList from "react-select-country-list";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/firebase/config";
import PhoneField from "@/components/global/PhoneField";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useTranslations, useLocale } from "next-intl";
import clsx from "clsx";

export default function RfqPage() {
  const t = useTranslations("rfq");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  const reduxUser = useSelector((state) => state.auth.user);

  const initialFormState = {
    productName: "",
    category: "",
    subcategory: "",
    size: "",
    color: "",
    shippingCountry: "",
    purchaseQuantity: "",
    purchaseUnit: "Piece(s)",
    productDetails: "",
    shippingMethod: "",
    destinationPort: "",
    leadTime: "",
    paymentTerms: "",
    files: [],
  };

  const refs = {
    productName: useRef(null),
    category: useRef(null),
    subcategory: useRef(null),
    size: useRef(null),
    color: useRef(null),
    shippingCountry: useRef(null),
    purchaseQuantity: useRef(null),
    purchaseUnit: useRef(null),
    productDetails: useRef(null),
    shippingMethod: useRef(null),
    paymentTerms: useRef(null),
    files: useRef(null),
  };

  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([
    { value: "Others", label: isRTL ? "أخرى" : "Others" },
  ]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // Add suppliers state
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const countryOptions = useMemo(
    () =>
      CountryList()
        .getData()
        .map((opt) => ({
          ...opt,
          label: isRTL ? opt.label : opt.label,
        })),
    [isRTL]
  );

  const purchaseUnitOptions = [
    { value: "Piece(s)", label: isRTL ? "قطعة" : "Piece(s)" },
  ];
  const sizeOptions = [
    { value: "Small", label: isRTL ? "صغير" : "Small" },
    { value: "Medium", label: isRTL ? "متوسط" : "Medium" },
    { value: "Large", label: isRTL ? "كبير" : "Large" },
    { value: "Others", label: isRTL ? "أخرى" : "Others" },
  ];
  const colorOptions = [
    { value: "Red", label: isRTL ? "أحمر" : "Red" },
    { value: "Blue", label: isRTL ? "أزرق" : "Blue" },
    { value: "Green", label: isRTL ? "أخضر" : "Green" },
    { value: "Others", label: isRTL ? "أخرى" : "Others" },
  ];
  const shippingMethodOptions = [
    { value: "Sea freight", label: isRTL ? "شحن بحري" : "Sea freight" },
    { value: "Air freight", label: isRTL ? "شحن جوي" : "Air freight" },
    { value: "Land", label: isRTL ? "بري" : "Land" },
    { value: "Express", label: isRTL ? "سريع" : "Express" },
    { value: "Others", label: isRTL ? "أخرى" : "Others" },
  ];
  const paymentTermsOptions = [
    {
      value: "T/T (Wire Transfer)",
      label: isRTL ? "حوالة بنكية" : "T/T (Wire Transfer)",
    },
    {
      value: "L/C (Letter of Credit)",
      label: isRTL ? "اعتماد مستندي" : "L/C (Letter of Credit)",
    },
    {
      value: "D/P (Documents Against Payment)",
      label: isRTL ? "مستندات مقابل دفع" : "D/P (Documents Against Payment)",
    },
    { value: "Others", label: isRTL ? "أخرى" : "Others" },
  ];

  function validateForm(form) {
    const errors = {};
    if (!form.productName?.trim()) errors.productName = true;
    if (!form.category?.trim()) errors.category = true;
    if (!form.subcategory?.trim()) errors.subcategory = true;
    if (!form.size?.trim()) errors.size = true;
    if (!form.color?.trim()) errors.color = true;
    if (!form.shippingCountry?.trim()) errors.shippingCountry = true;
    if (
      !form.purchaseQuantity?.toString().trim() ||
      Number(form.purchaseQuantity) <= 0
    )
      errors.purchaseQuantity = true;
    if (!form.purchaseUnit?.trim()) errors.purchaseUnit = true;
    if (!form.productDetails?.trim()) errors.productDetails = true;
    if (!form.shippingMethod?.trim()) errors.shippingMethod = true;
    if (!form.paymentTerms?.trim()) errors.paymentTerms = true;
    if (!form.files?.length) errors.files = true;
    return errors;
  }

  // WhatsApp notification function
  const sendWhatsAppNotification = async (supplier, formData) => {
    try {
      const notificationData = {
        supplierPhone: supplier.whatsappNumber || supplier.phoneNumber,
        supplierName: supplier.supplierName,
        productName: formData.productName,
        category: formData.category,
        quantity: `${formData.purchaseQuantity} ${formData.purchaseUnit}`,
        buyerName:
          reduxUser.displayName ||
          reduxUser.email ||
          `${reduxUser.firstName || ""} ${reduxUser.lastName || ""}`.trim(),
        shippingCountry:
          formData.shippingCountryLabel || formData.shippingCountry,
      };

      console.log(
        "📤 Sending WhatsApp notification with data:",
        notificationData
      );

      const response = await fetch("/api/send-rfq-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
      });

      const result = await response.json();

      if (result.success) {
        console.log(
          "✅ RFQ WhatsApp notification sent successfully to:",
          result.sentTo
        );
        return true;
      } else {
        console.error(
          "❌ Failed to send RFQ WhatsApp notification:",
          result.message
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Error sending RFQ WhatsApp notification:", error);
      return false;
    }
  };

  // Updated useEffect to fetch both products and suppliers
  useEffect(() => {
    const fetchProductsAndSuppliers = async () => {
      try {
        // Fetch products
        const productsSnap = await getDocs(collection(db, "products"));
        const prods = [];
        const categoryMap = {};

        productsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          prods.push(data);
          if (data.category && data.category.en) {
            const catEn = data.category.en.trim();
            if (!categoryMap[catEn]) categoryMap[catEn] = new Set();
            if (data.subCategory && data.subCategory.en) {
              categoryMap[catEn].add(data.subCategory.en.trim());
            }
          }
        });

        setProducts(prods);
        console.log("📋 Fetched products:", prods.length);

        // Fetch suppliers (users with role "supplier")
        const suppliersSnap = await getDocs(collection(db, "users"));
        const suppliersList = [];

        suppliersSnap.forEach((docSnap) => {
          const data = docSnap.data();
          // Filter only suppliers
          if (data.role === "supplier") {
            suppliersList.push({
              ...data,
              supplierId: data.uid, // Make sure supplierId is set
            });
          }
        });

        setSuppliers(suppliersList);
        console.log("📋 Fetched suppliers:", suppliersList.length);

        // Set categories
        const cats = [
          ...Object.keys(categoryMap)
            .sort()
            .map((cat) => ({ value: cat, label: cat })),
          { value: "Others", label: isRTL ? "أخرى" : "Others" },
        ];
        setCategoryOptions(cats);
        setSubcategoryOptions([
          { value: "Others", label: isRTL ? "أخرى" : "Others" },
        ]);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };

    fetchProductsAndSuppliers();
  }, [isRTL]);

  useEffect(() => {
    if (
      !form.category ||
      form.category === "Others" ||
      form.category === "أخرى"
    ) {
      setSubcategoryOptions([
        { value: "Others", label: isRTL ? "أخرى" : "Others" },
      ]);
      setForm((prev) => ({ ...prev, subcategory: isRTL ? "أخرى" : "Others" }));
      return;
    }
    if (products.length === 0) {
      setSubcategoryOptions([
        { value: "Others", label: isRTL ? "أخرى" : "Others" },
      ]);
      setForm((prev) => ({ ...prev, subcategory: isRTL ? "أخرى" : "Others" }));
      return;
    }
    const subcatSet = new Set();
    products.forEach((data) => {
      if (
        data.category &&
        data.category.en &&
        data.category.en.trim().toLowerCase() ===
          form.category.trim().toLowerCase()
      ) {
        if (data.subCategory && data.subCategory.en) {
          subcatSet.add(data.subCategory.en.trim());
        }
      }
    });
    const subs = [
      ...Array.from(subcatSet)
        .sort()
        .map((sub) => ({
          value: sub,
          label: sub,
        })),
      { value: "Others", label: isRTL ? "أخرى" : "Others" },
    ];
    setSubcategoryOptions(subs);
    setForm((prev) => ({ ...prev, subcategory: isRTL ? "أخرى" : "Others" }));
  }, [form.category, products, isRTL]);

  useEffect(() => {
    if (showSuccessDialog) {
      const timer = setTimeout(() => {
        setShowSuccessDialog(false);
        window.location.href = "/";
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessDialog]);

  const handleSelectChange = (name) => (option) => {
    setForm((prev) => ({
      ...prev,
      [name]: option ? option.value : "",
    }));
  };
  const getSelectValue = (options, value) =>
    options.find((o) => o.value === value) ||
    (value ? { label: value, value } : null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 10);
    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setForm((prev) => ({ ...prev, files }));
    setImagePreviews(previews);
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => {
      const newPreviews = prev.slice();
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    setForm((prev) => {
      const newFiles = prev.files.slice();
      newFiles.splice(index, 1);
      return { ...prev, files: newFiles };
    });
  };

  const focusFirstError = (errors) => {
    const firstKey = Object.keys(errors)[0];
    if (firstKey && refs[firstKey] && refs[firstKey].current) {
      refs[firstKey].current.focus();
      refs[firstKey].current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      toast.error(t("agree"));
      return;
    }
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      focusFirstError(errors);
      toast.error(t("tip"));
      return;
    }
    setSubmitting(true);

    const safeString = (str) =>
      String(str || "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "")
        .toLowerCase();

    try {
      if (!reduxUser) {
        toast.error("You must be logged in.");
        setSubmitting(false);
        return;
      }

      const storage = getStorage();
      let imageUrls = [];
      if (form.files && form.files.length > 0) {
        for (let i = 0; i < form.files.length; i++) {
          const file = form.files[i];
          const storageRef = ref(
            storage,
            `importSaudi-images/${Date.now()}_${file.name}`
          );
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          imageUrls.push(downloadURL);
        }
      }

      const getCountryLabel = (code) => {
        const match = countryOptions.find((x) => x.value === code);
        return match ? match.label : code;
      };
      const countryLabel = getCountryLabel(form.shippingCountry);
      const { files, ...formData } = form;

      // NEW LOGIC: Find suppliers who have products in the selected category
      const supplierIdsInCategory = new Set();

      // Get all supplier IDs that have products in this category
      products.forEach((product) => {
        if (
          product.category &&
          product.category.en &&
          product.category.en.trim().toLowerCase() ===
            form.category.trim().toLowerCase() &&
          product.supplierId
        ) {
          supplierIdsInCategory.add(product.supplierId);
        }
      });

      console.log(
        "🔍 Supplier IDs in category:",
        Array.from(supplierIdsInCategory)
      );

      // Get full supplier details for those IDs
      const suppliersForCategory = suppliers
        .filter((supplier) =>
          supplierIdsInCategory.has(supplier.uid || supplier.supplierId)
        )
        .map((supplier) => {
          // Get the phone number from actual Firestore fields
          const phoneNumber =
            supplier.companyPhone ||
            supplier.phone ||
            supplier.authPersonMobile;

          if (!phoneNumber) {
            console.warn(
              `No phone number found for supplier: ${
                supplier.name || supplier.companyName
              }`,
              {
                companyPhone: supplier.companyPhone,
                phone: supplier.phone,
                authPersonMobile: supplier.authPersonMobile,
              }
            );
            return null;
          }

          return {
            supplierId: supplier.uid || supplier.supplierId,
            supplierName: supplier.name || supplier.companyName,
            whatsappNumber: phoneNumber,
            phoneNumber: phoneNumber,
            companyName: supplier.companyName,
          };
        })
        .filter(Boolean); // Remove null entries

      console.log("📋 Final suppliers for category:", suppliersForCategory);

      if (suppliersForCategory.length === 0) {
        toast.error("No suppliers found for this category");
        setSubmitting(false);
        return;
      }

      let duplicateFound = false;
      let successfulNotifications = 0;

      for (const supplier of suppliersForCategory) {
        const chatId = `chat_${reduxUser.uid}_${
          supplier.supplierId
        }_${safeString(form.category)}_${safeString(form.productName)}`;
        const chatRef = doc(db, "rfqChats", chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
          duplicateFound = true;
          toast.error(
            t(
              "You have already requested an RFQ for this product/category/supplier."
            )
          );
          continue;
        }

        await setDoc(chatRef, {
          chatId,
          buyerId: reduxUser.uid,
          supplierId: supplier.supplierId,
          supplierName: supplier.supplierName,
          productName: form.productName,
          category: form.category,
          messages: [],
          createdAt: serverTimestamp(),
          lastActivity: serverTimestamp(),
        });

        const dataToSave = {
          ...formData,
          shippingCountryLabel: countryLabel,
          imageUrls,
          createdAt: serverTimestamp(),
          buyerId: reduxUser.uid,
          supplierId: supplier.supplierId,
          chatId,
          productName: form.productName,
          category: form.category,
        };

        const rfqDocRef = await addDoc(collection(db, "rfqs"), dataToSave);
        await setDoc(chatRef, { rfqId: rfqDocRef.id }, { merge: true });

        // Send WhatsApp notification
        const notificationSent = await sendWhatsAppNotification(supplier, {
          ...formData,
          productName: form.productName,
          category: form.category,
          shippingCountryLabel: countryLabel,
        });

        if (notificationSent) {
          successfulNotifications++;
        }
      }

      if (duplicateFound && suppliersForCategory.length > 0) {
        toast.info(
          t(
            "Some RFQs were not created because you already have chats for this product/category/supplier."
          )
        );
      }

      if (!duplicateFound || suppliersForCategory.length === 0) {
        if (successfulNotifications > 0) {
          toast.success(
            `✅ RFQ submitted successfully! WhatsApp notifications sent to ${successfulNotifications} supplier(s)`
          );
        } else if (suppliersForCategory.length > 0) {
          toast.success("✅ RFQ submitted successfully!");
          toast.warning("⚠️ WhatsApp notifications could not be delivered");
        } else {
          toast.success(t("successTitle"));
        }

        setShowSuccessDialog(true);
        setForm(initialFormState);
        setImagePreviews([]);
        setFormErrors({});
        setAgreed(false);
      }
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      toast.error("Error submitting form: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      dir={dir}
      lang={locale}
      style={{
        fontFamily: "'Montserrat', Arial, Helvetica, sans-serif",
        direction: dir,
      }}
      className={clsx(
        "min-h-[80vh] bg-gray-50 flex flex-col items-center py-2",
        "mt-2 md:mt-6"
      )}
    >
      <form
        dir={dir}
        lang={locale}
        onSubmit={handleSubmit}
        className={clsx(
          "w-full bg-white shadow border border-gray-200",
          "rounded-none md:rounded-lg",
          "p-3 sm:p-5 md:p-7",
          "text-xs",
          "max-w-[95vw] sm:max-w-xl md:max-w-3xl lg:max-w-5xl"
        )}
      >
        <div className='mb-4 border-b pb-3'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1'>
            <h1 className='text-base sm:text-lg font-bold'>{t("title")}</h1>
          </div>
          <span className='text-gray-500 text-xs'>{t("tip")}</span>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-3'>
            <h2 className='text-sm font-semibold mb-2'>
              {t("productDetails")}
            </h2>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>{t("required")}</span>{" "}
              {t("productName")}
              <input
                name='productName'
                type='text'
                value={form.productName}
                onChange={handleChange}
                ref={refs.productName}
                className={clsx(
                  "mt-1 w-full border rounded px-3 h-10 text-base font-normal text-gray-900 sm:text-xs",
                  formErrors.productName ? "border-red-500" : ""
                )}
                placeholder={t("productName")}
                style={{ fontSize: "16px" }}
              />
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>{t("required")}</span>{" "}
              {t("category")}
              <div ref={refs.category}>
                <CreatableSelect
                  isClearable
                  name='category'
                  options={categoryOptions}
                  value={getSelectValue(categoryOptions, form.category)}
                  onChange={handleSelectChange("category")}
                  classNamePrefix='rs'
                  className='mt-1 text-base sm:text-xs'
                  placeholder={t("category")}
                  isLoading={categoryOptions.length === 0}
                  formatCreateLabel={(inputValue) =>
                    isRTL
                      ? `أضف "${inputValue}" كفئة جديدة`
                      : `Add "${inputValue}" as a new category`
                  }
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "2.5rem",
                      borderRadius: "0.375rem",
                      borderColor: formErrors.category
                        ? "#ef4444"
                        : base.borderColor,
                      boxShadow: formErrors.category
                        ? "0 0 0 1px #ef4444"
                        : base.boxShadow,
                      borderWidth: "1px",
                      direction: dir,
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.category ? "#ef4444" : "#a3a3a3",
                      direction: dir,
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  isRtl={isRTL}
                />
              </div>
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>{t("required")}</span>{" "}
              {t("subcategory")}
              <div ref={refs.subcategory}>
                <CreatableSelect
                  isClearable
                  name='subcategory'
                  options={subcategoryOptions}
                  value={getSelectValue(subcategoryOptions, form.subcategory)}
                  onChange={handleSelectChange("subcategory")}
                  classNamePrefix='rs'
                  className='mt-1 text-base sm:text-xs'
                  placeholder={t("subcategory")}
                  isDisabled={!form.category}
                  formatCreateLabel={(inputValue) =>
                    isRTL
                      ? `أضف "${inputValue}" كفئة فرعية جديدة`
                      : `Add "${inputValue}" as a new subcategory`
                  }
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "2.5rem",
                      borderRadius: "0.375rem",
                      borderColor: formErrors.subcategory
                        ? "#ef4444"
                        : base.borderColor,
                      boxShadow: formErrors.subcategory
                        ? "0 0 0 1px #ef4444"
                        : base.boxShadow,
                      borderWidth: "1px",
                      direction: dir,
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.subcategory ? "#ef4444" : "#a3a3a3",
                      direction: dir,
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  isRtl={isRTL}
                />
              </div>
            </label>
            <div className='block font-semibold text-primary mb-2'>
              <label className='block font-semibold text-primary mb-2'>
                <span className='text-red-500'>{t("required")}</span>{" "}
                {t("purchaseQuantity")}
              </label>
              <div
                className={clsx(
                  "flex flex-row gap-2 mt-1",
                  isRTL && "flex-row-reverse"
                )}
              >
                <input
                  name='purchaseQuantity'
                  type='number'
                  min={1}
                  value={form.purchaseQuantity}
                  onChange={handleChange}
                  ref={refs.purchaseQuantity}
                  className={clsx(
                    "w-1/2 border rounded px-3 h-10 text-base font-normal text-gray-900 sm:text-xs",
                    formErrors.purchaseQuantity ? "border-red-500" : ""
                  )}
                  placeholder={t("purchaseQuantity")}
                  style={{ fontSize: "16px" }}
                />
                <div className='w-1/2' ref={refs.purchaseUnit}>
                  <CreatableSelect
                    isClearable={false}
                    name='purchaseUnit'
                    options={purchaseUnitOptions}
                    value={getSelectValue(
                      purchaseUnitOptions,
                      form.purchaseUnit
                    )}
                    onChange={handleSelectChange("purchaseUnit")}
                    classNamePrefix='rs'
                    className='text-base sm:text-xs'
                    placeholder={t("purchaseUnit")}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: "2.5rem",
                        borderRadius: "0.375rem",
                        borderColor: formErrors.purchaseUnit
                          ? "#ef4444"
                          : base.borderColor,
                        boxShadow: formErrors.purchaseUnit
                          ? "0 0 0 1px #ef4444"
                          : base.boxShadow,
                        borderWidth: "1px",
                        direction: dir,
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: formErrors.purchaseUnit ? "#ef4444" : "#a3a3a3",
                        direction: dir,
                      }),
                    }}
                    isRtl={isRTL}
                  />
                </div>
              </div>
            </div>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>{t("required")}</span> {t("size")}
              <div ref={refs.size}>
                <CreatableSelect
                  isClearable
                  name='size'
                  options={sizeOptions}
                  value={getSelectValue(sizeOptions, form.size)}
                  onChange={handleSelectChange("size")}
                  classNamePrefix='rs'
                  className='mt-1 text-base sm:text-xs'
                  placeholder={t("size")}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "2.5rem",
                      borderRadius: "0.375rem",
                      borderColor: formErrors.size
                        ? "#ef4444"
                        : base.borderColor,
                      boxShadow: formErrors.size
                        ? "0 0 0 1px #ef4444"
                        : base.boxShadow,
                      borderWidth: "1px",
                      direction: dir,
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.size ? "#ef4444" : "#a3a3a3",
                      direction: dir,
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  isRtl={isRTL}
                />
              </div>
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>{t("required")}</span> {t("color")}
              <div ref={refs.color}>
                <CreatableSelect
                  isClearable
                  name='color'
                  options={colorOptions}
                  value={getSelectValue(colorOptions, form.color)}
                  onChange={handleSelectChange("color")}
                  classNamePrefix='rs'
                  className='mt-1 text-base sm:text-xs'
                  placeholder={t("color")}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "2.5rem",
                      borderRadius: "0.375rem",
                      borderColor: formErrors.color
                        ? "#ef4444"
                        : base.borderColor,
                      boxShadow: formErrors.color
                        ? "0 0 0 1px #ef4444"
                        : base.boxShadow,
                      borderWidth: "1px",
                      direction: dir,
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.color ? "#ef4444" : "#a3a3a3",
                      direction: dir,
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  isRtl={isRTL}
                />
              </div>
            </label>
            <label className='block font-semibold text-primary'>
              <span className='text-red-500'>{t("required")}</span>{" "}
              {t("productDetailsLabel")}
              <textarea
                name='productDetails'
                value={form.productDetails}
                onChange={handleChange}
                ref={refs.productDetails}
                className={clsx(
                  "mt-1 w-full border rounded px-3 py-2 min-h-[48px] text-base font-normal text-gray-900 sm:text-xs",
                  formErrors.productDetails ? "border-red-500" : ""
                )}
                placeholder={t("productDetailsLabel")}
                style={{ fontSize: "16px" }}
              />
            </label>
            <div className='w-full mb-2'>
              <label className='block font-semibold text-primary mb-1'>
                <span className='text-red-500'>{t("required")}</span>{" "}
                {t("images")}
                <div className='flex gap-2 items-center mt-1 mb-2'>
                  <label
                    htmlFor='image-upload'
                    className={clsx(
                      "inline-flex items-center px-3 h-10 bg-white border",
                      formErrors.files ? "border-red-500" : "border-primary",
                      "text-primary rounded shadow-sm font-semibold cursor-pointer",
                      "hover:bg-primary hover:text-white transition duration-150 text-xs"
                    )}
                    style={{ minWidth: 120 }}
                    ref={refs.files}
                  >
                    <svg
                      className='w-4 h-4 mr-1'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth={2}
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4'
                      />
                    </svg>
                    {t("upload")}
                    <input
                      id='image-upload'
                      type='file'
                      accept='image/*'
                      multiple
                      className='hidden'
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <div className='grid grid-cols-5 sm:grid-cols-6 gap-2'>
                  {imagePreviews.map((img, idx) => (
                    <div
                      key={idx}
                      className='relative group w-12 h-12 border rounded overflow-hidden flex items-center justify-center bg-gray-50'
                    >
                      <img
                        src={img.url}
                        alt={`preview ${idx + 1}`}
                        className='object-cover w-full h-full'
                      />
                      <button
                        type='button'
                        onClick={() => handleRemoveImage(idx)}
                        className='absolute -top-1 -right-1 bg-white bg-opacity-90 border border-gray-300 rounded-full w-4 h-4 text-xs text-red-500 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-600 hover:text-white transition'
                        title='Remove'
                        tabIndex={-1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </label>
            </div>
          </div>
          <div className='space-y-3'>
            <h2 className='text-sm font-semibold mb-2'>
              {t("shippingAndPayment")}
            </h2>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>{t("required")}</span>{" "}
              {t("shippingCountry")}
              <div ref={refs.shippingCountry}>
                <CreatableSelect
                  isClearable
                  name='shippingCountry'
                  options={countryOptions}
                  value={getSelectValue(countryOptions, form.shippingCountry)}
                  onChange={handleSelectChange("shippingCountry")}
                  classNamePrefix='rs'
                  className='mt-1 text-base sm:text-xs'
                  placeholder={t("shippingCountry")}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "2.5rem",
                      borderRadius: "0.375rem",
                      borderColor: formErrors.shippingCountry
                        ? "#ef4444"
                        : base.borderColor,
                      boxShadow: formErrors.shippingCountry
                        ? "0 0 0 1px #ef4444"
                        : base.boxShadow,
                      borderWidth: "1px",
                      direction: dir,
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.shippingCountry ? "#ef4444" : "#a3a3a3",
                      direction: dir,
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  isRtl={isRTL}
                />
              </div>
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>{t("required")}</span>{" "}
              {t("shippingMethod")}
              <div ref={refs.shippingMethod}>
                <CreatableSelect
                  isClearable
                  name='shippingMethod'
                  options={shippingMethodOptions}
                  value={getSelectValue(
                    shippingMethodOptions,
                    form.shippingMethod
                  )}
                  onChange={handleSelectChange("shippingMethod")}
                  classNamePrefix='rs'
                  className='mt-1 text-base sm:text-xs'
                  placeholder={t("shippingMethod")}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "2.5rem",
                      borderRadius: "0.375rem",
                      borderColor: formErrors.shippingMethod
                        ? "#ef4444"
                        : base.borderColor,
                      boxShadow: formErrors.shippingMethod
                        ? "0 0 0 1px #ef4444"
                        : base.boxShadow,
                      borderWidth: "1px",
                      direction: dir,
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.shippingMethod ? "#ef4444" : "#a3a3a3",
                      direction: dir,
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  isRtl={isRTL}
                />
              </div>
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>{t("required")}</span>{" "}
              {t("leadTime")}
              <div className='flex flex-col xs:flex-row items-start xs:items-center gap-1'>
                <input
                  name='leadTime'
                  type='number'
                  min={1}
                  value={form.leadTime}
                  onChange={handleChange}
                  className='w-full xs:w-2/3 border rounded px-3 h-10 text-base font-normal text-gray-900 sm:text-xs'
                  placeholder={t("leadTime")}
                  style={{ fontSize: "16px" }}
                />
              </div>
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>{t("required")}</span>{" "}
              {t("paymentTerms")}
              <div ref={refs.paymentTerms}>
                <CreatableSelect
                  isClearable
                  name='paymentTerms'
                  options={paymentTermsOptions}
                  value={getSelectValue(paymentTermsOptions, form.paymentTerms)}
                  onChange={handleSelectChange("paymentTerms")}
                  classNamePrefix='rs'
                  className='mt-1 text-base sm:text-xs'
                  placeholder={t("paymentTerms")}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "2.5rem",
                      borderRadius: "0.375rem",
                      borderColor: formErrors.paymentTerms
                        ? "#ef4444"
                        : base.borderColor,
                      boxShadow: formErrors.paymentTerms
                        ? "0 0 0 1px #ef4444"
                        : base.boxShadow,
                      borderWidth: "1px",
                      direction: dir,
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.paymentTerms ? "#ef4444" : "#a3a3a3",
                      direction: dir,
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                  isRtl={isRTL}
                />
              </div>
            </label>
          </div>
        </div>
        <div
          className={clsx(
            "flex items-center mt-8 mb-2",
            isRTL ? "flex-row-reverse" : "flex-row"
          )}
        >
          <input
            id='rfq-agree'
            type='checkbox'
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className={clsx(
              "w-5 h-5 border-gray-300 rounded focus:ring-primary focus:ring-2",
              isRTL ? "ml-2" : "mr-2"
            )}
            required
            dir={dir}
          />
          <label
            htmlFor='rfq-agree'
            className={clsx(
              "text-base text-gray-700 cursor-pointer",
              isRTL ? "text-right" : "text-left"
            )}
            style={{ fontFamily: "'Montserrat', Arial, Helvetica, sans-serif" }}
          >
            {t("agree")}
          </label>
        </div>
        <div className='flex flex-col sm:flex-row justify-center gap-2 mt-6'>
          <button
            type='submit'
            className={clsx(
              "bg-primary hover:bg-green-700 text-white font-semibold px-2 py-2 w-full sm:w-auto rounded shadow min-w-[120px] transition text-base",
              submitting || !agreed ? "opacity-70 cursor-not-allowed" : ""
            )}
            disabled={submitting || !agreed}
          >
            {submitting ? t("submitting") : t("submit")}
          </button>
        </div>
      </form>
      {showSuccessDialog && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
          <div className='bg-white rounded-lg shadow-xl p-8 flex flex-col items-center max-w-xs w-full'>
            <svg
              className='w-12 h-12 text-green-500 mb-2'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M5 13l4 4L19 7'
              />
            </svg>
            <h2 className='text-lg font-bold mb-2'>{t("successTitle")}</h2>
            <p className='text-center mb-4' style={{ whiteSpace: "pre-line" }}>
              {t("successMessage")}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
