"use client";
/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { GlobeIcon } from "@/components/ui/Icons";
import { siteNavLinks, type NavLinkItem } from "./navLinks";

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
  /** Apply CTA target. */
  applyHref?: string;
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
  return (
    <div className="nav__links">
      {links.map((link) => {
        const active = link.active ?? isLinkActive(link.href, pathname);
        return (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

function NavActions({
  applyHref,
  tone,
}: {
  applyHref: string;
  tone: SiteNavTone;
}) {
  return (
    <div className="nav__right">
      <button className="lang-btn" type="button" aria-label="Language">
        <GlobeIcon />
        <span>En</span>
      </button>
      <ButtonLink
        href={applyHref}
        variant={tone === "light" ? "secondary" : "primary"}
        size="sm"
        withArrow
      >
        Apply
      </ButtonLink>
    </div>
  );
}

export function SiteNav({
  tone = "light",
  links = siteNavLinks,
  homeHref = "/",
  applyHref = "/apply",
  className,
}: SiteNavProps) {
  const pathname = usePathname() ?? "/";

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
          <NavActions applyHref={applyHref} tone={tone} />
        </motion.nav>
      </Container>
    </div>
  );
}
