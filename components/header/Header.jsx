"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Send,
  MessageSquare,
  ShoppingCart,
  MapPin,
  Globe,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "@/hooks/useAuth";
import { logout } from "@/store/authSlice";
import LanguageSelector from "@/components/header/LanguageSelector";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";
import MobileMenuSheet from "@/components/header/MobileMenuSheet";

// Dynamically load ProductSearch with no SSR
const ProductSearch = dynamic(
  () => import("@/components/header/ProductSearch"),
  { ssr: false }
);

export default function Header() {
  const t = useTranslations("header");
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, user } = useAuth();
  const userRole = user?.role;
  const displayName = user?.displayName || user?.email || t("signin");
  const cartCount = useSelector((state) => state.cart.count);

  // --------------- LOCATION LOGIC ---------------
  const [coords, setCoords] = useState(null);
  const [locError, setLocError] = useState(null);
  const [locationName, setLocationName] = useState(null);

  // Load from localStorage (guarded for SSR)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedCoords = localStorage.getItem("coords");
        const storedName = localStorage.getItem("locationName");
        if (storedCoords) setCoords(JSON.parse(storedCoords));
        if (storedName) setLocationName(storedName);
      } catch {}
    }
  }, []);

  // Get geolocation if not loaded
  useEffect(() => {
    if (coords || locationName || typeof window === "undefined") return;

    if (!navigator.geolocation) {
      setLocError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const geo = { lat: latitude.toFixed(3), lng: longitude.toFixed(3) };
        setCoords(geo);
        localStorage.setItem("coords", JSON.stringify(geo));
      },
      (error) => setLocError(error.message)
    );
  }, [coords, locationName]);

  // --- UPDATED Reverse geocode logic ---
  useEffect(() => {
    if (!coords || locationName) return;
    const { lat, lng } = coords;
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Reverse geocoding failed");
        return res.json();
      })
      .then((data) => {
        const address = data.address || {};

        // More robust logic to find the city and region/state
        const city =
          address.city ||
          address.town ||
          address.state_district ||
          address.county;
        const region = address.state || address.province || address.region;

        let finalName = null;
        if (city && region) {
          // If the city and region are the same (e.g., "Riyadh, Riyadh Region"), just show the city.
          if (region.includes(city)) {
            finalName = region;
          } else {
            finalName = `${city}, ${region}`;
          }
        } else if (city) {
          finalName = city;
        } else if (region) {
          finalName = region;
        } else if (data.display_name) {
          // Fallback to the full display name if we can't find anything better
          finalName = data.display_name;
        }

        if (finalName) {
          setLocationName(finalName);
          localStorage.setItem("locationName", finalName);
        } else {
          setLocError("Name not found");
        }
      })
      .catch(() => setLocError("Reverse geocoding error"));
  }, [coords, locationName]);

  // For location display
  const renderLocationText = useCallback(() => {
    if (locationName) return locationName;
    if (locError) return "Unavailable";
    return "Detecting…";
  }, [locationName, locError]);

  // --------------- USER MENU LOGIC ---------------
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const onLogout = async () => {
    const role = userRole;
    await dispatch(logout()).unwrap();
    setUserMenuOpen(false);
    window.location.href = role === "admin" ? "/admin-login" : "/user-login";
  };

  const isRtl = false;

  if (loading) {
    return (
      <header className='w-full bg-white shadow'>
        <div className='p-4 text-center text-sm text-muted-foreground'>
          {t("loading")}
        </div>
      </header>
    );
  }

  return (
    <header className='w-full bg-white/90 backdrop-blur-md shadow-sm z-50'>
      <div className='max-w-full mx-auto flex items-center justify-between px-4 md:px-6 h-26'>
        {/* Left: Logo + (mobile) search */}
        <div className='flex items-center'>
          <Link href='/' className='flex-shrink-0' aria-label='Home'>
            <Image
              src='/logo.svg'
              alt='logo'
              width={260} // Intrinsic width of the image file
              height={96} // Intrinsic height of the image file
              className='h-auto w-48 md:w-64' // Responsive classes for display size
              priority
            />
          </Link>
          <div className='md:hidden ml-1 flex items-center'>
            <ProductSearch />
          </div>
        </div>
        {/* Center: Desktop search bar */}
        <div className='hidden md:flex flex-1 mx-6'>
          <ProductSearch />
        </div>
        {/* Right: Menus */}
        <div className='flex items-center'>
          {/* Mobile menu and language selector */}
          <div className='md:hidden'>
            <MobileMenuSheet
              user={user}
              userRole={userRole}
              displayName={displayName}
              cartCount={cartCount}
              onLogout={onLogout}
              onDashboard={() => {
                router.push(
                  userRole === "buyer"
                    ? "/buyer-dashboard"
                    : userRole === "supplier"
                    ? "/supplier-dashboard"
                    : "/admin-dashboard"
                );
              }}
              onLogin={() => router.push("/user-login")}
              onRfq={() => router.push("/rfq")}
              onImportFromSaudi={() => router.push("/import-from-saudi")}
              onMessages={() => router.push("/buyer-messages")}
              onCart={() => router.push("/cart")}
              onAboutUs={() => router.push("/about-us")}
              renderLocationText={renderLocationText}
              isRtl={isRtl}
            />
          </div>
          {/* Desktop: full menu */}
          <div className='hidden lg:flex items-start space-x-8 ml-6 text-[#004d40]'>
            <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  className='flex flex-col items-center hover:text-green-800'
                  aria-label={user ? t("account") : t("signin")}
                >
                  <User size={18} />
                  <span className='text-sm mt-1'>{displayName}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align='end' className='w-40 text-sm z-[9999]'>
                {user ? (
                  <>
                    <Button
                      variant='ghost'
                      className='w-full justify-start'
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (userRole === "buyer")
                          router.push("/buyer-dashboard");
                        else if (userRole === "supplier")
                          router.push("/supplier-dashboard");
                        else router.push("/admin-dashboard");
                      }}
                    >
                      {t("dashboard")}
                    </Button>
                    <Button
                      variant='ghost'
                      className='w-full justify-start'
                      onClick={onLogout}
                    >
                      {t("logout")}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant='ghost'
                    className='w-full justify-start'
                    onClick={() => {
                      setUserMenuOpen(false);
                      router.push("/user-login");
                    }}
                  >
                    {t("signin")}
                  </Button>
                )}
              </PopoverContent>
            </Popover>
            <button
              onClick={() => router.push("/rfq")}
              className='flex flex-col items-center hover:text-green-800'
            >
              <Send size={18} />
              <span className='text-sm mt-1'>{t("request_rfq")}</span>
            </button>
            <button
              onClick={() => router.push("/import-from-saudi")}
              className='flex flex-col items-center hover:text-green-800'
            >
              <Globe size={18} />
              <span className='text-sm mt-1'>{t("export_from_saudi")}</span>
            </button>
            {user && (
              <Link
                href='/buyer-messages'
                className='flex flex-col items-center hover:text-green-800'
              >
                <MessageSquare size={18} />
                <span className='text-sm mt-1'>{t("messages")}</span>
              </Link>
            )}
            {userRole !== "admin" && (
              <Link
                href='/cart'
                className='relative flex flex-col items-center hover:text-green-800'
              >
                <ShoppingCart size={18} />
                <span className='text-sm mt-1'>{t("cart")}</span>
                {cartCount > 0 && (
                  <span className='absolute -top-1 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center'>
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <div className='flex flex-col items-center text-[#004d40]'>
              <MapPin size={18} />
              <span className='text-xs mt-2'>{renderLocationText()}</span>
            </div>
            <div className='flex flex-col items-center hover:text-green-800'>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>
      {/* Secondary nav (desktop only) */}
      <div className='hidden lg:block bg-white border-y border-gray-200'>
        <div className='max-w-7xl mx-auto px-6 flex items-center h-10 text-[#004d40] text-md space-x-8'>
          <Link
            href='/categories'
            className='font-semibold hover:text-green-800'
          >
            {t("all_categories")}
          </Link>
          <Link href='/' className='hover:text-green-800'>
            {t("featured")}
          </Link>
          <Link href='/' className='hover:text-green-800'>
            {t("trending")}
          </Link>
          <div className='flex-1' />
          <Link href='/' className='hover:text-green-800'>
            {t("secured_trading")}
          </Link>
          <Link href='/faq' className='hover:text-green-800'>
            {t("help_center")}
          </Link>
          <Link href='/supplier-direct' className='hover:text-green-800'>
            {t("become_supplier")}
          </Link>
        </div>
      </div>
    </header>
  );
}
