import type { ReactNode } from "react";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`container ${className ?? ""}`}>{children}</div>;
}
export function Container2({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`containe w-full ${className ?? ""}`}>{children}</div>;
}

export function Section({
  id,
  children,
  className,
  tight,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tight?: boolean;
}) {
  return (
    <section
      id={id}
      className={`${tight ? "section section-tight" : "section"} ${className ?? ""}`}
    >
      <Container>{children}</Container>
      {/* <Container2>{children}</Container2> */}
    </section>
  );
}
