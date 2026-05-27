"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Section, Container } from "@/components/layout/Section";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { ArrowLink, ButtonLink } from "@/components/ui/Button";
import { notFound } from "next/navigation";

const stories = [
  {
    slug: "akosua-b",
    initials: "AB",
    quote:
      "I came in unsure between two career paths and walked out with a one-year plan that finally felt like mine. The advisory was practical, kind, and never generic.",
    name: "Akosua B.",
    role: "Mid-career professional · Accra",
    outcome: "Career repositioned",
    color: "var(--color-sky)",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=600&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    ],
    fullStory: [
      "Akosua had spent six years in corporate marketing, but the role no longer aligned with her values. She knew she wanted a change, but was torn between two paths: scaling up into a director role within a tech startup, or pivoting entirely into education and impact-driven work.",
      "In our first session, we mapped out her skills, her motivations, and the real constraints she was working within. We didn't try to convince her one way or the other. Instead, we walked through what each path would actually look like—salary, hours, daily work, growth trajectory, and alignment with her stated values.",
      "By the end, Akosua had clarity. She took a year off, completed a short teacher training certification, and now leads curriculum design for a tech education nonprofit in Accra. She tells us the one-year plan we built has stayed accurate every step of the way.",
    ],
  },
  {
    slug: "kwadwo-m",
    initials: "KM",
    quote:
      "They helped me shape an SOP that actually sounded like me, then walked me through every step of my Mastercard Foundation application until the offer came in.",
    name: "Kwadwo M.",
    role: "MSc Public Health · Edinburgh, 2025",
    outcome: "Fully funded — Mastercard",
    color: "#72b4d6",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80",
    ],
    fullStory: [
      "Kwadwo is a public health professional from Accra interested in epidemiology and global health systems. He had a strong application profile—good undergraduate grades, two years of fieldwork experience—but his statement of purpose read like a generic mission statement. It could have been written by anyone.",
      "We spent two sessions on the SOP. First, we interviewed him on his actual decisions: Why epidemiology? What moment changed his mind? What research question keeps him up at night? What did he learn that surprised him?",
      "His rewritten SOP was 40% shorter, three times more specific, and it centered on a single public health challenge he'd observed in Ghana that got him into the field in the first place. That specificity got him into the Mastercard Foundation scholars program with full funding to Edinburgh.",
    ],
  },
  {
    slug: "nana-a",
    initials: "NA",
    quote:
      "Career 360 reviewed my CV, prepped me for three interviews, and connected me with mentors in my field. I had two offers within six weeks.",
    name: "Nana A.",
    role: "Software Engineer · Remote, EU",
    outcome: "Two offers in six weeks",
    color: "rgba(165, 206, 0, 0.8)",
    image: "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=600&h=600&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=80",
    ],
    fullStory: [
      "Nana had been working as a mid-level engineer in Lagos but wanted to explore opportunities in the EU tech market. She had strong technical skills but had never interviewed at a senior level for global companies.",
      "We worked through CV positioning, technical interview strategy, and salary negotiation. More importantly, we connected her with two engineers at our network who were already working remotely in Berlin and Amsterdam. They gave her real feedback on what EU tech companies look for and what the day-to-day actually looks like.",
      "Six weeks later, Nana had two offers—one from Berlin, one from a distributed startup based in Barcelona. She chose the Barcelona role and is now leading backend infrastructure for a Series B company.",
    ],
  },
  {
    slug: "efua-o",
    initials: "EO",
    quote:
      "I had three rejections before I came in. We rebuilt my application from scratch, reframed my story, and the next round produced two acceptances.",
    name: "Efua O.",
    role: "MA International Relations · Sciences Po",
    outcome: "Admitted with funding",
    color: "var(--color-sky)",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=600&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=80",
    ],
    fullStory: [
      "Efua applied to five master's programs in international relations. She was rejected from three, waitlisted from one, and admitted to a safety school. She wanted to reapply the following year but felt stuck—she didn't know what had gone wrong.",
      "We audited her applications and found the issue wasn't her CV or grades. It was her SOP. She'd written a generic essay about global affairs instead of a specific, argued case for why she wanted to study IR at each specific school.",
      "We rebuilt her approach completely. For Sciences Po specifically, she wrote about her background in West African trade policy and why their program's methodology was the only one that would prepare her for her research agenda. We also reframed her background—she'd downplayed her policy work, but that was actually her strongest asset.",
      "The revised application got her admitted to Sciences Po with a partial scholarship.",
    ],
  },
  {
    slug: "jojo-k",
    initials: "JK",
    quote:
      "The intake form felt rigorous before the call — and it was. By the time we met, my advisor already knew exactly what to challenge me on.",
    name: "Jojo K.",
    role: "MBA candidate · Toronto",
    outcome: "Two MBA offers",
    color: "#72b4d6",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80",
    ],
    fullStory: [
      "Jojo worked in fintech in Singapore and wanted to pursue an MBA to transition into climate tech investing. He'd never written a GMAT essay or thought through his post-MBA goal deeply.",
      "Our application form asked him specific questions: What will you do in year one post-MBA that you can't do now? Which three companies will you definitely apply to for internships? When our team reviewed his answers, we saw he hadn't thought this through clearly yet.",
      "In our session, we challenged him on every vague statement. Not to be difficult, but because admissions committees will do the same—and he was competing against people with crystal-clear answers. By the end of the call, Jojo had a specific, testable hypothesis about what an MBA would enable him to do.",
      "He applied with that clarity. He got into Rotman and Schulich with scholarship offers from both.",
    ],
  },
  {
    slug: "adwoa-y",
    initials: "AY",
    quote:
      "What I valued most was the honesty. They told me which schools were a stretch and which were a fit. That clarity saved me a year.",
    name: "Adwoa Y.",
    role: "BSc Computer Science · TU Munich",
    outcome: "Undergrad admission, DAAD funded",
    color: "rgba(165, 206, 0, 0.8)",
    image: "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=600&h=600&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
    ],
    fullStory: [
      "Adwoa is a high-performing secondary student in Accra interested in computer science and wanted to study in Germany (tuition-free or low-cost). Her parents wanted her to apply to US schools too, but she was concerned about cost and visa uncertainty.",
      "We mapped out a realistic shortlist for her: schools where she had a real shot based on her profile (TU Munich, TU Berlin, Technische Universität Darmstadt), not schools where she was gambling on an unpredictable admissions process.",
      "Adwoa applied to five German universities and got into three. More importantly, she was awarded a DAAD scholarship (German government funding for international students) at TU Munich. She starts this fall with costs covered.",
      "In retrospect, Adwoa says the shortlist clarity saved her a year of uncertainty. Instead of applying broadly and hoping, she had a focused plan.",
    ],
  },
];

export default function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const story = stories.find((s) => s.slug === slug);

  if (!story) {
    notFound();
  }

  const storyIndex = stories.findIndex((s) => s.slug === slug);
  const nextStory = stories[(storyIndex + 1) % stories.length];

  return (
    <>
      <main className="story-detail-page">
        <SiteNav tone="light" />
        <header className="story-detail-hero">
          <Container className="story-detail-hero__inner">
            <motion.div
              className="story-detail-hero__avatar"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={story.image}
                alt={story.name}
                width={160}
                height={160}
                priority
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="h1" style={{ marginBottom: "8px", color: "var(--color-navy)" }}>
                {story.name}
              </h1>
              <p className="lede" style={{ color: "var(--color-ink-muted)" }}>
                {story.role}
              </p>
            </motion.div>
          </Container>
        </header>

        <Section id="story-detail">
          <Container>
            <div className="story-detail-content">
              {/* Quote highlight */}
              <motion.div
                className="story-detail-quote-block"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="story-detail-quote">{story.quote}</p>
                <span className="story-detail-outcome">{story.outcome}</span>
              </motion.div>

              {/* Full story body */}
              <motion.div
                className="story-detail-body"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {story.fullStory.map((paragraph, i) => (
                  <p key={i} className="story-detail-paragraph">
                    {paragraph}
                  </p>
                ))}
              </motion.div>

              {/* Gallery */}
              {story.gallery && story.gallery.length > 0 && (
                <motion.div
                  className="story-detail-gallery"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {story.gallery.map((src, i) => {
                    // Cycle through landscape, portrait, square to create a varied masonry
                    const aspects = [
                      { w: 800, h: 533 }, // landscape 3:2
                      { w: 800, h: 1067 }, // portrait 3:4
                      { w: 800, h: 800 }, // square
                    ];
                    const { w, h } = aspects[i % aspects.length];
                    const sized = src.replace(
                      /\?w=\d+(&h=\d+)?/,
                      `?w=${w}&h=${h}`
                    );
                    return (
                      <div key={i} className="story-detail-gallery__item">
                        <Image
                          src={sized}
                          alt={`${story.name} — gallery ${i + 1}`}
                          width={w}
                          height={h}
                          loading="lazy"
                        />
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Navigation */}
              <motion.div
                className="story-detail-nav"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={`/stories/${nextStory.slug}`} className="story-detail-nav-link">
                  <div className="story-detail-nav-content">
                    <span className="story-detail-nav-label">Next story</span>
                    <strong>{nextStory.name}</strong>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </Link>
              </motion.div>

              {/* Back to all stories */}
              <div className="story-detail-back">
                <ArrowLink href="/stories">Back to all stories</ArrowLink>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
