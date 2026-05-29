"use client";

/**
 * Right-slide mobile navigation drawer.
 *
 * Triggered by the burger button in `SiteNav` at viewports < 980px.
 * Keeps the same link set as the desktop nav plus a placeholder language
 * toggle and the Apply CTA. Closes on Escape, backdrop click, and route
 * change (caller passes `key={pathname}` is *not* needed — we listen to
 * pathname changes ourselves).
 *
 * Accessibility:
 *  - role="dialog" + aria-modal + aria-labelledby
 *  - focus moves to the close button on open, returns to trigger on close
 *  - body scroll is locked while open
 *  - respects prefers-reduced-motion (framer-motion handles this implicitly
 *    via the reduceMotion config, but the transitions are also short enough
 *    to feel snappy regardless)
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { LanguageButton } from "@/components/ui/LanguageButton";
import type { NavLinkItem } from "./navLinks";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  links: NavLinkItem[];
  loginHref: string;
  /** The element that opened the drawer; focus is returned here on close. */
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
};

export function MobileNavDrawer({
  open,
  onClose,
  links,
  loginHref,
  triggerRef,
}: MobileNavDrawerProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();
  const lastPathname = useRef(pathname);
  const tCommon = useTranslations("common");
  const tMobile = useTranslations("mobileNav");
  const tNav = useTranslations("nav");

  // Close on route change so tapping a link inside the drawer dismisses it.
  useEffect(() => {
    if (open && pathname !== lastPathname.current) {
      onClose();
    }
    lastPathname.current = pathname;
  }, [pathname, open, onClose]);

  // Escape key + body scroll lock + focus management.
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      // Return focus to the burger (or whatever opened us) for keyboard users.
      if (triggerRef?.current) {
        triggerRef.current.focus();
      } else {
        previouslyFocused?.focus?.();
      }
    };
  }, [open, onClose, triggerRef]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="mobile-nav__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            className="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-nav-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mobile-nav__header">
              <span id="mobile-nav-title" className="mobile-nav__title">
                {tMobile("title")}
              </span>
              <button
                ref={closeBtnRef}
                type="button"
                className="mobile-nav__close"
                aria-label={tMobile("closeLabel")}
                onClick={onClose}
              >
                {/* Inline SVG so the icon set doesn't need to know about a Close. */}
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M6 6 L18 18 M18 6 L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="mobile-nav__links" aria-label={tMobile("primaryAriaLabel")}>
              {links.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href ||
                      (pathname?.startsWith(link.href + "/") ?? false);
                return (
                  <Link
                    key={`${link.href}-${link.key}`}
                    href={link.href}
                    className="mobile-nav__link"
                    target={link.target ?? "_self"}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label ?? tNav(link.key)}
                  </Link>
                );
              })}
            </nav>

            <div className="mobile-nav__footer">
              <LanguageButton className="lang-btn--drawer" />
              <ButtonLink href={loginHref} variant="primary" size="md" withArrow>
                {tCommon("login")}
              </ButtonLink>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
