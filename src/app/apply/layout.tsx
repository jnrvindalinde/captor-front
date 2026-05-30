import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply",
  description:
    "Start your application with Career 360 Consult — tell us about your goals and we'll come back with a plan.",
  openGraph: {
    title: "Apply · Career 360 Consult",
    description:
      "Start your application with Career 360 Consult — tell us about your goals and we'll come back with a plan.",
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
