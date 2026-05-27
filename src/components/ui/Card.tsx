"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type CardProps = {
  variant?: "default" | "soft" | "media";
  interactive?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<HTMLMotionProps<"article">, "children" | "className">;

export function Card({
  variant = "default",
  interactive,
  className,
  children,
  ...rest
}: CardProps) {
  const classes = [
    "card",
    variant === "soft" ? "card--soft" : "",
    variant === "media" ? "card--media" : "",
    interactive ? "card--interactive" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.article className={classes} {...rest}>
      {children}
    </motion.article>
  );
}

export function CardMediaThumb({
  src,
  alt = "",
}: {
  src: string;
  alt?: string;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <div className="card-media__thumb">
      <img src={src} alt={alt} />
    </div>
  );
}

export function CardMediaBody({ children }: { children: ReactNode }) {
  return <div className="card-media__body">{children}</div>;
}

export function IconTile({
  children,
  variant = "navy",
}: {
  children: ReactNode;
  variant?: "navy" | "soft";
}) {
  return (
    <div
      className={`icon-tile ${variant === "soft" ? "icon-tile--soft" : ""}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
