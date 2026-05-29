"use client";
/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { LanguageButton } from "@/components/ui/LanguageButton";
import { siteNavLinks, type NavLinkItem } from "./navLinks";
import { fetchPublicMenu } from "@/lib/cms/menusClient";
import { MobileNavDrawer } from "./MobileNavDrawer";

export type SiteNavTone = "dark" | "light";

// Re-exported for backwards-compatibility with any lingering imports.
export type SiteNavLink = NavLinkItem & { active?: boolean };

type SiteNavProps = {
  /** Visual tone — `dark` for nav-over-dark hero (home), `light` for everything else. */
  tone?: SiteNavTone;
  /** Override the default link list. Rarely needed. */
  links?: SiteNavLink[];
  /** Brand link target. */
  homeHref?: string;
  /** Login CTA target — single sign-in for admins + (soon) clients. */
  loginHref?: string;
  className?: string;
};

function classes(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isLinkActive(href: string, pathname: string): boolean {
  if (!href || href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function Brand({ href, tone }: { href: string; tone: SiteNavTone }) {
  // Dark logo (green only) on dark hero; light logo (navy/green) on light pages.
  const logoSrc =
    tone === "light"
      ? "/imports/c360 logo main light.png"
      : "/imports/c360 logo main dark.png";

  return (
    <Link className={classes("brand", tone === "light" && "brand--dark")} href={href}>
      <img
        src={logoSrc}
        alt="Career360 Consult"
        className="brand__logo"
        height={42}
        width="auto"
      />
    </Link>
  );
}

function NavLinks({
  links,
  pathname,
}: {
  links: SiteNavLink[];
  pathname: string;
}) {
  const t = useTranslations("nav");
  const desktopLinks = links.filter((link) => link.key !== "home");
  return (
    <div className="nav__links">
      {desktopLinks.map((link) => {
        const active = link.active ?? isLinkActive(link.href, pathname);
        return (
          <Link
            key={`${link.href}-${link.key}`}
            href={link.href}
            target={link.target ?? "_self"}
            aria-current={active ? "page" : undefined}
          >
            {link.label ?? t(link.key)}
          </Link>
        );
      })}
    </div>
  );
}

function NavActions({
  loginHref,
  tone,
}: {
  loginHref: string;
  tone: SiteNavTone;
}) {
  const t = useTranslations("common");
  return (
    <div className="nav__right">
      <LanguageButton />
      <ButtonLink
        href={loginHref}
        variant={tone === "light" ? "secondary" : "primary"}
        size="sm"
        withArrow
      >
        {t("login")}
      </ButtonLink>
    </div>
  );
}

/**
 * Burger trigger shown at < 980px to open the mobile nav drawer.
 * Visible from the same breakpoint where `.nav__links` collapses to hidden.
 */
function BurgerButton({
  open,
  onClick,
  buttonRef,
}: {
  open: boolean;
  onClick: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const t = useTranslations("mobileNav");
  return (
    <button
      ref={buttonRef}
      type="button"
      className="nav__burger"
      aria-label={open ? t("closeLabel") : t("openLabel")}
      aria-expanded={open}
      aria-controls="mobile-nav-drawer"
      onClick={onClick}
    >
      <span className="nav__burger-bar" />
      <span className="nav__burger-bar" />
      <span className="nav__burger-bar" />
    </button>
  );
}

export function SiteNav({
  tone = "light",
  links: linksProp,
  homeHref = "/",
  loginHref = "/login",
  className,
}: SiteNavProps) {
  const pathname = usePathname() ?? "/";
  const locale = useLocale() as "en" | "fr";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement | null>(null);

  const [cmsLinks, setCmsLinks] = useState<SiteNavLink[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchPublicMenu("primary")
      .then((menu) => {
        if (cancelled || !menu || !menu.items.length) return;
        const resolved: SiteNavLink[] = menu.items
          .filter((i) => i.visible)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((i) => ({
            href: i.href,
            key: i.uuid,
            label: i.label[locale] ?? i.label.en ?? "",
            target: i.target,
          }));
        setCmsLinks(resolved);
      })
      .catch(() => { /* fall back to hardcoded */ });
    return () => { cancelled = true; };
  }, [locale]);

  const links = linksProp ?? cmsLinks ?? siteNavLinks;

  return (
    <div className={classes("site-nav-row", className)}>
      <Container>
        <motion.nav
          className={classes("nav", tone === "light" && "nav--light")}
          aria-label="Primary"
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Brand href={homeHref} tone={tone} />
          <NavLinks links={links} pathname={pathname} />
          <NavActions loginHref={loginHref} tone={tone} />
          <BurgerButton
            open={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
            buttonRef={burgerRef}
          />
        </motion.nav>
      </Container>
      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        links={links}
        loginHref={loginHref}
        triggerRef={burgerRef}
      />
    </div>
  );
}
