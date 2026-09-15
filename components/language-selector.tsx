"use client";

import { Globe2 } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { getDirection, isLocale, languageLabel, languages, type Locale } from "@/lib/i18n";

type LanguageSelectorProps = { className?: string };

export function LanguageSelector({ className = "" }: LanguageSelectorProps) {
  const [locale, setLocale] = useState<Locale>("en");
  const label = languageLabel(locale);

  useEffect(() => {
    const saved = window.localStorage.getItem("nyayapath-language");
    if (isLocale(saved)) startTransition(() => setLocale(saved));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
    window.localStorage.setItem("nyayapath-language", locale);
  }, [locale]);

  return (
    <label className={`language-selector ${className}`.trim()}>
      <Globe2 size={18} aria-hidden="true" />
      <span className="sr-only">Select language</span>
      <select
        value={locale}
        onChange={(event) => {
          if (isLocale(event.target.value)) {
            setLocale(event.target.value);
            window.dispatchEvent(new CustomEvent("nyayapath-language-change", { detail: event.target.value }));
          }
        }}
        aria-label={`Select language. Current language: ${label.english}`}
      >
        {languages.map(([code, english, native]) => (
          <option key={code} value={code}>
            {english} — {native}
          </option>
        ))}
      </select>
    </label>
  );
}
