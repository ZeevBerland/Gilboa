"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

type Lang = "he" | "en";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  isHebrew: boolean;
}

const translations: Record<string, Record<Lang, string>> = {
  "site.title": { he: "מדד גלבוע", en: "Gilboa Guide" },
  "site.subtitle": {
    he: "המדריך הקולינרי המלא בישראל",
    en: "The Complete Culinary Guide to Israel",
  },
  "nav.home": { he: "ראשי", en: "Home" },
  "nav.browse": { he: "מסעדות", en: "Restaurants" },
  "nav.favorites": { he: "מועדפים", en: "Favorites" },
  "nav.signIn": { he: "התחברות", en: "Sign In" },
  "search.placeholder": {
    he: "חפשו מסעדה לפי שם, סוג או מיקום...",
    en: "Search by name, type, or location...",
  },
  "search.nlPlaceholder": {
    he: "חיפוש חופשי: למשל ״איטלקייה טובה ליד הים״",
    en: 'Free search: e.g. "good Italian near the beach"',
  },
  "filter.type": { he: "סוג מטבח", en: "Cuisine Type" },
  "filter.sort": { he: "מיון", en: "Sort By" },
  "filter.madad": { he: "טווח מדד", en: "Madad Range" },
  "filter.madadAll": { he: "הכל", en: "All" },
  "filter.all": { he: "הכל", en: "All" },
  "filter.clearAll": { he: "נקה הכל", en: "Clear all" },
  "filter.city": { he: "עיר", en: "City" },
  "sort.madad": { he: "לפי מדד", en: "By Madad" },
  "sort.userScore": { he: "לפי דירוג גולשים", en: "By User Score" },
  "sort.date": { he: "לפי תאריך", en: "By Date" },
  "restaurant.madad": { he: "מדד גלבוע", en: "Gilboa Madad" },
  "restaurant.userScore": { he: "דירוג גולשים", en: "User Score" },
  "restaurant.reviews": { he: "ביקורות", en: "Reviews" },
  "restaurant.noReviews": { he: "אין ביקורות עדיין", en: "No reviews yet" },
  "restaurant.watchReview": { he: "צפו בביקורת", en: "Watch Review" },
  "review.write": { he: "כתבו ביקורת", en: "Write a Review" },
  "review.placeholder": {
    he: "שתפו את חוויית הביקור שלכם...",
    en: "Share your dining experience...",
  },
  "review.scoreLabel": { he: "הציון שלכם", en: "Your Score" },
  "review.submit": { he: "שליחה", en: "Submit" },
  "review.loginRequired": {
    he: "התחברו כדי לכתוב ביקורת",
    en: "Sign in to write a review",
  },
  "review.edit": { he: "עריכה", en: "Edit" },
  "review.delete": { he: "מחיקה", en: "Delete" },
  "review.deleteConfirm": {
    he: "האם אתם בטוחים שברצונכם למחוק את הביקורת?",
    en: "Are you sure you want to delete this review?",
  },
  "review.cancel": { he: "ביטול", en: "Cancel" },
  "review.save": { he: "שמירה", en: "Save" },
  "review.editing": { he: "עריכת ביקורת", en: "Edit Review" },
  "favorites.title": { he: "מועדפים", en: "Favorites" },
  "favorites.add": { he: "הוסף למועדפים", en: "Add to favorites" },
  "favorites.remove": { he: "הסר ממועדפים", en: "Remove from favorites" },
  "favorites.empty": {
    he: "אין מועדפים עדיין",
    en: "No favorites yet",
  },
  "favorites.signIn": {
    he: "התחברו כדי לשמור מועדפים",
    en: "Sign in to save favorites",
  },
  "footer.rights": {
    he: "כל הזכויות שמורות",
    en: "All rights reserved",
  },
  "footer.youtube": {
    he: "ערוץ היוטיוב של ניב גלבוע",
    en: "Niv Gilboa's YouTube Channel",
  },
  "footer.about": {
    he: "מדריך קולינרי מבוסס על ביקורות הווידאו של ניב גלבוע",
    en: "A culinary guide based on Niv Gilboa's video reviews",
  },
  "featured.title": { he: "מומלצים", en: "Featured" },
  "browse.title": { he: "כל המסעדות", en: "All Restaurants" },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("he");

  useEffect(() => {
    const stored = localStorage.getItem("gilboa-lang") as Lang | null;
    if (stored && (stored === "he" || stored === "en")) {
      setLangState(stored);
    }
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("gilboa-lang", newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "he" ? "rtl" : "ltr";
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[key]?.[lang] ?? key;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, isHebrew: lang === "he" }),
    [lang, setLang, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
