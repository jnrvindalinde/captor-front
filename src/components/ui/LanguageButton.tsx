"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { setLocale as setLocaleAction } from "@/app/actions/setLocale";
import { GlobeIcon } from "./Icons";
import type { Locale } from "@/i18n/locales";

type LanguageButtonProps = {
  className?: string;
};

/**
 * Toggles between English and French. Persists choice via cookie and
 * revalidates the current route's layout so server components re-render
 * with the new messages bundle within one render.
 */
export function LanguageButton({ className }: LanguageButtonProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const pathname = usePathname() ?? "/";
  const [pending, startTransition] = useTransition();

  const next: Locale = locale === "en" ? "fr" : "en";

  function onClick() {
    startTransition(async () => {
      await setLocaleAction(next, pathname);
    });
  }

  return (
    <button
      className={["lang-btn", className].filter(Boolean).join(" ")}
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={t("language")}
    >
      <GlobeIcon />
      <span>{locale === "en" ? "En" : "Fr"}</span>
    </button>
  );
}
