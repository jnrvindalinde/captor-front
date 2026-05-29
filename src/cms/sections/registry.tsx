import type { PageSection } from "@/lib/cms/pages";
import { CmsPartnersMarquee } from "@/components/sections/CmsPartnersMarquee";
import { fetchPublicCollection } from "@/lib/cms/collections";
import { ButtonLink } from "@/components/ui/Button";
import { Section, Container } from "@/components/layout/Section";

type Locale = "en" | "fr";

function pick(data: Record<string, unknown>, base: string, locale: Locale): string {
  const v = data[`${base}_${locale}`] ?? data[`${base}_en`];
  return typeof v === "string" ? v : "";
}

function HeroCentered({ data, locale }: { data: Record<string, unknown>; locale: Locale }) {
  const eyebrow = pick(data, "eyebrow", locale);
  const title = pick(data, "title", locale);
  const subtitle = pick(data, "subtitle", locale);
  return (
    <header className="cms-hero cms-hero--centered">
      <Container>
        {eyebrow ? <span className="kicker">{eyebrow}</span> : null}
        {title ? <h1>{title}</h1> : null}
        {subtitle ? <p className="cms-hero__lede">{subtitle}</p> : null}
      </Container>
    </header>
  );
}

function HeroSplit({ data, locale }: { data: Record<string, unknown>; locale: Locale }) {
  const eyebrow = pick(data, "eyebrow", locale);
  const title = pick(data, "title", locale);
  const subtitle = pick(data, "subtitle", locale);
  const ctaLabel = pick(data, "cta_label", locale);
  const ctaHref = typeof data.cta_href === "string" ? data.cta_href : "";
  const imageUrl = typeof data.image_url === "string" ? data.image_url : "";
  return (
    <header className="cms-hero cms-hero--split">
      <Container className="cms-hero__inner">
        <div className="cms-hero__body">
          {eyebrow ? <span className="kicker">{eyebrow}</span> : null}
          {title ? <h1>{title}</h1> : null}
          {subtitle ? <p className="cms-hero__lede">{subtitle}</p> : null}
          {ctaLabel && ctaHref ? (
            <div className="cms-hero__cta">
              <ButtonLink href={ctaHref} variant="inverse" size="md" withArrow>
                {ctaLabel}
              </ButtonLink>
            </div>
          ) : null}
        </div>
        {imageUrl ? (
          <div className="cms-hero__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" />
          </div>
        ) : null}
      </Container>
    </header>
  );
}

function RichText({ data, locale }: { data: Record<string, unknown>; locale: Locale }) {
  const body = pick(data, "body", locale);
  if (!body) return null;
  return (
    <Section className="cms-richtext">
      <Container>
        {body.split(/\n{2,}/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </Container>
    </Section>
  );
}

function CtaBanner({ data, locale }: { data: Record<string, unknown>; locale: Locale }) {
  const title = pick(data, "title", locale);
  const subtitle = pick(data, "subtitle", locale);
  const ctaLabel = pick(data, "cta_label", locale);
  const ctaHref = typeof data.cta_href === "string" ? data.cta_href : "";
  return (
    <Section className="cms-cta">
      <Container className="cms-cta__inner">
        <div>
          {title ? <h2 className="cms-cta__title">{title}</h2> : null}
          {subtitle ? <p className="cms-cta__sub">{subtitle}</p> : null}
        </div>
        {ctaLabel && ctaHref ? (
          <ButtonLink href={ctaHref} variant="inverse" size="md" withArrow>
            {ctaLabel}
          </ButtonLink>
        ) : null}
      </Container>
    </Section>
  );
}

async function MarqueeLogos({ data }: { data: Record<string, unknown> }) {
  const slug = (typeof data.collection_slug === "string" && data.collection_slug) || "partners";
  const coll = await fetchPublicCollection(slug);
  const items = (coll?.items ?? [])
    .map((it) => (typeof it.data?.name === "string" ? (it.data.name as string) : null))
    .filter((s): s is string => Boolean(s));
  return <CmsPartnersMarquee defaultItems={items.length ? items : ["Partner"]} />;
}

function StepsNumbered({ data, locale }: { data: Record<string, unknown>; locale: Locale }) {
  const header = pick(data, "header", locale);
  const rawItems = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];
  if (!rawItems.length) return null;
  return (
    <Section className="cms-steps">
      <Container>
        {header ? <h2 className="cms-steps__header">{header}</h2> : null}
        <ol className="cms-steps__list">
          {rawItems.map((step, i) => {
            const n = (step.n as string | undefined) ?? String(i + 1).padStart(2, "0");
            const title = (step[`title_${locale}`] as string) || (step.title_en as string) || "";
            const copy = (step[`copy_${locale}`] as string) || (step.copy_en as string) || "";
            return (
              <li key={i} className="cms-step">
                <span className="cms-step__n">{n}</span>
                <div>
                  {title ? <h3>{title}</h3> : null}
                  {copy ? <p>{copy}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}

function ReasonsGrid({ data, locale }: { data: Record<string, unknown>; locale: Locale }) {
  const header = pick(data, "header", locale);
  const rawItems = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];
  if (!rawItems.length) return null;
  return (
    <Section className="cms-reasons">
      <Container>
        {header ? <h2 className="cms-reasons__header">{header}</h2> : null}
        <div className="cms-reasons__grid">
          {rawItems.map((it, i) => {
            const title = (it[`title_${locale}`] as string) || (it.title_en as string) || "";
            const copy = (it[`copy_${locale}`] as string) || (it.copy_en as string) || "";
            const icon = (it.icon as string) || "";
            return (
              <div key={i} className="cms-reason">
                {icon ? <span className="cms-reason__icon">{icon}</span> : null}
                {title ? <h3>{title}</h3> : null}
                {copy ? <p>{copy}</p> : null}
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

function ServicesCards({ data, locale }: { data: Record<string, unknown>; locale: Locale }) {
  const header = pick(data, "header", locale);
  const lede = pick(data, "lede", locale);
  const rawItems = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];
  if (!rawItems.length) return null;
  return (
    <Section className="cms-services">
      <Container>
        {header ? <h2 className="cms-services__header">{header}</h2> : null}
        {lede ? <p className="cms-services__lede">{lede}</p> : null}
        <div className="cms-services__grid">
          {rawItems.map((it, i) => {
            const title = (it[`title_${locale}`] as string) || (it.title_en as string) || "";
            const blurb = (it[`blurb_${locale}`] as string) || (it.blurb_en as string) || "";
            const ctaLabel = (it[`cta_label_${locale}`] as string) || (it.cta_label_en as string) || "";
            const ctaHref = (it.cta_href as string) || "";
            const img = (it.image_url as string) || "";
            return (
              <article key={i} className="cms-service-card">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="cms-service-card__img" />
                ) : null}
                {title ? <h3>{title}</h3> : null}
                {blurb ? <p>{blurb}</p> : null}
                {ctaLabel && ctaHref ? (
                  <ButtonLink href={ctaHref} variant="ghost" size="sm" withArrow>
                    {ctaLabel}
                  </ButtonLink>
                ) : null}
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

function StoriesCarousel({ data, locale }: { data: Record<string, unknown>; locale: Locale }) {
  const header = pick(data, "header", locale);
  const rawItems = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];
  if (!rawItems.length) return null;
  return (
    <Section className="cms-stories">
      <Container>
        {header ? <h2 className="cms-stories__header">{header}</h2> : null}
        <div className="cms-stories__row">
          {rawItems.map((it, i) => {
            const name = (it.name as string) || "";
            const country = (it.country as string) || "";
            const program = (it.program as string) || "";
            const quote = (it[`quote_${locale}`] as string) || (it.quote_en as string) || "";
            const img = (it.image_url as string) || "";
            return (
              <article key={i} className="cms-story-card">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="cms-story-card__img" />
                ) : null}
                {quote ? <blockquote>&ldquo;{quote}&rdquo;</blockquote> : null}
                <footer className="cms-story-card__meta">
                  {name ? <strong>{name}</strong> : null}
                  {country ? <span> · {country}</span> : null}
                  {program ? <span> · {program}</span> : null}
                </footer>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

function CountriesTabs({ data, locale }: { data: Record<string, unknown>; locale: Locale }) {
  const header = pick(data, "header", locale);
  const rawItems = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];
  if (!rawItems.length) return null;
  return (
    <Section className="cms-countries">
      <Container>
        {header ? <h2 className="cms-countries__header">{header}</h2> : null}
        <div className="cms-countries__grid">
          {rawItems.map((it, i) => {
            const flag = (it.flag as string) || "";
            const country = (it[`country_${locale}`] as string) || (it.country_en as string) || "";
            const blurb = (it[`blurb_${locale}`] as string) || (it.blurb_en as string) || "";
            const programs = Array.isArray(it.programs) ? (it.programs as Record<string, unknown>[]) : [];
            return (
              <article key={i} className="cms-country-card">
                <header>
                  {flag ? <span className="cms-country-card__flag">{flag}</span> : null}
                  {country ? <h3>{country}</h3> : null}
                </header>
                {blurb ? <p>{blurb}</p> : null}
                {programs.length ? (
                  <ul className="cms-country-card__programs">
                    {programs.map((p, j) => (
                      <li key={j}>
                        <strong>{(p.name as string) || ""}</strong>
                        {p.level ? <span> — {p.level as string}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

function FaqList({ data, locale }: { data: Record<string, unknown>; locale: Locale }) {
  const header = pick(data, "header", locale);
  const rawItems = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];
  if (!rawItems.length) return null;
  return (
    <Section className="cms-faq">
      <Container>
        {header ? <h2 className="cms-faq__header">{header}</h2> : null}
        <div className="cms-faq__list">
          {rawItems.map((it, i) => {
            const q = (it[`question_${locale}`] as string) || (it.question_en as string) || "";
            const a = (it[`answer_${locale}`] as string) || (it.answer_en as string) || "";
            if (!q) return null;
            return (
              <details key={i} className="cms-faq__item">
                <summary>{q}</summary>
                {a ? <p>{a}</p> : null}
              </details>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

function GalleryGrid({ data, locale }: { data: Record<string, unknown>; locale: Locale }) {
  const header = pick(data, "header", locale);
  const rawItems = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];
  if (!rawItems.length) return null;
  return (
    <Section className="cms-gallery">
      <Container>
        {header ? <h2 className="cms-gallery__header">{header}</h2> : null}
        <div className="cms-gallery__grid">
          {rawItems.map((it, i) => {
            const src = (it.image_url as string) || "";
            const caption = (it[`caption_${locale}`] as string) || (it.caption_en as string) || "";
            if (!src) return null;
            return (
              <figure key={i} className="cms-gallery__item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={caption} />
                {caption ? <figcaption>{caption}</figcaption> : null}
              </figure>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

const COMPONENT_MAP: Record<
  string,
  (props: { data: Record<string, unknown>; locale: Locale }) => React.ReactNode
> = {
  "hero.split": HeroSplit,
  "hero.centered": HeroCentered,
  "richtext": RichText,
  "cta.banner": CtaBanner,
  "marquee.logos": MarqueeLogos,
  "steps.numbered": StepsNumbered,
  "reasons.grid": ReasonsGrid,
  "services.cards": ServicesCards,
  "stories.carousel": StoriesCarousel,
  "countries.tabs": CountriesTabs,
  "faq.list": FaqList,
  "gallery.grid": GalleryGrid,
};

export function renderSection(section: PageSection, locale: Locale): React.ReactNode {
  const Cmp = COMPONENT_MAP[section.type];
  if (!Cmp) {
    return (
      <Section className="cms-unknown">
        <Container>
          <p className="cms-unknown__msg">
            Unknown section type: <code>{section.type}</code>
          </p>
        </Container>
      </Section>
    );
  }
  return <Cmp data={section.data ?? {}} locale={locale} />;
}

export function PageRenderer({
  sections,
  locale,
}: {
  sections: PageSection[];
  locale: Locale;
}) {
  return (
    <>
      {sections
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((s) => (
          <div key={s.uuid}>{renderSection(s, locale)}</div>
        ))}
    </>
  );
}
