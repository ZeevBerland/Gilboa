"use client";

import { useLanguage } from "@/lib/language";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "he" ? "en" : "he")}
      className="text-xs font-medium px-3 py-1.5 rounded-full border border-warm-gray bg-warm-white hover:bg-warm-gray transition-colors text-body"
      aria-label="Toggle language"
    >
      {lang === "he" ? "EN" : "עב"}
    </button>
  );
}
