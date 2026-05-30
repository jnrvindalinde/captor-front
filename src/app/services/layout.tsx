import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Application support, scholarship strategy, and post-acceptance preparation — packaged for serious applicants.",
  openGraph: {
    title: "Services · Career 360 Consult",
    description:
      "Application support, scholarship strategy, and post-acceptance preparation — packaged for serious applicants.",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
