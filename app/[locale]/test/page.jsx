"use client";
import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSelector } from "react-redux";
// import { db, storage } from "@/lib/firebase";
// import {
//   collection,
//   addDoc,
//   getDocs,
//   orderBy,
//   query,
//   serverTimestamp,
// } from "firebase/firestore";
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import Image from "next/image";
// import { useDropzone } from "react-dropzone";
// import { ArrowLeft, Plus, Trash2 } from "lucide-react";
// import clsx from "clsx";

// Mock components for demo - replace with your actual UI components
const Input = ({ className, ...props }) => (
  <input
    className={`border rounded px-3 py-2 text-sm ${className || ""}`}
    {...props}
  />
);

const Button = ({ children, className, variant, size, ...props }) => (
  <button
    className={`px-4 py-2 rounded font-medium ${
      variant === "outline"
        ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        : "bg-blue-600 text-white hover:bg-blue-700"
    } ${size === "sm" ? "px-2 py-1 text-sm" : ""} ${className || ""}`}
    {...props}
  >
    {children}
  </button>
);

const Label = ({ children, className, ...props }) => (
  <label
    className={`block text-sm font-medium text-gray-700 ${className || ""}`}
    {...props}
  >
    {children}
  </label>
);

// Mock toast for demo
const toast = {
  error: (message) => alert(`Error: ${message}`),
  success: (message) => alert(`Success: ${message}`),
};

// Mock Image component
const Image = ({ src, alt, width, height, className, onLoad, ...props }) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={className}
    onLoad={onLoad}
    {...props}
  />
);

// Mock useDropzone
const useDropzone = ({ accept, onDrop, multiple, maxFiles }) => ({
  getRootProps: () => ({
    onClick: () => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = multiple;
      input.accept = Object.keys(accept).join(",");
      input.onchange = (e) => onDrop(Array.from(e.target.files));
      input.click();
    },
  }),
  getInputProps: () => ({}),
  isDragActive: false,
});

// Mock icons
const ArrowLeft = ({ className }) => <span className={className}>←</span>;
const Plus = ({ className }) => <span className={className}>+</span>;
const Trash2 = ({ className }) => <span className={className}>🗑</span>;

// Mock clsx
const clsx = (...classes) => classes.filter(Boolean).join(" ");

// Helper to make file names safe for Firebase Storage
const safeFileName = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

export default function AddProduct({ onBack }) {
  // const router = useRouter();
  // const authUser = useSelector((state) => state.auth.user);

  // Mock data for demo
  const router = { back: () => console.log("Going back...") };
  const authUser = { uid: "demo-user-123" };

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    tags: [],
    status: "active",
    shippingClass: "",
    images: [],
    weight: "",
    length: "",
    width: "",
    height: "",
    priceTiers: [
      {
        minQty: 1,
        maxQty: "", // Empty means unlimited
        price: "",
        tierName: "Base Price",
      },
    ],
    stock: "",
    sku: "",
    barcode: "",
  });

  const [mainImages, setMainImages] = useState([]);
  const [mainPreviews, setMainPreviews] = useState([]);
  const [variants, setVariants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories from Firestore on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        // Mock categories for demo - replace with actual Firebase call
        const mockCategories = [
          { id: "1", name: "Electronics", order: 1 },
          { id: "2", name: "Clothing", order: 2 },
          { id: "3", name: "Home & Garden", order: 3 },
          { id: "4", name: "Sports", order: 4 },
          { id: "5", name: "Books", order: 5 },
        ];

        setCategoryOptions(mockCategories);

        // Actual Firebase code (commented out):
        // const q = query(collection(db, "categories"), orderBy("order"));
        // const snap = await getDocs(q);
        // setCategoryOptions(
        //   snap.docs.map((doc) => ({
        //     id: doc.id,
        //     ...doc.data(),
        //   }))
        // );
      } catch (err) {
        setCategoryOptions([]);
        toast.error("Failed to load categories");
      }
      setLoadingCategories(false);
    }
    fetchCategories();
  }, []);

  const shippingClassOptions = [
    "Standard",
    "Fragile",
    "Bulky",
    "Liquid",
    "Other",
  ];

  // Pricing Tiers Functions
  const addPriceTier = () => {
    const lastTier = form.priceTiers[form.priceTiers.length - 1];
    const newMinQty = lastTier?.maxQty
      ? parseInt(lastTier.maxQty) + 1
      : (lastTier?.minQty || 0) + 10;

    setForm((prev) => ({
      ...prev,
      priceTiers: [
        ...prev.priceTiers,
        {
          minQty: newMinQty,
          maxQty: "",
          price: "",
          tierName: `Tier ${prev.priceTiers.length + 1}`,
        },
      ],
    }));
  };

  const removePriceTier = (index) => {
    if (form.priceTiers.length <= 1) {
      toast.error("At least one pricing tier is required");
      return;
    }
    setForm((prev) => ({
      ...prev,
      priceTiers: prev.priceTiers.filter((_, i) => i !== index),
    }));
  };

  const updatePriceTier = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      priceTiers: prev.priceTiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      ),
    }));
  };

  const validatePriceTiers = () => {
    const errors = [];
    const sortedTiers = [...form.priceTiers].sort(
      (a, b) => a.minQty - b.minQty
    );

    for (let i = 0; i < sortedTiers.length; i++) {
      const tier = sortedTiers[i];

      // Check required fields
      if (!tier.price || tier.price <= 0) {
        errors.push(
          `Tier ${i + 1}: Price is required and must be greater than 0`
        );
      }

      if (!tier.minQty || tier.minQty <= 0) {
        errors.push(
          `Tier ${
            i + 1
          }: Minimum quantity is required and must be greater than 0`
        );
      }

      // Check max quantity is greater than min quantity
      if (tier.maxQty && parseInt(tier.maxQty) <= parseInt(tier.minQty)) {
        errors.push(
          `Tier ${
            i + 1
          }: Maximum quantity must be greater than minimum quantity`
        );
      }

      // Check for overlapping ranges
      if (i > 0) {
        const prevTier = sortedTiers[i - 1];
        if (
          prevTier.maxQty &&
          parseInt(tier.minQty) <= parseInt(prevTier.maxQty)
        ) {
          errors.push(
            `Tier ${i + 1}: Quantity ranges cannot overlap with previous tier`
          );
        }
      }
    }

    return errors;
  };

  const onMainDrop = (acceptedFiles) => {
    const previews = acceptedFiles.map((file) => URL.createObjectURL(file));
    setMainImages((prev) => [...prev, ...acceptedFiles]);
    setMainPreviews((prev) => [...prev, ...previews]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: onMainDrop,
    multiple: true,
    maxFiles: 8,
  });

  const handleVariantImage = (idx, file) => {
    const preview = file ? URL.createObjectURL(file) : null;
    setVariants((prev) =>
      prev.map((v, i) =>
        i === idx ? { ...v, image: file, imagePreview: preview } : v
      )
    );
  };

  const handleVariantChange = (idx, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  };

  const addVariant = () =>
    setVariants((prev) => [
      ...prev,
      {
        sku: "",
        barcode: "",
        option1: "",
        option2: "",
        price: "",
        stock: "",
        image: null,
        imagePreview: null,
        weight: "",
        length: "",
        width: "",
        height: "",
      },
    ]);

  const removeVariant = (idx) =>
    setVariants((prev) => prev.filter((_, i) => i !== idx));

  const handleRemoveMainImage = (idx) => {
    setMainImages((prev) => prev.filter((_, i) => i !== idx));
    setMainPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---- HANDLE SUBMIT ----
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.name || !form.category) {
      toast.error("Product name and category required.");
      return;
    }

    if (!authUser?.uid) {
      toast.error("Login as seller to add products.");
      return;
    }

    if (mainImages.length === 0) {
      toast.error("Please upload at least one product image.");
      return;
    }

    // Validate pricing tiers
    const tierErrors = validatePriceTiers();
    if (tierErrors.length > 0) {
      toast.error(tierErrors[0]); // Show first error
      return;
    }

    setSaving(true);

    try {
      // Mock success for demo - replace with actual Firebase upload
      console.log("Form data to be saved:", {
        ...form,
        mainImages: mainImages.map((f) => f.name),
        variants: variantsWithUrls,
        priceTiers,
        sellerId: authUser.uid,
      });

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Product added successfully!");

      // Actual Firebase code (commented out):
      /*
      // --- Upload main images ---
      const mainImageUrls = [];
      for (let i = 0; i < mainImages.length; ++i) {
        const file = mainImages[i];
        const refPath = `products/${
          authUser.uid
        }/main_${Date.now()}_${i}_${safeFileName(file.name)}`;
        const storageRef = ref(storage, refPath);
        const snap = await uploadBytesResumable(storageRef, file);
        const url = await getDownloadURL(snap.ref);
        mainImageUrls.push(url);
      }

      // --- Upload variant images (if any) ---
      const variantsWithUrls = await Promise.all(
        variants.map(async (variant, idx) => {
          let imageUrl = "";
          if (variant.image) {
            const refPath = `products/${
              authUser.uid
            }/variant_${Date.now()}_${idx}_${safeFileName(variant.image.name)}`;
            const storageRef = ref(storage, refPath);
            const snap = await uploadBytesResumable(storageRef, variant.image);
            imageUrl = await getDownloadURL(snap.ref);
          }
          return {
            ...variant,
            price: Number(variant.price || 0),
            stock: Number(variant.stock || 0),
            weight: Number(variant.weight || form.weight || 0),
            length: Number(variant.length || form.length || 0),
            width: Number(variant.width || form.width || 0),
            height: Number(variant.height || form.height || 0),
            image: imageUrl,
          };
        })
      );

      // Process pricing tiers
      const priceTiers = form.priceTiers
        .filter((t) => t && t.price !== "" && t.minQty !== "")
        .map((t) => ({
          tierName: t.tierName || "Price Tier",
          minQty: Number(t.minQty),
          maxQty: t.maxQty ? Number(t.maxQty) : null, // null means unlimited
          price: Number(t.price),
        }))
        .sort((a, b) => a.minQty - b.minQty); // Sort by minimum quantity

      // --- Firestore save ---
      await addDoc(collection(db, "products"), {
        ...form,
        category: form.category,
        tags: form.tags,
        price: priceTiers[0]?.price || 0, // Base price from first tier
        priceTiers,
        stock: form.stock !== "" ? Number(form.stock) : 0,
        images: mainImageUrls,
        mainImage: mainImageUrls[0],
        variants: variantsWithUrls,
        sellerId: authUser.uid,
        createdAt: serverTimestamp(),
        status: form.status,
        sku: form.sku || "",
        barcode: form.barcode || "",
        weight: form.weight !== "" ? Number(form.weight) : 0,
        length: form.length !== "" ? Number(form.length) : 0,
        width: form.width !== "" ? Number(form.width) : 0,
        height: form.height !== "" ? Number(form.height) : 0,
      });
      */

      // router.back();
    } catch (err) {
      toast.error("Failed to add product.");
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className='max-w-2xl mx-auto bg-white rounded-xl shadow p-4'>
      <div className='mb-2 flex flex-col items-start'>
        <button
          type='button'
          onClick={onBack || (() => router.back())}
          className='flex items-center gap-1 text-blue-600 text-xs font-medium hover:underline mb-2'
        >
          <ArrowLeft className='w-4 h-4' />
          Back to Products
        </button>
        <h2 className='text-lg font-bold ml-1'>Add New Product</h2>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* BASIC INFO */}
        <div className='grid grid-cols-1 gap-4'>
          <Input
            name='name'
            placeholder='Product Name*'
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <select
            name='category'
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            className='w-full border rounded px-3 py-2 text-sm'
            required
          >
            <option value=''>Select a Category*</option>
            {loadingCategories ? (
              <option disabled>Loading...</option>
            ) : categoryOptions.length === 0 ? (
              <option disabled>No categories found</option>
            ) : (
              categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
        </div>

        <textarea
          name='description'
          placeholder='Product Description'
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          className='w-full border rounded px-3 py-2 min-h-[80px] text-sm'
        />

        {/* ENHANCED PRICING TIERS */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <Label className='font-semibold text-base'>Pricing Tiers</Label>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={addPriceTier}
              className='flex items-center gap-2'
            >
              <Plus className='w-4 h-4' />
              Add Tier
            </Button>
          </div>

          <div className='space-y-4'>
            {form.priceTiers.map((tier, index) => (
              <div key={index} className='border rounded-lg p-4 bg-gray-50'>
                <div className='flex items-center justify-between mb-3'>
                  <Input
                    placeholder='Tier Name (e.g., Wholesale, Bulk)'
                    value={tier.tierName}
                    onChange={(e) =>
                      updatePriceTier(index, "tierName", e.target.value)
                    }
                    className='flex-1 mr-2'
                  />
                  {form.priceTiers.length > 1 && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => removePriceTier(index)}
                      className='text-red-600 hover:text-red-700'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <div>
                    <Label className='text-xs text-gray-600 mb-1 block'>
                      Min Quantity*
                    </Label>
                    <Input
                      type='number'
                      min='1'
                      placeholder='Min Qty'
                      value={tier.minQty}
                      onChange={(e) =>
                        updatePriceTier(index, "minQty", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label className='text-xs text-gray-600 mb-1 block'>
                      Max Quantity (Empty means Unlimited)
                    </Label>
                    <Input
                      type='number'
                      min={tier.minQty || 1}
                      placeholder='Max Qty (Optional)'
                      value={tier.maxQty}
                      onChange={(e) =>
                        updatePriceTier(index, "maxQty", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label className='text-xs text-gray-600 mb-1 block'>
                      Price per Unit*
                    </Label>
                    <Input
                      type='number'
                      min='0'
                      step='0.01'
                      placeholder='Price'
                      value={tier.price}
                      onChange={(e) =>
                        updatePriceTier(index, "price", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* Tier Preview */}
                <div className='mt-2 text-xs text-gray-600'>
                  {tier.minQty && tier.price && (
                    <span>
                      {tier.minQty} {tier.maxQty ? `- ${tier.maxQty}` : "+"}{" "}
                      units: ${parseFloat(tier.price).toFixed(2)} each
                      {tier.maxQty && (
                        <span className='ml-2 text-green-600'>
                          (Total: $
                          {(
                            parseFloat(tier.price) * parseInt(tier.maxQty)
                          ).toFixed(2)}
                          )
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          {form.priceTiers.some((t) => t.price && t.minQty) && (
            <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
              <Label className='text-sm font-medium text-blue-800 block mb-2'>
                Pricing Summary:
              </Label>
              <div className='text-sm text-blue-700 space-y-1'>
                {form.priceTiers
                  .filter((t) => t.price && t.minQty)
                  .sort((a, b) => parseInt(a.minQty) - parseInt(b.minQty))
                  .map((tier, idx) => (
                    <div key={idx}>
                      • {tier.tierName}: {tier.minQty}
                      {tier.maxQty ? `-${tier.maxQty}` : "+"} units @ $
                      {parseFloat(tier.price).toFixed(2)} each
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* STOCK & IDENTIFIERS */}
        <div className='grid grid-cols-1 gap-4'>
          <Label className='font-semibold'>Stock & Identifiers</Label>
          <Input
            name='stock'
            placeholder='Total Stock*'
            type='number'
            min={0}
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          />
          <Input
            name='sku'
            placeholder='SKU (Optional)'
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
          />
          <Input
            name='barcode'
            placeholder='Barcode (Optional)'
            value={form.barcode}
            onChange={(e) =>
              setForm((f) => ({ ...f, barcode: e.target.value }))
            }
          />
        </div>

        {/* SHIPPING & DIMENSIONS */}
        <div className='grid grid-cols-1 gap-4'>
          <Label className='font-semibold'>Shipping & Dimensions</Label>
          <select
            name='shippingClass'
            value={form.shippingClass}
            onChange={(e) =>
              setForm((f) => ({ ...f, shippingClass: e.target.value }))
            }
            className='w-full border rounded px-3 py-2 text-sm'
          >
            <option value=''>Select Shipping Class (Optional)</option>
            {shippingClassOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className='grid grid-cols-2 gap-2'>
            <Input
              name='weight'
              placeholder='Weight (kg)'
              type='number'
              min={0}
              value={form.weight}
              onChange={(e) =>
                setForm((f) => ({ ...f, weight: e.target.value }))
              }
            />
            <Input
              name='length'
              placeholder='Length (cm)'
              type='number'
              min={0}
              value={form.length}
              onChange={(e) =>
                setForm((f) => ({ ...f, length: e.target.value }))
              }
            />
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <Input
              name='width'
              placeholder='Width (cm)'
              type='number'
              min={0}
              value={form.width}
              onChange={(e) =>
                setForm((f) => ({ ...f, width: e.target.value }))
              }
            />
            <Input
              name='height'
              placeholder='Height (cm)'
              type='number'
              min={0}
              value={form.height}
              onChange={(e) =>
                setForm((f) => ({ ...f, height: e.target.value }))
              }
            />
          </div>
        </div>

        {/* IMAGES */}
        <div>
          <Label className='block font-semibold mb-2'>Product Images*</Label>
          <div
            {...getRootProps()}
            className={clsx(
              "border-2 border-dashed rounded-lg py-6 px-4 text-center bg-gray-50 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors",
              isDragActive && "border-blue-500 bg-blue-50"
            )}
          >
            <input {...getInputProps()} />
            <p className='text-sm text-gray-500'>
              Drag & drop images here, or click to select files. (Max 8)
            </p>
            <div className='flex gap-2 mt-4 flex-wrap justify-center'>
              {mainPreviews.map((src, i) => (
                <div key={i} className='relative group'>
                  <Image
                    src={src}
                    alt={`Preview ${i + 1}`}
                    width={80}
                    height={80}
                    className='rounded border object-cover'
                    onLoad={() => URL.revokeObjectURL(src)}
                  />
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMainImage(i);
                    }}
                    className='absolute top-0 right-0 m-1 bg-red-600 text-white rounded-full p-1 leading-none text-xs w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* VARIANTS */}
        <div>
          <div className='flex items-center justify-between mb-2'>
            <Label className='font-semibold'>
              Variants (e.g., Color, Size)
            </Label>
            <button
              type='button'
              className='text-blue-600 text-sm font-bold'
              onClick={addVariant}
            >
              + Add Variant
            </button>
          </div>
          {variants.length > 0 && (
            <div className='space-y-3'>
              {variants.map((variant, i) => (
                <div
                  key={i}
                  className='border rounded p-3 bg-gray-50 space-y-3'
                >
                  <div className='grid grid-cols-1 gap-3'>
                    <Input
                      placeholder='Option 1 (e.g. Color)'
                      value={variant.option1}
                      onChange={(e) =>
                        handleVariantChange(i, "option1", e.target.value)
                      }
                    />
                    <Input
                      placeholder='Option 2 (e.g. Size)'
                      value={variant.option2}
                      onChange={(e) =>
                        handleVariantChange(i, "option2", e.target.value)
                      }
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    <Input
                      placeholder='Price'
                      type='number'
                      min={0}
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(i, "price", e.target.value)
                      }
                    />
                    <Input
                      placeholder='Stock'
                      type='number'
                      min={0}
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(i, "stock", e.target.value)
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between pt-1'>
                    <div className='flex items-center gap-2'>
                      {variant.imagePreview && (
                        <Image
                          src={variant.imagePreview}
                          alt='Variant'
                          width={40}
                          height={40}
                          className='rounded border object-cover'
                        />
                      )}
                      <input
                        type='file'
                        accept='image/*'
                        onChange={(e) =>
                          handleVariantImage(i, e.target.files[0])
                        }
                        className='text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                      />
                    </div>
                    <button
                      type='button'
                      className='text-xs text-red-600 font-medium hover:underline'
                      onClick={() => removeVariant(i)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <Button type='submit' className='w-full h-10' disabled={saving}>
          {saving ? "Saving..." : "Add Product"}
        </Button>
      </form>
    </div>
  );
}
