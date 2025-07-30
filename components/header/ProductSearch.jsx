"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
} from "../ui/command";
import { db } from "@/firebase/config";
import { getDocs, collection } from "firebase/firestore";
import { Search } from "lucide-react";

const RTL_LOCALES = ["ar"];

export default function ProductSearch() {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const inputWrapperRef = useRef(null);
  const inputRef = useRef(null);
  const cardRef = useRef(null);

  const t = useTranslations("sticky-search");
  const locale = useLocale();
  const isRtl = RTL_LOCALES.includes(locale);
  const dir = isRtl ? "rtl" : "ltr";
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      const snapshot = await getDocs(collection(db, "products"));
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        const name =
          data.productName ||
          data.productName_en ||
          data.productName_ar ||
          "Unnamed Product";
        const thumbnail = data.mainImageUrl || "/placeholder-product.png";
        return {
          id: doc.id,
          name: typeof name === "string" ? name : String(name),
          thumbnail,
        };
      });
      setProductOptions(items);
      setFilteredProducts(items);
    }
    fetchProducts();
  }, []);

  const normalize = useCallback(
    (str) =>
      typeof str === "string" ? str.toLowerCase().normalize("NFKD") : "",
    []
  );

  useEffect(() => {
    if (!productQuery) {
      setFilteredProducts(productOptions);
    } else {
      setFilteredProducts(
        productOptions.filter((item) =>
          normalize(item.name).includes(normalize(productQuery))
        )
      );
    }
  }, [productQuery, productOptions, normalize]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => {
      if (
        inputWrapperRef.current &&
        !inputWrapperRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!showMobileSearch) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowMobileSearch(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMobileSearch]);

  useEffect(() => {
    if (!showMobileSearch) return;
    const handleClick = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setShowMobileSearch(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("touchstart", handleClick);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("touchstart", handleClick);
    };
  }, [showMobileSearch]);

  const handleSelect = (selectedValue) => {
    setDropdownOpen(false);
    setShowMobileSearch(false);
    const selectedProduct = productOptions.find(
      (item) => item.name.toLowerCase() === selectedValue.toLowerCase()
    );
    if (selectedProduct?.id) {
      router.push(`/product/${selectedProduct.id}`);
    }
  };

  const handleSearch = () => {
    setDropdownOpen(false);
    setShowMobileSearch(false);
    if (productQuery.trim()) {
      const selectedProduct = productOptions.find((item) =>
        normalize(item.name).includes(normalize(productQuery.trim()))
      );
      if (selectedProduct?.id) {
        router.push(`/product/${selectedProduct.id}`);
      } else {
        router.push(`/search?query=${encodeURIComponent(productQuery.trim())}`);
      }
    }
  };

  const handleInputFocus = () => {
    if (productQuery.trim()) setDropdownOpen(true);
  };

  const handleInputChange = (e) => {
    setProductQuery(e.target.value);
    setDropdownOpen(!!e.target.value.trim());
  };

  const SearchBarContent = (
    <div dir={dir} className='relative w-full z-50' ref={inputWrapperRef}>
      <div className='flex items-center w-full border rounded-full overflow-hidden shadow-sm h-12 sm:h-10 bg-white'>
        <input
          ref={inputRef}
          dir={dir}
          type='text'
          placeholder={t("search_placeholder")}
          value={productQuery}
          onFocus={handleInputFocus}
          onChange={handleInputChange}
          className={`flex-1 px-2 sm:px-4 text-xs sm:text-sm h-full focus:outline-none ${
            isRtl ? "text-right" : "text-left"
          }`}
          autoFocus={showMobileSearch}
        />
        <button
          type='button'
          onClick={handleSearch}
          className={`bg-primary hover:bg-green-700 text-white text-xs sm:text-sm px-3 sm:px-4 flex items-center gap-1 h-full ${
            isRtl ? "rounded-l-full" : "rounded-r-full"
          }`}
          aria-label={t("search_placeholder")}
        >
          <Search size={16} />
        </button>
      </div>
      {dropdownOpen && productQuery && (
        <div
          className='absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden'
          style={{ direction: dir }}
        >
          <Command className='w-full bg-white'>
            <CommandInput
              value={productQuery}
              onValueChange={setProductQuery}
              placeholder={t("search_placeholder")}
              className='hidden'
            />
            <CommandList className='max-h-64 sm:max-h-[400px] overflow-y-auto'>
              {filteredProducts.length > 0 ? (
                <CommandGroup heading={t("productsHeading")}>
                  {filteredProducts.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      onSelect={handleSelect}
                      className={`flex items-center ${
                        isRtl ? "flex-row-reverse" : "flex-row"
                      } gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:bg-[#2c6449]/10 transition`}
                    >
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className='w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0'
                      />
                      <span className='text-xs sm:text-base text-gray-700 truncate'>
                        {product.name}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <div className='flex flex-col items-center justify-center p-4 sm:p-6 gap-1 sm:gap-2 text-center'>
                  <img
                    src='/no-results-search.svg'
                    alt='No results'
                    className='w-16 h-16 sm:w-24 sm:h-24 object-contain'
                  />
                  <p className='text-gray-500 text-xs sm:text-sm'>
                    {t("noResults")}
                  </p>
                </div>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className='flex sm:hidden'>
        <button
          type='button'
          className='p-2 rounded-full text-primary'
          onClick={() => setShowMobileSearch(true)}
          aria-label='Open product search'
        >
          <Search size={22} />
        </button>
      </div>
      {showMobileSearch && (
        <div className='fixed inset-0 z-50 flex items-start justify-center sm:hidden bg-transparent backdrop-blur-lg'>
          <div
            ref={cardRef}
            className='bg-primary w-full mx-2 mt-12 p-3 rounded-lg shadow-lg relative'
          >
            {SearchBarContent}
          </div>
        </div>
      )}
      <div className='hidden sm:block w-full'>{SearchBarContent}</div>
    </>
  );
}
