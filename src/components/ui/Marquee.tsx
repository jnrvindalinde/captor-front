import { useTranslations } from "next-intl";

export function Marquee({ items }: { items: string[] }) {
  const t = useTranslations("marquee");
  // double the list so the loop is seamless
  const doubled = [...items, ...items];
  return (
    <section className="marquee" aria-label={t("ariaLabel")}>
      <div className="marquee__track">
        {doubled.map((name, i) => (
          <span key={`${name}-${i}`} className="marquee__item">
            {name}<span className="marquee__sep" aria-hidden="true">{"\u2726"}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
