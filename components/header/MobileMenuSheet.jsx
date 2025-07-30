"use client";

import React, { useState, useCallback } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import {
  Menu,
  User,
  Send,
  MessageSquare,
  ShoppingCart,
  MapPin,
  LogOut as LogOutIcon,
  Globe,
  Info,
} from "lucide-react";
import LanguageSelector from "@/components/header/LanguageSelector";
import { useTranslations } from "next-intl";

export default function MobileMenuSheet({
  user,
  userRole,
  displayName,
  cartCount,
  onLogout,
  onDashboard,
  onLogin,
  onRfq,
  onImportFromSaudi,
  onMessages,
  onCart,
  onAboutUs,
  renderLocationText,
  isRtl,
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const t = useTranslations("header");

  // Centralize handler so closing is always safe and side effects are optional
  const handleAndClose = useCallback((cb) => {
    setSheetOpen(false);
    cb && cb();
  }, []);

  return (
    <div className='flex items-center gap-2 lg:hidden'>
      <LanguageSelector />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='text-[#2c6449]'
            aria-label={t("menu")}
          >
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent
          side={isRtl ? "right" : "left"}
          className='w-72 p-5 flex flex-col'
        >
          <SheetTitle className='mb-6 text-lg font-semibold text-[#2c6449]'>
            {t("menu")}
          </SheetTitle>
          <div className='space-y-6 text-sm text-gray-700'>
            {/* --- Account Section --- */}
            <div>
              <p className='text-xs uppercase tracking-wide mb-2 text-muted-foreground'>
                {t("account")}
              </p>
              <div className='space-y-2'>
                {user ? (
                  <>
                    <Button
                      variant='ghost'
                      className='w-full justify-start gap-2 hover:bg-muted'
                      onClick={() => handleAndClose(onDashboard)}
                    >
                      <User size={16} />
                      {t("dashboard")}
                    </Button>
                    <Button
                      variant='ghost'
                      className='w-full justify-start gap-2 hover:bg-muted'
                      onClick={async () => {
                        await onLogout?.();
                        setSheetOpen(false);
                      }}
                    >
                      <LogOutIcon size={16} />
                      {t("logout")}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant='ghost'
                    className='w-full justify-start gap-2 hover:bg-muted'
                    onClick={() => handleAndClose(onLogin)}
                  >
                    <User size={16} />
                    {t("signin")}
                  </Button>
                )}
              </div>
            </div>
            {/* --- Explore Section --- */}
            <div>
              <p className='text-xs uppercase tracking-wide mb-2 text-muted-foreground'>
                {t("explore")}
              </p>
              <div className='space-y-2'>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-2 hover:bg-muted'
                  onClick={() => handleAndClose(onRfq)}
                >
                  <Send size={16} />
                  {t("request_rfq")}
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-2 hover:bg-muted'
                  onClick={() => handleAndClose(onImportFromSaudi)}
                >
                  <Globe size={16} />
                  {t("export_from_saudi")}
                </Button>
                {user && (
                  <Button
                    variant='ghost'
                    className='w-full justify-start gap-2 hover:bg-muted'
                    onClick={() => handleAndClose(onMessages)}
                  >
                    <MessageSquare size={16} />
                    {t("messages")}
                  </Button>
                )}
                {userRole !== "admin" && (
                  <Button
                    variant='ghost'
                    className='w-full justify-start gap-2 hover:bg-muted'
                    onClick={() => handleAndClose(onCart)}
                  >
                    <ShoppingCart size={16} />
                    {t("cart")} {cartCount ? `(${cartCount})` : ""}
                  </Button>
                )}
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-2 hover:bg-muted'
                  onClick={() => handleAndClose(onAboutUs)}
                >
                  <Info size={16} />
                  {t("about_us") || "About Us"}
                </Button>
              </div>
            </div>
            {/* --- Info Section --- */}
            <div className='pt-2 border-t'>
              <p className='text-xs uppercase tracking-wide mb-2 mt-4 text-muted-foreground'>
                {t("info")}
              </p>
              <div className='flex items-center gap-2 text-sm text-gray-600 px-2'>
                <MapPin size={16} className='text-gray-500' />
                <span className='line-clamp-2 leading-tight'>
                  {renderLocationText?.()}
                </span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
