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
import { toast } from "sonner";
import clsx from "clsx";
import { featuredProducts } from "@/lib/mock-data"; // 1. Import mock data

export default function RfqPage() {
  const reduxUser = {
    uid: "temp_user_id_123",
    displayName: "Guest User",
    email: "guest@example.com",
    firstName: "Guest",
    lastName: "User",
  };

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
  const [subcategoryOptions, setSubcategoryOptions] = useState([]); // Initialized as empty
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const countryOptions = useMemo(() => CountryList().getData(), []);

  const purchaseUnitOptions = [{ value: "Piece(s)", label: "Piece(s)" }];
  const sizeOptions = [
    { value: "Small", label: "Small" },
    { value: "Medium", label: "Medium" },
    { value: "Large", label: "Large" },
    { value: "Others", label: "Others" },
  ];
  const colorOptions = [
    { value: "Red", label: "Red" },
    { value: "Blue", label: "Blue" },
    { value: "Green", label: "Green" },
    { value: "Others", label: "Others" },
  ];
  const shippingMethodOptions = [
    { value: "Sea freight", label: "Sea freight" },
    { value: "Air freight", label: "Air freight" },
    { value: "Land", label: "Land" },
    { value: "Express", label: "Express" },
    { value: "Others", label: "Others" },
  ];
  const paymentTermsOptions = [
    { value: "T/T (Wire Transfer)", label: "T/T (Wire Transfer)" },
    { value: "L/C (Letter of Credit)", label: "L/C (Letter of Credit)" },
    {
      value: "D/P (Documents Against Payment)",
      label: "D/P (Documents Against Payment)",
    },
    { value: "Others", label: "Others" },
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

      const response = await fetch("/api/send-rfq-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationData),
      });
      const result = await response.json();
      if (result.success) return true;
      return false;
    } catch (error) {
      console.error("Error sending RFQ WhatsApp notification:", error);
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prods = featuredProducts;
        const categoryMap = {};
        prods.forEach((product) => {
          if (product.category) {
            const cat = product.category.trim();
            if (!categoryMap[cat]) categoryMap[cat] = new Set();
            if (product.subcategory) {
              categoryMap[cat].add(product.subcategory.trim());
            }
          }
        });
        setProducts(prods);

        // Removed "Others" from category options
        const cats = [
          ...Object.keys(categoryMap)
            .sort()
            .map((cat) => ({ value: cat, label: cat })),
        ];
        setCategoryOptions(cats);
        setSubcategoryOptions([]); // Start with no subcategories

        // Still fetch suppliers from Firestore
        const suppliersSnap = await getDocs(collection(db, "users"));
        const suppliersList = [];
        suppliersSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.role === "supplier") {
            suppliersList.push({ ...data, supplierId: data.uid });
          }
        });
        setSuppliers(suppliersList);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  // Effect to update subcategories when a category is selected
  useEffect(() => {
    // Clear subcategories if no category is selected
    if (!form.category) {
      setSubcategoryOptions([]);
      setForm((prev) => ({ ...prev, subcategory: "" }));
      return;
    }

    // Find all subcategories for the selected category
    const subcatSet = new Set();
    products.forEach((data) => {
      if (
        data.category?.trim().toLowerCase() ===
        form.category.trim().toLowerCase()
      ) {
        if (data.subcategory) {
          subcatSet.add(data.subcategory.trim());
        }
      }
    });

    // Create the options list for the dropdown, without "Others"
    const subs = [
      ...Array.from(subcatSet)
        .sort()
        .map((sub) => ({ value: sub, label: sub })),
    ];

    setSubcategoryOptions(subs);
    // Reset the selected subcategory in the form
    setForm((prev) => ({ ...prev, subcategory: "" }));
  }, [form.category, products]);

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
    setForm((prev) => ({ ...prev, [name]: option ? option.value : "" }));
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
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const focusFirstError = (errors) => {
    const firstKey = Object.keys(errors)[0];
    if (firstKey && refs[firstKey]?.current) {
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
      toast.error("You must agree to the terms.");
      return;
    }
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      focusFirstError(errors);
      toast.error("Please fill all required fields.");
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
      const imageUrls = await Promise.all(
        form.files.map(async (file) => {
          const storageRef = ref(
            storage,
            `importSaudi-images/${Date.now()}_${file.name}`
          );
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );

      const countryLabel =
        countryOptions.find((x) => x.value === form.shippingCountry)?.label ||
        form.shippingCountry;
      const { files, ...formData } = form;

      const supplierIdsInCategory = new Set(
        products
          .filter(
            (p) =>
              p.category?.trim().toLowerCase() ===
                form.category.trim().toLowerCase() && p.supplierId
          )
          .map((p) => p.supplierId)
      );

      const suppliersForCategory = suppliers
        .filter((s) => supplierIdsInCategory.has(s.uid || s.supplierId))
        .map((s) => ({
          supplierId: s.uid || s.supplierId,
          supplierName: s.name || s.companyName,
          whatsappNumber: s.companyPhone || s.phone || s.authPersonMobile,
          phoneNumber: s.companyPhone || s.phone || s.authPersonMobile,
          companyName: s.companyName,
        }))
        .filter((s) => s.phoneNumber);

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
            "You have already requested an RFQ for this product/category/supplier."
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
        };

        const rfqDocRef = await addDoc(collection(db, "rfqs"), dataToSave);
        await setDoc(chatRef, { rfqId: rfqDocRef.id }, { merge: true });

        const notificationSent = await sendWhatsAppNotification(supplier, {
          ...formData,
          shippingCountryLabel: countryLabel,
        });
        if (notificationSent) successfulNotifications++;
      }

      if (successfulNotifications > 0) {
        toast.success(
          `RFQ submitted! Notifications sent to ${successfulNotifications} supplier(s).`
        );
      } else if (suppliersForCategory.length > 0 && !duplicateFound) {
        toast.success("RFQ submitted successfully!");
        toast.warning("Could not deliver WhatsApp notifications.");
      } else if (!duplicateFound) {
        toast.success("RFQ submitted successfully!");
      }

      setShowSuccessDialog(true);
      setForm(initialFormState);
      setImagePreviews([]);
      setFormErrors({});
      setAgreed(false);
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error(`Error submitting form: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className={clsx(
        "min-h-[80vh] bg-gray-50 flex flex-col items-center py-2",
        "mt-2 md:mt-6"
      )}
    >
      <form
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
            <h1 className='text-base sm:text-lg font-bold'>
              Request for Quotation
            </h1>
          </div>
          <span className='text-gray-500 text-xs'>
            Please fill all required fields.
          </span>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-3'>
            <h2 className='text-sm font-semibold mb-2'>Product Details</h2>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>*</span> Product Name
              <input
                name='productName'
                type='text'
                value={form.productName}
                onChange={handleChange}
                ref={refs.productName}
                className={clsx(
                  "mt-1 w-full border rounded px-3 h-10 text-base font-normal text-gray-900 sm:text-xs",
                  formErrors.productName && "border-red-500"
                )}
                placeholder='Product Name'
                style={{ fontSize: "16px" }}
              />
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>*</span> Category
              <div ref={refs.category}>
                <CreatableSelect
                  isClearable
                  name='category'
                  options={categoryOptions}
                  value={getSelectValue(categoryOptions, form.category)}
                  onChange={handleSelectChange("category")}
                  classNamePrefix='rs'
                  className='mt-1 text-base sm:text-xs'
                  placeholder='Category'
                  isLoading={categoryOptions.length === 0}
                  formatCreateLabel={(inputValue) =>
                    `Add "${inputValue}" as a new category`
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
                    }),
                  }}
                />
              </div>
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>*</span> Subcategory
              <div ref={refs.subcategory}>
                <CreatableSelect
                  isClearable
                  name='subcategory'
                  options={subcategoryOptions}
                  value={getSelectValue(subcategoryOptions, form.subcategory)}
                  onChange={handleSelectChange("subcategory")}
                  classNamePrefix='rs'
                  className='mt-1 text-base sm:text-xs'
                  placeholder='Subcategory'
                  isDisabled={!form.category}
                  formatCreateLabel={(inputValue) =>
                    `Add "${inputValue}" as a new subcategory`
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
                    }),
                  }}
                />
              </div>
            </label>
            <div className='block font-semibold text-primary mb-2'>
              <label className='block font-semibold text-primary mb-2'>
                <span className='text-red-500'>*</span> Purchase Quantity
              </label>
              <div className='flex flex-row gap-2 mt-1'>
                <input
                  name='purchaseQuantity'
                  type='number'
                  min={1}
                  value={form.purchaseQuantity}
                  onChange={handleChange}
                  ref={refs.purchaseQuantity}
                  className={clsx(
                    "w-1/2 border rounded px-3 h-10 text-base font-normal text-gray-900 sm:text-xs",
                    formErrors.purchaseQuantity && "border-red-500"
                  )}
                  placeholder='Quantity'
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
                    placeholder='Unit'
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
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>*</span> Size
              <div ref={refs.size}>
                <CreatableSelect
                  isClearable
                  name='size'
                  options={sizeOptions}
                  value={getSelectValue(sizeOptions, form.size)}
                  onChange={handleSelectChange("size")}
                  classNamePrefix='rs'
                  className='mt-1 text-base sm:text-xs'
                  placeholder='Size'
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
                    }),
                  }}
                />
              </div>
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>*</span> Color
              <div ref={refs.color}>
                <CreatableSelect
                  isClearable
                  name='color'
                  options={colorOptions}
                  value={getSelectValue(colorOptions, form.color)}
                  onChange={handleSelectChange("color")}
                  classNamePrefix='rs'
                  className='mt-1 text-base sm:text-xs'
                  placeholder='Color'
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
                    }),
                  }}
                />
              </div>
            </label>
            <label className='block font-semibold text-primary'>
              <span className='text-red-500'>*</span> Product Details
              <textarea
                name='productDetails'
                value={form.productDetails}
                onChange={handleChange}
                ref={refs.productDetails}
                className={clsx(
                  "mt-1 w-full border rounded px-3 py-2 min-h-[48px] text-base font-normal text-gray-900 sm:text-xs",
                  formErrors.productDetails && "border-red-500"
                )}
                placeholder='Product Details'
                style={{ fontSize: "16px" }}
              />
            </label>
            <div className='w-full mb-2'>
              <label className='block font-semibold text-primary mb-1'>
                <span className='text-red-500'>*</span> Images
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
                    Upload
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
            <h2 className='text-sm font-semibold mb-2'>Shipping and Payment</h2>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>*</span> Shipping Country
              <div ref={refs.shippingCountry}>
                <CreatableSelect
                  isClearable
                  name='shippingCountry'
                  options={countryOptions}
                  value={getSelectValue(countryOptions, form.shippingCountry)}
                  onChange={handleSelectChange("shippingCountry")}
                  classNamePrefix='rs'
                  className='mt-1 text-base sm:text-xs'
                  placeholder='Shipping Country'
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
                    }),
                  }}
                />
              </div>
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>*</span> Shipping Method
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
                  placeholder='Shipping Method'
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
                    }),
                  }}
                />
              </div>
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>*</span> Lead Time
              <div className='flex flex-col xs:flex-row items-start xs:items-center gap-1'>
                <input
                  name='leadTime'
                  type='number'
                  min={1}
                  value={form.leadTime}
                  onChange={handleChange}
                  className='w-full xs:w-2/3 border rounded px-3 h-10 text-base font-normal text-gray-900 sm:text-xs'
                  placeholder='Lead Time'
                  style={{ fontSize: "16px" }}
                />
              </div>
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>*</span> Payment Terms
              <div ref={refs.paymentTerms}>
                <CreatableSelect
                  isClearable
                  name='paymentTerms'
                  options={paymentTermsOptions}
                  value={getSelectValue(paymentTermsOptions, form.paymentTerms)}
                  onChange={handleSelectChange("paymentTerms")}
                  classNamePrefix='rs'
                  className='mt-1 text-base sm:text-xs'
                  placeholder='Payment Terms'
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
                    }),
                  }}
                />
              </div>
            </label>
          </div>
        </div>
        <div className='flex items-center mt-8 mb-2'>
          <input
            id='rfq-agree'
            type='checkbox'
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className='w-5 h-5 border-gray-300 rounded focus:ring-primary focus:ring-2 mr-2'
            required
          />
          <label
            htmlFor='rfq-agree'
            className='text-base text-gray-700 cursor-pointer'
            style={{ fontFamily: "'Montserrat', Arial, Helvetica, sans-serif" }}
          >
            I agree to the terms and conditions.
          </label>
        </div>
        <div className='flex flex-col sm:flex-row justify-center gap-2 mt-6'>
          <button
            type='submit'
            className={clsx(
              "bg-primary hover:bg-green-700 text-white font-semibold px-2 py-2 w-full sm:w-auto rounded shadow min-w-[120px] transition text-base",
              (submitting || !agreed) && "opacity-70 cursor-not-allowed"
            )}
            disabled={submitting || !agreed}
          >
            {submitting ? "Submitting..." : "Submit RFQ"}
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
            <h2 className='text-lg font-bold mb-2'>Success!</h2>
            <p className='text-center mb-4' style={{ whiteSpace: "pre-line" }}>
              Your RFQ has been submitted successfully.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
