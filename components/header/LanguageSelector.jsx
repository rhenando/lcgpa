"use client";

import { useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import Cookies from "js-cookie"; // Import the cookie library
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// Supported locales
const LOCALES = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
];

function getCurrentLocale(pathname) {
  if (!pathname) return "en";
  const seg = pathname.split("/")[1];
  return LOCALES.some((l) => l.code === seg) ? seg : "en";
}

function swapLocaleInPath(pathname, newLocale) {
  // Always starts with /
  const segments = pathname.split("/");
  if (LOCALES.some((l) => l.code === segments[1])) {
    segments[1] = newLocale;
  } else {
    // Insert locale after first empty segment (for root path)
    segments.splice(1, 0, newLocale);
  }
  // Remove trailing empty segment unless root
  let newPath = segments.join("/");
  if (newPath.length > 1 && newPath.endsWith("/")) {
    newPath = newPath.slice(0, -1);
  }
  return newPath;
}

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const currentLocale = getCurrentLocale(pathname);

  const changeLanguage = useCallback(
    (newLocale) => {
      if (newLocale === currentLocale) {
        setOpen(false);
        return;
      }

      // --- START OF CHANGES ---
      // 1. Set the cookie to remember the user's choice
      Cookies.set("NEXT_LOCALE", newLocale, { expires: 365 });
      // --- END OF CHANGES ---

      const newPath = swapLocaleInPath(pathname, newLocale);
      router.push(newPath);
      setOpen(false);
    },
    [pathname, router, currentLocale]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          className='flex items-center space-x-1'
          aria-label='Change language'
        >
          <Globe size={18} />
          <span className='text-sm'>
            {LOCALES.find((l) => l.code === currentLocale)?.label || "Language"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-40 text-sm z-[9999]'
        sideOffset={8}
        forceMount
      >
        {LOCALES.map(({ code, label }) => (
          <Button
            key={code}
            variant={currentLocale === code ? "default" : "ghost"}
            className={`w-full justify-start ${
              currentLocale === code ? "font-semibold" : ""
            }`}
            aria-current={currentLocale === code ? "true" : undefined}
            onClick={() => changeLanguage(code)}
          >
            {label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
