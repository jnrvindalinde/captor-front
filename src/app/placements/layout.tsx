import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Placements",
  description:
    "Where our applicants have gone — programs, scholarships, and the work behind each placement.",
  openGraph: {
    title: "Placements · Career 360 Consult",
    description:
      "Where our applicants have gone — programs, scholarships, and the work behind each placement.",
  },
};

export default function PlacementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
