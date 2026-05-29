"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Section";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { CmsInjectedSections } from "@/components/sections/CmsInjectedSections";
import { blogs } from "./_data";

export default function BlogPage() {
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [activeTag, setActiveTag] = useState<string>("All");
  const filteredBlogs = activeTag === "All" ? blogs : blogs.filter((b) => b.tags?.includes(activeTag));

  return (
    <div className="blog-page">
      <SiteNav tone="light" />

      <Container>
        <motion.div
          className="blog-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="h1">Career insights, career strategies, and real talk.</h1>
          <p className="blog-hero__subtitle">
            Deep dives into application season, graduate school planning, and building a career that fits your goals.
          </p>
        </motion.div>
      </Container>

      {/* View Toggle */}
      <Container>
        <div className="blog-controls">
          <div className="blog-view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === "card" ? "active" : ""}`}
              onClick={() => setViewMode("card")}
              title="Card view"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </Container>

      {/* Blog Grid / List */}
      <Container>
        <AnimatePresence mode="wait">
          {filteredBlogs.length === 0 ? (
            <motion.div
              key="empty"
              className="blog-empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h3 className="blog-empty__title">No posts under <em>{activeTag}</em> yet.</h3>
              <p className="blog-empty__lede">
                We&apos;re still writing on that topic. Try another tag, or read everything.
              </p>
              <button type="button" className="blog-empty__reset" onClick={() => setActiveTag("All")}>
                Show all posts
              </button>
            </motion.div>
          ) : viewMode === "card" ? (
            <motion.div
              key="card-view"
              className="blog-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredBlogs.map((blog, index) => (
                <motion.article
                  key={blog.slug}
                  className="blog-card"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/blog/${blog.slug}`} className="blog-card__link">
                    <div className="blog-card__image">
                      <Image
                        src={blog.hero}
                        alt={blog.title}
                        width={600}
                        height={400}
                        sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="blog-card__content">
                      <div className="blog-card__meta">
                        <time>{blog.date}</time>
                        <span>·</span>
                        <span>{blog.readTime}</span>
                      </div>
                      <h2 className="h3">{blog.title}</h2>
                      <p className="blog-card__excerpt">{blog.excerpt}</p>
                      <div className="blog-card__author">
                        <span className="blog-card__author-name">{blog.author.name}</span>
                        <span className="blog-card__author-role">{blog.author.role}</span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              className="blog-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredBlogs.map((blog, index) => (
                <motion.article
                  key={blog.slug}
                  className="blog-list-item"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/blog/${blog.slug}`} className="blog-list-item__link">
                    <div className="blog-list-item__image">
                      <Image
                        src={blog.hero}
                        alt={blog.title}
                        width={150}
                        height={150}
                        sizes="150px"
                      />
                    </div>
                    <div className="blog-list-item__content">
                      <h3 className="blog-list-item__title">{blog.title}</h3>
                      <p className="blog-list-item__excerpt">{blog.excerpt}</p>
                      <div className="blog-list-item__footer">
                        <div className="blog-list-item__meta">
                          <time>{blog.date}</time>
                          <span>·</span>
                          <span>{blog.readTime}</span>
                        </div>
                        <div className="blog-list-item__author">
                          <span>{blog.author.name}</span>
                          <span className="blog-list-item__author-role">{blog.author.role}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      <CmsInjectedSections slug="blog-before-footer" />
      <Footer />
    </div>
  );
}
