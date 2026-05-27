"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "inverse"
  | "outline"
  | "outline-light"
  | "ghost"
  | "energy";

export type ButtonSize = "sm" | "md" | "lg";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  withArrow?: boolean;
  children: ReactNode;
  className?: string;
};

const buildClass = ({
  variant = "primary",
  size = "md",
  withArrow,
  className,
}: Pick<CommonProps, "variant" | "size" | "withArrow" | "className">) =>
  [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    withArrow ? "btn--arrow" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

const ArrowGlyph = () => (
  <span className="btn__arrow" aria-hidden="true">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  </span>
);

const motionDefaults = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring" as const, stiffness: 320, damping: 22 },
};

/* ------- <Button> (motion.button) ------- */
export type ButtonProps = CommonProps &
  Omit<HTMLMotionProps<"button">, keyof CommonProps>;

export function Button({
  variant,
  size,
  withArrow,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      {...motionDefaults}
      {...rest}
      className={buildClass({ variant, size, withArrow, className })}
    >
      <span>{children}</span>
      {withArrow && <ArrowGlyph />}
    </motion.button>
  );
}

/* ------- <ButtonLink> (motion.a) ------- */
export type ButtonLinkProps = CommonProps &
  Omit<HTMLMotionProps<"a">, keyof CommonProps> & { href: string };

export function ButtonLink({
  variant,
  size,
  withArrow,
  children,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <motion.a
      {...motionDefaults}
      {...rest}
      className={buildClass({ variant, size, withArrow, className })}
    >
      <span>{children}</span>
      {withArrow && <ArrowGlyph />}
    </motion.a>
  );
}

/* ------- Inline link (no pill) — for "Read more" style ------- */
export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={`link-arrow ${className ?? ""}`}>
      {children}
      <span className="link-arrow__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7" />
          <path d="M8 7h9v9" />
        </svg>
      </span>
    </a>
  );
}
