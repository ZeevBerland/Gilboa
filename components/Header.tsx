"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useLanguage } from "@/lib/language";
import { LanguageToggle } from "./LanguageToggle";
import { usePathname } from "next/navigation";

export function Header() {
  const { t, isHebrew } = useLanguage();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-warm-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Image
            src="/logo.jpeg"
            alt="מדד גלבוע"
            width={36}
            height={36}
            className="rounded-full sm:w-10 sm:h-10"
          />
          <span className="font-heading font-bold text-base sm:text-lg text-ink">
            {t("site.title")}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-body hover:text-crimson transition-colors"
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/restaurants"
            className="text-sm text-body hover:text-crimson transition-colors"
          >
            {t("nav.browse")}
          </Link>

          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/favorites"
                    className="text-sm text-body hover:text-crimson transition-colors"
                  >
                    {t("nav.favorites")}
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-xs px-3 py-1.5 rounded-full border border-warm-gray text-body hover:bg-warm-white transition-colors"
                  >
                    {isHebrew ? "התנתקות" : "Sign Out"}
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/sign-in"
                  className="text-xs px-3 py-1.5 rounded-full bg-crimson text-white hover:bg-crimson-dark transition-colors"
                >
                  {t("nav.signIn")}
                </Link>
              )}
            </>
          )}

          <LanguageToggle />
        </nav>

        {/* Mobile: language toggle + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <LanguageToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-warm-white transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg
              className="w-5 h-5 text-ink"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-warm-gray bg-white animate-in slide-in-from-top duration-200">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-body hover:bg-warm-white transition-colors"
            >
              <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm font-medium">{t("nav.home")}</span>
            </Link>
            <Link
              href="/restaurants"
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-body hover:bg-warm-white transition-colors"
            >
              <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-sm font-medium">{t("nav.browse")}</span>
            </Link>

            {/* Divider */}
            <hr className="my-2 border-warm-gray" />

            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-body hover:bg-warm-white transition-colors"
                    >
                      <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-sm font-medium">{t("nav.favorites")}</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-body hover:bg-warm-white transition-colors w-full"
                    >
                      <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-medium">
                        {isHebrew ? "התנתקות" : "Sign Out"}
                      </span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/sign-in"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-crimson hover:bg-crimson/5 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">{t("nav.signIn")}</span>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
