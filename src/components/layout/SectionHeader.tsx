"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  kicker?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "start" | "center" | "split";
  light?: boolean;
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function SectionHeader({
  kicker,
  title,
  lede,
  align = "start",
  light,
}: Props) {
  const cls =
    align === "center"
      ? "sec-head sec-head--center"
      : align === "split"
      ? "sec-head sec-head--split"
      : "sec-head";

  return (
    <motion.header
      className={cls}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      {kicker && (
        <motion.span
          className={`kicker ${light ? "kicker--light" : ""}`}
          variants={fadeUp}
        >
          {kicker}
        </motion.span>
      )}
      <motion.h2 className="h2" variants={fadeUp} style={light ? { color: "#fff" } : undefined}>
        {title}
      </motion.h2>
      {lede && (
        <motion.p
          className={`lede sec-head__lede ${light ? "lede--light" : ""}`}
          variants={fadeUp}
        >
          {lede}
        </motion.p>
      )}
    </motion.header>
  );
}
