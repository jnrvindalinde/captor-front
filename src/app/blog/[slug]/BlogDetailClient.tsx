"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "../_data";

interface BlogDetailClientProps {
  blog: BlogPost;
  prev: BlogPost | null;
  next: BlogPost | null;
}

export function BlogDetailClient({ blog, prev, next }: BlogDetailClientProps) {
  return (
    <>
      <header className="blog-detail-hero">
        <div className="blog-detail-hero__bg">
          <Image
            src={blog.hero}
            alt={blog.title}
            width={1400}
            height={700}
            priority
            sizes="(max-width: 900px) 100vw, 1400px"
            className="blog-detail-hero__bg-img"
          />
          <div className="blog-detail-hero__overlay" />
        </div>
        <div className="blog-detail-hero__inner">
          <motion.div
            className="blog-detail-hero__meta"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span>{blog.date}</span>
            <span className="blog-detail-hero__dot" aria-hidden="true">·</span>
            <span>{blog.readTime}</span>
          </motion.div>

          <motion.h1
            className="h1"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            {blog.title}
          </motion.h1>

          <motion.p
            className="blog-detail-hero__excerpt"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {blog.excerpt}
          </motion.p>

          <motion.div
            className="blog-detail-hero__author"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="blog-detail-hero__author-label">By</span>
            <strong>{blog.author.name}</strong>
            <span>· {blog.author.role}</span>
          </motion.div>
        </div>
      </header>

      <article className="blog-detail-body">
        {blog.sections.map((section, sIdx) => (
          <motion.section
            key={`${sIdx}-${section.heading}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {section.heading && <h2>{section.heading}</h2>}
            {section.blocks.map((block, i) => {
              if (block.type === "paragraph") {
                return (
                  <p key={i}>{block.content}</p>
                );
              } else if ((block as { type: string }).type === "html") {
                const html = (block as unknown as { html: string }).html;
                return (
                  <div
                    key={i}
                    className="blog-detail-rte"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              } else if (block.type === "bulletList") {
                return (
                  <ul key={i} className="blog-detail-list blog-detail-list--bullets">
                    {block.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              } else if (block.type === "numberedList") {
                return (
                  <ol key={i} className="blog-detail-list blog-detail-list--numbered">
                    {block.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ol>
                );
              } else if (block.type === "indented") {
                return <p key={i} className="blog-detail-indented">{block.content}</p>;
              }
              return null;
            })}
          </motion.section>
        ))}
      </article>

      <aside className="blog-detail-tags">
        <ul>
          {blog.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </aside>

      <nav className="blog-detail-nav" aria-label="More posts">
        {prev ? (
          <Link href={`/blog/${prev.slug}`} className="blog-detail-nav-btn blog-detail-nav-btn--prev" title={prev.title}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Previous</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/blog/${next.slug}`} className="blog-detail-nav-btn blog-detail-nav-btn--next" title={next.title}>
            <span>Next</span>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ) : <span />}
      </nav>

      <div className="blog-detail-back">
        <Link href="/blog" className="blog-detail-back-link">
          ← Back to all posts
        </Link>
      </div>
    </>
  );
}
