// components/layout/Header.jsx

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FileText, ShoppingCart, MapPin, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/quote", icon: FileText, label: "Request for Quotation" },
  { href: "/import", icon: FileText, label: "Import from Saudi" },
  { href: "/cart", icon: ShoppingCart, label: "Cart" },
  { href: "/location", icon: MapPin, label: "Location" },
];

const NavLink = ({ href, icon: Icon, label }) => (
  <Link
    href={href}
    className='flex flex-col items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-green'
  >
    <Icon className='h-5 w-5' />
    <span>{label}</span>
  </Link>
);

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className='relative bg-white py-4 shadow-sm'>
      <div className='container mx-auto flex h-16 items-center justify-between'>
        <div className='flex items-center gap-10'>
          <Link href='/' onClick={() => setIsMenuOpen(false)}>
            {/* --- THIS IS THE CORRECTED PART --- */}
            <Image
              src='/logo.svg'
              alt='LCGPA Logo'
              width={240} // Set to the LARGEST desired width
              height={50} // Set to the LARGEST desired height
              priority
              // Use className for RESPONSIVE sizing
              className='w-44 md:w-60' // w-44 on mobile, w-60 (240px) on medium screens and up
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
          <Button
            variant='ghost'
            className='font-semibold text-gray-600 hover:text-brand-green'
          >
            عربي
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='text-gray-600 hover:text-brand-green'
          >
            <Search className='h-5 w-5' />
            <span className='sr-only'>Search</span>
          </Button>
        </div>

        {/* Mobile Actions (visible on mobile) */}
        <div className='flex items-center gap-1 md:hidden'>
          <Button variant='ghost' className='font-semibold text-gray-600'>
            عربي
          </Button>
          <Button variant='ghost' size='icon' className='text-gray-600'>
            <Search className='h-5 w-5' />
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
            <span className='sr-only'>Toggle Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className='md:hidden absolute top-full left-0 w-full bg-white shadow-lg'>
          <nav className='flex flex-col gap-4 p-4'>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className='flex items-center gap-3 rounded-md p-3 text-base font-[12px] text-gray-700 hover:bg-gray-100'
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className='h-4 w-4 text-gray-500' />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
