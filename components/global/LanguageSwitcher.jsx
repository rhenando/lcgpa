"use client";

import { useLocale } from "next-intl";
import { usePathname } from "../../i18n/routing";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Globe } from "lucide-react";
import { routing } from "../../i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const languages = {
    en: "English",
    ar: "العربية",
  };

  const handleLanguageChange = (newLocale) => {
    // Create the new URL with the new locale
    const newUrl = `/${newLocale}${pathname === "/" ? "" : pathname}`;
    window.location.href = newUrl;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm'>
          <Globe className='h-4 w-4 mr-2' />
          {languages[locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {routing.locales.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={locale === lang ? "bg-gray-100" : ""}
          >
            {languages[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
