"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import CreatableSelect from "react-select/creatable";
import CountryList from "react-select-country-list";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/firebase/config";
import PhoneField from "@/components/global/PhoneField";
import { toast } from "sonner";

export default function ImportFromSaudiPage() {
  const initialFormState = {
    productName: "",
    category: "",
    subcategory: "",
    size: "",
    color: "",
    shippingCountry: "",
    purchaseQuantity: "",
    purchaseUnit: "",
    productDetails: "",
    shippingMethod: "",
    destinationPort: "",
    leadTime: "",
    paymentTerms: "",
    files: [],
    representativeName: "",
    companyName: "",
    email: "",
    phone: "",
    phoneCountry: "+966",
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
    representativeName: useRef(null),
    companyName: useRef(null),
    email: useRef(null),
    phone: useRef(null),
    phoneCountry: useRef(null),
    paymentTerms: useRef(null),
    files: useRef(null),
  };

  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([
    { value: "Others", label: "Others" },
  ]);
  const [products, setProducts] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const countryOptions = useMemo(() => CountryList().getData(), []);

  const purchaseUnitOptions = [
    { value: "Piece(s)", label: "Piece(s)" },
    { value: "Ton(s)", label: "Ton(s)" },
    { value: "Kg(s)", label: "Kg(s)" },
    { value: "Others", label: "Others" },
  ];
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
    if (!form.representativeName?.trim()) errors.representativeName = true;
    if (!form.companyName?.trim()) errors.companyName = true;
    if (!form.email?.trim() || !/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(form.email))
      errors.email = true;
    if (!form.phone?.trim()) errors.phone = true;
    if (!form.phoneCountry?.trim()) errors.phoneCountry = true;
    if (!form.paymentTerms?.trim()) errors.paymentTerms = true;
    if (!form.files?.length) errors.files = true;
    return errors;
  }

  useEffect(() => {
    const fetchProducts = async () => {
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
      const cats = [
        ...Object.keys(categoryMap)
          .sort()
          .map((cat) => ({ value: cat, label: cat })),
        { value: "Others", label: "Others" },
      ];
      setCategoryOptions(cats);
      setSubcategoryOptions([{ value: "Others", label: "Others" }]);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!form.category || form.category === "Others") {
      setSubcategoryOptions([{ value: "Others", label: "Others" }]);
      setForm((prev) => ({ ...prev, subcategory: "Others" }));
      return;
    }
    if (products.length === 0) {
      setSubcategoryOptions([{ value: "Others", label: "Others" }]);
      setForm((prev) => ({ ...prev, subcategory: "Others" }));
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
      { value: "Others", label: "Others" },
    ];
    setSubcategoryOptions(subs);
    setForm((prev) => ({ ...prev, subcategory: "Others" }));
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
    const errors = validateForm(form);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      focusFirstError(errors);
      toast.error("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
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
      const dataToSave = {
        ...formData,
        shippingCountryLabel: countryLabel,
        imageUrls,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "importSaudi"), dataToSave);
      await fetch("/api/send-form-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, imageUrls }),
      });
      toast.success("Submitted successfully!");
      setShowSuccessDialog(true);
      setForm(initialFormState);
      setImagePreviews([]);
      setFormErrors({});
    } catch (err) {
      toast.error("Error submitting form: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      dir='ltr'
      lang='en'
      style={{
        fontFamily: "'Montserrat', Arial, Helvetica, sans-serif",
        direction: "ltr",
      }}
      className='min-h-[80vh] bg-gray-50 flex flex-col items-center py-2 mt-2 md:mt-6'
    >
      <form
        dir='ltr'
        lang='en'
        onSubmit={handleSubmit}
        className='w-full max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-5xl bg-white shadow border border-gray-200 rounded-none md:rounded-lg p-3 sm:p-5 md:p-7 text-xs'
      >
        <div className='mb-4 border-b pb-3'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1'>
            <h1 className='text-base sm:text-lg font-bold'>
              Tell suppliers what you need
            </h1>
          </div>
          <span className='text-gray-500 text-xs'>
            The more specific your information, the faster response you will
            get.
          </span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                className={`mt-1 w-full border rounded px-3 h-10 text-base font-normal text-gray-900 sm:text-xs ${
                  formErrors.productName ? "border-red-500" : ""
                }`}
                placeholder='Enter a specific product name'
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
                  placeholder='Select or type a category'
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
                      borderWidth: "1px",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.category ? "#ef4444" : "#a3a3a3",
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
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
                  placeholder='Select or type a subcategory'
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
                      borderWidth: "1px",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.subcategory ? "#ef4444" : "#a3a3a3",
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
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
                  className={`w-1/2 border rounded px-3 h-10 text-base font-normal text-gray-900 sm:text-xs ${
                    formErrors.purchaseQuantity ? "border-red-500" : ""
                  }`}
                  placeholder='Qty'
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
                        borderWidth: "1px",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: formErrors.purchaseUnit ? "#ef4444" : "#a3a3a3",
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
                  placeholder='Select or type a size'
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
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.size ? "#ef4444" : "#a3a3a3",
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
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
                  placeholder='Select or type a color'
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
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.color ? "#ef4444" : "#a3a3a3",
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
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
                className={`mt-1 w-full border rounded px-3 py-2 min-h-[48px] text-base font-normal text-gray-900 sm:text-xs ${
                  formErrors.productDetails ? "border-red-500" : ""
                }`}
                placeholder='Describe your product. Include color, material, size, etc.'
                style={{ fontSize: "16px" }}
              />
            </label>

            <div className='w-full mb-2'>
              <label className='block font-semibold text-primary mb-1'>
                <span className='text-red-500'>*</span> Product Images
                <div className='flex gap-2 items-center mt-1 mb-2'>
                  <label
                    htmlFor='image-upload'
                    className={`inline-flex items-center px-3 h-10 bg-white border 
          ${formErrors.files ? "border-red-500" : "border-primary"} 
          text-primary rounded shadow-sm font-semibold cursor-pointer 
          hover:bg-primary hover:text-white transition duration-150 text-xs`}
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
                    Upload Product Images
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
            <h2 className='text-sm font-semibold mb-2'>Contact Information</h2>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>*</span> Representative Name
              <input
                type='text'
                name='representativeName'
                value={form.representativeName}
                onChange={handleChange}
                ref={refs.representativeName}
                className={`mt-1 w-full border rounded px-3 h-10 text-base font-normal text-gray-900 sm:text-xs ${
                  formErrors.representativeName ? "border-red-500" : ""
                }`}
                placeholder='Enter your name'
                style={{ fontSize: "16px" }}
              />
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>*</span> Company Name
              <input
                type='text'
                name='companyName'
                value={form.companyName}
                onChange={handleChange}
                ref={refs.companyName}
                className={`mt-1 w-full border rounded px-3 h-10 text-base font-normal text-gray-900 sm:text-xs ${
                  formErrors.companyName ? "border-red-500" : ""
                }`}
                placeholder='Enter company name'
                style={{ fontSize: "16px" }}
              />
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>*</span> Email
              <input
                type='email'
                name='email'
                value={form.email}
                onChange={handleChange}
                ref={refs.email}
                className={`mt-1 w-full border rounded px-3 h-10 text-base font-normal text-gray-900 sm:text-xs ${
                  formErrors.email ? "border-red-500" : ""
                }`}
                placeholder='Enter email'
                style={{ fontSize: "16px" }}
              />
            </label>
            <label className='block font-semibold text-primary mb-2'>
              <span className='text-red-500'>*</span> Phone Number
              <div ref={refs.phone}>
                <PhoneField
                  phoneCountry={form.phoneCountry}
                  phone={form.phone}
                  setPhoneCountry={(val) =>
                    setForm((prev) => ({ ...prev, phoneCountry: val }))
                  }
                  setPhone={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      phone: typeof val === "string" ? val : val.target.value,
                    }))
                  }
                />
              </div>
            </label>
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
                  placeholder='Select or type a country'
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
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.shippingCountry ? "#ef4444" : "#a3a3a3",
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
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
                  placeholder='Select or type a method'
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
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.shippingMethod ? "#ef4444" : "#a3a3a3",
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                />
              </div>
            </label>
            <label className='block font-semibold text-primary mb-2'>
              Destination Port
              <input
                name='destinationPort'
                type='text'
                value={form.destinationPort}
                onChange={handleChange}
                className='mt-1 w-full border rounded px-3 h-10 text-base font-normal text-gray-900 sm:text-xs'
                style={{ fontSize: "16px" }}
              />
            </label>
            <label className='block font-semibold text-primary mb-2'>
              Lead Time
              <div className='flex flex-col xs:flex-row items-start xs:items-center gap-1'>
                <input
                  name='leadTime'
                  type='number'
                  min={1}
                  value={form.leadTime}
                  onChange={handleChange}
                  className='w-full xs:w-2/3 border rounded px-3 h-10 text-base font-normal text-gray-900 sm:text-xs'
                  placeholder='Days'
                  style={{ fontSize: "16px" }}
                />
                <span className='text-gray-500 text-xs xs:ml-1'>
                  day(s) after supplier receives the initial payment.
                </span>
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
                  placeholder='Select or type payment terms'
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
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: formErrors.paymentTerms ? "#ef4444" : "#a3a3a3",
                    }),
                  }}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : null
                  }
                />
              </div>
            </label>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row justify-center gap-2 mt-6'>
          <button
            type='submit'
            className={`bg-primary hover:bg-green-700 text-white font-semibold px-2 py-2 w-full sm:w-auto rounded shadow min-w-[120px] transition text-base ${
              submitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
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
            <h2 className='text-lg font-bold mb-2'>Request Submitted!</h2>
            <p className='text-center mb-4'>
              Thank you for your inquiry.
              <br />
              Redirecting to homepage...
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
