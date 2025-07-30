"use client";
import { useLocale, useTranslations } from "next-intl";

export default function HighlightsBar() {
  const locale = useLocale?.() || "en";
  const isRTL = locale === "ar";
  const t = useTranslations("highlights");

  // Optionally you can put the highlight keys in an array for DRY
  const highlightKeys = ["market", "efficiency", "customized"];

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`
        w-full bg-[#246955] py-6 px-4 flex flex-col md:flex-row items-center
        justify-center gap-4 md:gap-16 border-b border-[#c3ddcf]/40
      `}
    >
      {highlightKeys.map((key) => (
        <HighlightItem key={key} label={t(key)} />
      ))}
    </section>
  );
}

function HighlightItem({ label }) {
  return (
    <div className='flex flex-col items-center text-center'>
      <span className='text-xs text-[#eaf3ed] uppercase tracking-widest mt-1 break-words'>
        {label}
      </span>
    </div>
  );
}
