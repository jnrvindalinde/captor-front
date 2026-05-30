import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a discovery call or send us a note. We reply within a working day.",
  openGraph: {
    title: "Contact · Career 360 Consult",
    description:
      "Book a discovery call or send us a note. We reply within a working day.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
