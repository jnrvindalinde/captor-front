import { Container } from "./Section";

export function Footer() {
  return (
    <footer className="foot">
      <Container>
        <div className="foot__inner">
          <div className="foot__brand">
            <a className="brand" href="/">
              <img
                src="/imports/c360 logo main dark.png"
                alt="Career360 Consult"
                className="brand__logo"
                height={42}
                width="auto"
              />
            </a>
            <p>
              A career and education consultancy connecting applicants,
              advisors, and institutions — by application, since 2014.
            </p>
          </div>
          <div className="foot__cols">
            <div>
              <h4>Explore</h4>
              <a href="/">Home</a>
              <a href="/services">Services</a>
              <a href="/placements">Placements</a>
              <a href="/stories">Stories</a>
            </div>
            <div>
              <h4>Resources</h4>
              <a href="/resources">Guides &amp; primers</a>
              <a href="/blog">Field notes</a>
              <a href="/#howitworks">How it works</a>
            </div>
            <div>
              <h4>Reach us</h4>
              <a href="/contact">Start a conversation</a>
              <a href="mailto:hello@career360consult.com">
                hello@career360consult.com
              </a>
              <span>17 Independence Ave, Accra</span>
            </div>
          </div>
        </div>
        <div className="foot__base">
          <span>© {new Date().getFullYear()} Career 360 Consult.</span>
          <span>All rights reserved.</span>
        </div>
      </Container>
    </footer>
  );
}
