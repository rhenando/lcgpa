"use client";

import React, { useState, useEffect } from "react";
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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslations } from "next-intl";
import MobileMenuSheet from "@/components/header/MobileMenuSheet";

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
  const cartCount = useSelector((s) => s.cart.count);

  const [coords, setCoords] = useState(() => {
    try {
      const stored = localStorage.getItem("coords");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [locError, setLocError] = useState(null);
  const [locationName, setLocationName] = useState(() => {
    try {
      return localStorage.getItem("locationName") || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (coords || locationName) return;
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
      (error) => {
        setLocError(error.message);
      }
    );
  }, [coords, locationName]);

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
        const suburb =
          address.suburb ||
          address.neighbourhood ||
          address.village ||
          address.hamlet ||
          null;
        const city =
          address.city ||
          address.town ||
          address.village ||
          address.county ||
          null;
        let finalName = null;
        if (suburb && city) finalName = `${suburb}, ${city}`;
        else if (city) finalName = city;
        else if (data.display_name) finalName = data.display_name;
        if (finalName) {
          setLocationName(finalName);
          localStorage.setItem("locationName", finalName);
        } else {
          setLocError("Name not found");
        }
      })
      .catch(() => {
        setLocError("Reverse geocoding error");
      });
  }, [coords, locationName]);

  const renderLocationText = () => {
    if (locationName) return locationName;
    if (locError) return "Unavailable";
    return "Detecting…";
  };

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const onLogout = async () => {
    const role = userRole;
    await dispatch(logout()).unwrap();
    setUserMenuOpen(false);
    window.location.href = role === "admin" ? "/admin-login" : "/user-login";
  };

  if (loading) {
    return (
      <header className='w-full bg-white shadow z-[99999]'>
        <div className='p-4 text-center text-sm text-muted-foreground'>
          {t("loading")}
        </div>
      </header>
    );
  }

  const isRtl = false;

  return (
    <header className='w-full bg-white/90 backdrop-blur-md shadow-sm z-[99999]'>
      <div className='max-w-full mx-auto flex items-center justify-between px-4 md:px-6 h-26'>
        <Link href='/' className='flex-shrink-0'>
          <Image src='/logo.svg' alt='Logo' width={260} height={96} />
        </Link>
        <div className='hidden md:flex flex-1 mx-6'>
          <ProductSearch />
        </div>
        <MobileMenuSheet
          user={user}
          userRole={userRole}
          displayName={user?.displayName || user?.email || t("signin")}
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
        <div className='hidden lg:flex items-center space-x-5 ml-6 text-[#2c6449]'>
          <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <PopoverTrigger asChild>
              <button className='flex items-center hover:text-green-800 p-2'>
                <User size={22} />
                <VisuallyHidden>User</VisuallyHidden>
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
                      if (userRole === "buyer") router.push("/buyer-dashboard");
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
            onClick={() => {
              router.push("/rfq");
            }}
            className='flex items-center hover:text-green-800 p-2'
          >
            <Send size={22} />
            <VisuallyHidden>{t("request_rfq")}</VisuallyHidden>
          </button>
          <button
            onClick={() => router.push("/import-from-saudi")}
            className='flex items-center hover:text-green-800 p-2'
          >
            <Globe size={22} />
            <VisuallyHidden>{t("export_from_saudi")}</VisuallyHidden>
          </button>
          {user && (
            <Link
              href='/buyer-messages'
              className='flex items-center hover:text-green-800 p-2'
            >
              <MessageSquare size={22} />
              <VisuallyHidden>{t("messages")}</VisuallyHidden>
            </Link>
          )}
          {userRole !== "admin" && (
            <Link
              href='/cart'
              className='relative flex items-center hover:text-green-800 p-2'
            >
              <ShoppingCart size={22} />
              <VisuallyHidden>{t("cart")}</VisuallyHidden>
              {cartCount > 0 && (
                <span className='absolute -top-1 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center'>
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          <div className='flex items-center text-[#2c6449] p-2'>
            <MapPin size={22} />
            <VisuallyHidden>{t("location")}</VisuallyHidden>
          </div>
          <div className='flex items-center hover:text-green-800 p-2'>
            <LanguageSelector />
            <VisuallyHidden>Language</VisuallyHidden>
          </div>
        </div>
      </div>
      <div className='block md:hidden px-4 pb-4'>
        <ProductSearch />
      </div>
    </header>
  );
}
