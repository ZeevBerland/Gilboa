"use client";

import { useLanguage } from "@/lib/language";
import Link from "next/link";

export function Footer() {
  const { t, isHebrew } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white/70 mt-8 sm:mt-12 safe-bottom">
      <div className="border-t border-white/10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Top row: about + links */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-white/50 max-w-md">
            {t("footer.about")}
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <a
              href="https://www.youtube.com/@nivgilboa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/60 hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              {t("footer.youtube")}
            </a>
            <Link
              href="/restaurants"
              className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors"
            >
              {isHebrew ? "מסעדות" : "Restaurants"}
            </Link>
          </div>
        </div>

        {/* Bottom row: copyright */}
        <div className="border-t border-white/10 pt-4 text-center text-xs text-white/40">
          &copy; {year} {t("site.title")} &middot; {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
