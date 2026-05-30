"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "./Section";
import { fetchPublicMenu, type PublicMenu } from "@/lib/cms/menusClient";
import { fetchPublicGlobals, type PublicGlobals } from "@/lib/cms/globalsClient";

type LinkRow = { href: string; label: string; target: string };

function menuToLinks(menu: PublicMenu | null, locale: "en" | "fr"): LinkRow[] | null {
  if (!menu) return null;
  return menu.items
    .filter((i) => i.visible)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => ({
      href: i.href,
      label: i.label[locale] ?? i.label.en ?? "",
      target: i.target,
    }));
}

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale() as "en" | "fr";
  const year = new Date().getFullYear();

  const [globals, setGlobals] = useState<PublicGlobals | null>(null);
  const [explore, setExplore] = useState<LinkRow[] | null>(null);
  const [resources, setResources] = useState<LinkRow[] | null>(null);
  const [reach, setReach] = useState<LinkRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchPublicGlobals(),
      fetchPublicMenu("footer-explore"),
      fetchPublicMenu("footer-resources"),
      fetchPublicMenu("footer-reach"),
    ])
      .then(([g, e, r, h]) => {
        if (cancelled) return;
        setGlobals(g);
        setExplore(menuToLinks(e, locale));
        setResources(menuToLinks(r, locale));
        setReach(menuToLinks(h, locale));
      })
      .catch(() => { /* ignore — translations are the fallback */ });
    return () => { cancelled = true; };
  }, [locale]);

  const fallbackExplore: LinkRow[] = [
    { href: "/",           label: tNav("home"),       target: "_self" },
    { href: "/services",   label: tNav("services"),   target: "_self" },
    { href: "/placements", label: tNav("placements"), target: "_self" },
    { href: "/stories",    label: tNav("stories"),    target: "_self" },
  ];
  const fallbackResources: LinkRow[] = [
    { href: "/resources",      label: t("columns.resources.guides"),     target: "_self" },
    { href: "/blog",           label: t("columns.resources.blog"),       target: "_self" },
    { href: "/#howitworks",    label: t("columns.resources.howItWorks"), target: "_self" },
  ];
  const fallbackReach: LinkRow[] = [
    { href: "/contact",                              label: t("columns.reach.startConversation"), target: "_self" },
    { href: "mailto:hello@career360consult.com",     label: t("columns.reach.email"),             target: "_self" },
  ];

  const exploreLinks   = explore   ?? fallbackExplore;
  const resourcesLinks = resources ?? fallbackResources;
  const reachLinks     = reach     ?? fallbackReach;

  const tagline = globals?.tagline?.[locale] ?? globals?.tagline?.en ?? t("tagline");
  const copyright =
    globals?.footer_copyright?.[locale] ??
    globals?.footer_copyright?.en ??
    t("copyright", { year });
  const address = globals?.address?.[locale] ?? globals?.address?.en ?? t("columns.reach.address");
  const logoSrc = globals?.logo?.dark ?? "/imports/c360 logo main dark.png";
  const companyName = globals?.company_name ?? "Career360 Consult";

  return (
    <footer className="foot">
      <Container>
        <div className="foot__inner">
          <div className="foot__brand">
            <Link className="brand" href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt={companyName} className="brand__logo" height={42} width="auto" />
            </Link>
            <p>{tagline}</p>
          </div>
          <div className="foot__cols">
            <div>
              <h4>{t("columns.explore.heading")}</h4>
              {exploreLinks.map((l) => (
                <a key={l.href + l.label} href={l.href} target={l.target}>{l.label}</a>
              ))}
            </div>
            <div>
              <h4>{t("columns.resources.heading")}</h4>
              {resourcesLinks.map((l) => (
                <a key={l.href + l.label} href={l.href} target={l.target}>{l.label}</a>
              ))}
            </div>
            <div>
              <h4>{t("columns.reach.heading")}</h4>
              {reachLinks.map((l) => (
                <a key={l.href + l.label} href={l.href} target={l.target}>{l.label}</a>
              ))}
              {address ? <span>{address}</span> : null}
            </div>
          </div>
        </div>
        <div className="foot__base">
          <span>{copyright}</span>
          <span>{t("rights")}</span>
        </div>
      </Container>
    </footer>
  );
}
