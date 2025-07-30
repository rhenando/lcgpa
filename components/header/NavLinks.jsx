"use client";

import Link from "next/link";

const LEFT_LINKS = [
  { href: "/categories", label: "All Categories", strong: true },
  { href: "/products", label: "Featured" },
  { href: "/products", label: "Trending" },
];

const RIGHT_LINKS = [
  { href: "/", label: "Secured Trading" },
  { href: "/help-center", label: "Help Center" },
  { href: "/become-supplier", label: "Become a Supplier" },
];

export default function NavLinks({ show }) {
  return (
    <nav
      aria-label='Main site navigation'
      className={`absolute top-full left-0 w-full z-40 bg-white px-6 py-2 text-base text-[#2c6449] border-t border-b border-gray-200 
        ${show ? "block" : "hidden"} lg:block`}
    >
      <div className='flex items-center justify-between'>
        {/* LEFT: Categories + Navigation */}
        <div className='flex items-center space-x-6 rtl:space-x-reverse'>
          {LEFT_LINKS.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className={`flex items-center gap-1 hover:text-[#1b4533] ${
                link.strong ? "font-semibold" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        {/* RIGHT: Support & Actions */}
        <div className='flex items-center space-x-6 rtl:space-x-reverse'>
          {RIGHT_LINKS.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className='hover:text-[#1b4533]'
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
