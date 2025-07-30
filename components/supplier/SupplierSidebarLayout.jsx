"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  User,
  FileText,
  Users,
  Mail,
  Package,
  ShoppingCart,
  ClipboardList,
  Settings,
  HelpCircle,
  Menu,
  X,
  ChevronDown, // ✨ Import ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SupplierSidebarLayout({ children }) {
  const t = useTranslations("supplier-sidebar");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // ✨ NEW: State to manage which submenu is open
  // It defaults to 'orders' if the current path is an order path
  const [openSubmenu, setOpenSubmenu] = useState(
    pathname.startsWith("/supplier-dashboard/orders") ? "orders" : null
  );

  const menuItems = [
    { key: "dashboard", href: "/supplier-dashboard", icon: LayoutDashboard },
    { key: "profile", href: "/supplier-dashboard/profile", icon: User },
    { key: "terms", href: "/supplier-dashboard/terms", icon: FileText },
    { key: "employees", href: "/supplier-dashboard/employees", icon: Users },
    { key: "messages", href: "/supplier-dashboard/messages", icon: Mail },
    { key: "products", href: "/supplier-dashboard/products", icon: Package },
    // ✨ MODIFIED: "orders" item now has a submenu
    {
      key: "orders",
      icon: ShoppingCart,
      submenu: [
        {
          key: "receivedOrders",
          href: "/supplier-dashboard/orders/received",
        },
        {
          key: "placedOrders",
          href: "/supplier-dashboard/orders/placed",
        },
      ],
    },
    { key: "rfqs", href: "/supplier-dashboard/rfqs", icon: ClipboardList },
    { key: "settings", href: "/supplier-dashboard/settings", icon: Settings },
    { key: "support", href: "/supplier-dashboard/support", icon: HelpCircle },
  ];

  // ✨ NEW: Function to toggle submenu
  const handleSubmenuToggle = (key) => {
    setOpenSubmenu(openSubmenu === key ? null : key);
  };

  const renderMenuItems = (isMobile = false) =>
    menuItems.map((item) => {
      const isSubmenuOpen = openSubmenu === item.key;
      // An item is "active" if it's the current page OR if it's a parent of the current page
      const isParentActive =
        item.submenu && pathname.startsWith(`/supplier-dashboard/${item.key}`);

      // ✨ If the item has a submenu, render it as a collapsible section
      if (item.submenu) {
        return (
          <div key={item.key}>
            <button
              onClick={() => handleSubmenuToggle(item.key)}
              className={cn(
                "flex items-center justify-between w-full gap-3 px-3 py-2 rounded-md text-sm transition-all",
                isParentActive
                  ? "text-[#2c6449] font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <div className='flex items-center gap-3'>
                <item.icon className='h-4 w-4' />
                {t(item.key)}
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isSubmenuOpen && "rotate-180"
                )}
              />
            </button>
            {isSubmenuOpen && (
              <div className='pl-7 mt-1 space-y-1'>
                {item.submenu.map((subItem) => (
                  <Link
                    key={subItem.key}
                    href={subItem.href}
                    onClick={() => isMobile && setOpen(false)} // Close mobile drawer on click
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all",
                      pathname === subItem.href
                        ? "bg-[#e4f4ec] text-[#2c6449] font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {t(subItem.key)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      }

      // ✨ Otherwise, render a regular link
      return (
        <Link
          key={item.key}
          href={item.href}
          onClick={() => isMobile && setOpen(false)} // Close mobile drawer on click
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all",
            pathname === item.href
              ? "bg-[#e4f4ec] text-[#2c6449] font-medium"
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <item.icon className='h-4 w-4' />
          {t(item.key)}
        </Link>
      );
    });

  return (
    <div className='flex flex-col md:flex-row min-h-screen bg-gray-50 relative'>
      {/* Desktop sidebar */}
      <aside className='hidden md:block w-64 bg-white border-r p-6'>
        <h2 className='text-lg font-bold mb-6 text-[#2c6449]'>{t("title")}</h2>
        {/* ✨ Use the new rendering function */}
        <nav className='space-y-1'>{renderMenuItems()}</nav>
      </aside>

      {/* Mobile header */}
      <div className='md:hidden w-full bg-white border-b px-4 py-3 flex items-center justify-between'>
        <button onClick={() => setOpen(true)} className='text-[#2c6449]'>
          <Menu className='h-5 w-5' />
        </button>
        <h2 className='text-sm font-semibold text-[#2c6449]'>{t("title")}</h2>
        <div />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className='absolute top-0 left-0 w-full z-30 flex md:hidden'>
          <div className='w-64 h-screen bg-white p-6 shadow-lg'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-lg font-bold text-[#2c6449]'>{t("menu")}</h2>
              <button onClick={() => setOpen(false)}>
                <X className='h-5 w-5 text-gray-500' />
              </button>
            </div>
            {/* ✨ Use the new rendering function for mobile */}
            <nav className='space-y-2'>{renderMenuItems(true)}</nav>
          </div>
          <div
            className='flex-1 bg-black/30 backdrop-blur-sm'
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      {/* Content */}
      <main className='flex-1 p-4 sm:p-6 md:pt-6'>{children}</main>
    </div>
  );
}
