"use client";

import { useEffect, useState } from "react";
import { Marquee } from "@/components/ui/Marquee";
import { fetchPublicCollection } from "@/lib/cms/collections";

type Props = { defaultItems: string[]; slug?: string };

/**
 * Renders the partners marquee using the live CMS `partners` collection when
 * available, falling back to the hardcoded list during fetch / on failure so
 * the section never goes blank.
 */
export function CmsPartnersMarquee({ defaultItems, slug = "partners" }: Props) {
  const [items, setItems] = useState<string[]>(defaultItems);

  useEffect(() => {
    let cancelled = false;
    fetchPublicCollection(slug).then((res) => {
      if (cancelled || !res || res.items.length === 0) return;
      const names = res.items
        .map((it) => (typeof it.data?.name === "string" ? it.data.name : null))
        .filter((n): n is string => Boolean(n));
      if (names.length > 0) setItems(names);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return <Marquee items={items} />;
}
