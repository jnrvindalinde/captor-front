import Link from "next/link";
import { Container } from "@/components/layout/Section";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <SiteNav tone="light" />
      <Container>
        <div className="not-found">
          <span className="kicker">404 — Page not found</span>
          <h1 className="h1 not-found__title">
            That page <span className="serif">isn&apos;t here</span>.
          </h1>
          <p className="not-found__lede">
            The link may have changed, or the page is no longer published. Try
            one of the routes below — or head back to the start.
          </p>
          <div className="not-found__actions">
            <Link href="/" className="not-found__primary">
              Back to home
            </Link>
            <Link href="/services" className="not-found__secondary">
              Browse services
            </Link>
            <Link href="/blog" className="not-found__secondary">
              Read the blog
            </Link>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
