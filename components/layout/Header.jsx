// components/layout/Header.jsx - Debug version
"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "../../i18n/routing";
import {
  FileText,
  ShoppingCart,
  MapPin,
  Search,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavLink = ({ href, icon: Icon, label }) => (
  <Link
    href={href}
    className='flex flex-col items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-green'
  >
    <Icon className='h-5 w-5' />
    <span>{label}</span>
  </Link>
);

const LanguageSwitcher = ({ isMobile = false }) => {
  const locale = useLocale();
  const pathname = usePathname();

  const languages = {
    en: "English",
    ar: "عربي",
  };

  const handleLanguageChange = (newLocale) => {
    // Create the new URL with the new locale
    const newUrl = `/${newLocale}${pathname === "/" ? "" : pathname}`;
    window.location.href = newUrl;
  };

  if (isMobile) {
    return (
      <div className='flex flex-col gap-2 p-3 border-t'>
        <span className='text-sm font-medium text-gray-700'>
          Language / اللغة
        </span>
        <div className='flex gap-2'>
          {Object.entries(languages).map(([lang, label]) => (
            <Button
              key={lang}
              variant={locale === lang ? "default" : "outline"}
              size='sm'
              onClick={() => handleLanguageChange(lang)}
              className='flex-1'
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='font-semibold text-gray-600 hover:text-brand-green'
        >
          <Globe className='h-4 w-4 mr-1' />
          {languages[locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.entries(languages).map(([lang, label]) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={locale === lang ? "bg-gray-100" : ""}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Debug: Check if translations are available
  let t;
  try {
    t = useTranslations("navigation");
    console.log("Translations loaded successfully");
  } catch (error) {
    console.error("Error loading translations:", error);
    // Fallback translations
    const fallbackTranslations = {
      rfq: "Request for Quotation",
      cart: "Cart",
      location: "Location",
      search: "Search",
      toggleMenu: "Toggle Menu",
    };
    t = (key) => fallbackTranslations[key] || key;
  }

  const locale = useLocale();

  // Define navigation items with translations - using fallback values
  const navItems = [
    {
      href: "/rfq",
      icon: FileText,
      label: t("rfq") || "Request for Quotation",
    },
    { href: "/cart", icon: ShoppingCart, label: t("cart") || "Cart" },
    { href: "/location", icon: MapPin, label: t("location") || "Location" },
  ];

  return (
    <header className='relative bg-white py-4 shadow-sm'>
      <div className='container mx-auto flex h-16 items-center justify-between'>
        <div className='flex items-center gap-10'>
          <Link href='/' onClick={() => setIsMenuOpen(false)}>
            <Image
              src='/logo.svg'
              alt='LCGPA Logo'
              width={240}
              height={50}
              priority
              className='w-44 md:w-60'
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center gap-8'>
            {navItems.map((item) => (
              <NavLink key={item.label} {...item} />
            ))}
          </nav>
        </div>

        {/* Desktop Actions (hidden on mobile) */}
        <div className='hidden md:flex items-center gap-4'>
          <LanguageSwitcher />
          <Button
            variant='ghost'
            size='icon'
            className='text-gray-600 hover:text-brand-green'
          >
            <Search className='h-5 w-5' />
            <span className='sr-only'>{t("search") || "Search"}</span>
          </Button>
        </div>

        {/* Mobile Actions (visible on mobile) */}
        <div className='flex items-center gap-1 md:hidden'>
          <Button
            variant='ghost'
            size='icon'
            className='text-gray-600 hover:text-brand-green'
          >
            <Search className='h-5 w-5' />
            <span className='sr-only'>{t("search") || "Search"}</span>
          </Button>
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            variant='ghost'
            size='icon'
          >
            {isMenuOpen ? (
              <X className='h-6 w-6' />
            ) : (
              <Menu className='h-6 w-6' />
            )}
            <span className='sr-only'>{t("toggleMenu") || "Toggle Menu"}</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className='md:hidden absolute top-full left-0 w-full bg-white shadow-lg z-50'>
          <nav className='flex flex-col'>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className='flex items-center gap-3 p-4 text-base font-medium text-gray-700 hover:bg-gray-100 border-b border-gray-100 last:border-b-0'
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className='h-5 w-5 text-gray-500' />
                {item.label}
              </Link>
            ))}
            {/* Mobile Language Switcher */}
            <LanguageSwitcher isMobile={true} />
          </nav>
        </div>
      )}
    </header>
  );
}
