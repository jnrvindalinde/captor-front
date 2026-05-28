"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type DataTableTab<K extends string = string> = {
  key: K;
  label: string;
  count?: number;
};

export type DataTableColumn<Row> = {
  key: string;
  header: ReactNode;
  /** Cell renderer. Falls back to (row as any)[key] if omitted. */
  render?: (row: Row) => ReactNode;
  /** Width hint, e.g. "12rem", "20%". */
  width?: string;
  align?: "left" | "right" | "center";
  /** Hide on narrow widths. */
  hideOnSm?: boolean;
};

export type DataTableProps<Row, K extends string = string> = {
  title?: ReactNode;
  description?: ReactNode;
  /** Optional right-side action (e.g. "View all →"). */
  action?: ReactNode;
  tabs?: DataTableTab<K>[];
  defaultTab?: K;
  /** Controlled active tab. */
  activeTab?: K;
  onTabChange?: (key: K) => void;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string | number;
  /** Make each row navigable to this href. */
  rowHref?: (row: Row) => string;
  emptyMessage?: ReactNode;
  /** Show simple search box that filters across visible columns' text. */
  searchable?: boolean;
  /** Optional pre-search filter applied to rows. */
  filter?: (row: Row) => boolean;
};

function toText(node: ReactNode): string {
  if (node == null || node === false || node === true) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join(" ");
  if (typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    if (props?.children !== undefined) return toText(props.children);
  }
  return "";
}

export function DataTable<Row, K extends string = string>({
  title,
  description,
  action,
  tabs,
  defaultTab,
  activeTab,
  onTabChange,
  columns,
  rows,
  rowKey,
  rowHref,
  emptyMessage = "No records to show.",
  searchable,
  filter,
}: DataTableProps<Row, K>) {
  const router = useRouter();
  const [internalTab, setInternalTab] = useState<K | undefined>(
    defaultTab ?? tabs?.[0]?.key
  );
  const tab = activeTab ?? internalTab;
  const setTab = (k: K) => {
    if (onTabChange) onTabChange(k);
    else setInternalTab(k);
  };

  const [query, setQuery] = useState("");

  const visibleRows = useMemo(() => {
    let r = rows;
    if (filter) r = r.filter(filter);
    if (searchable && query.trim()) {
      const q = query.trim().toLowerCase();
      r = r.filter((row) =>
        columns.some((c) => {
          const v = c.render ? c.render(row) : (row as Record<string, unknown>)[c.key];
          return toText(v as ReactNode).toLowerCase().includes(q);
        })
      );
    }
    return r;
  }, [rows, filter, searchable, query, columns]);

  const hasTabs = !!(tabs && tabs.length > 0);
  const searchInline = hasTabs && searchable;
  const searchInput = searchable ? (
    <input
      type="search"
      className="dt__search"
      placeholder="Search…"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      aria-label="Search table"
    />
  ) : null;

  return (
    <section className="dt">
      {(title || description || action || (searchable && !searchInline)) && (
        <header className="dt__head">
          <div className="dt__head-text">
            {title && <h2 className="dt__title">{title}</h2>}
            {description && <p className="dt__desc">{description}</p>}
          </div>
          {(action || (searchable && !searchInline)) && (
            <div className="dt__head-actions">
              {!searchInline && searchInput}
              {action}
            </div>
          )}
        </header>
      )}

      {hasTabs && (
        <div className="dt__tabs-row">
          <div className="dt__tabs" role="tablist" aria-label="Filter">
            {tabs!.map((t) => {
              const isActive = t.key === tab;
              return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`dt__tab${isActive ? " is-active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                <span>{t.label}</span>
                {typeof t.count === "number" && (
                  <motion.span
                    layout
                    className="dt__tab-count"
                    aria-hidden
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  >
                    {t.count}
                  </motion.span>
                )}
                {isActive && (
                  <motion.span
                    layoutId="dt-tab-indicator"
                    className="dt__tab-indicator"
                    transition={{ type: "spring", stiffness: 480, damping: 38 }}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
          </div>
          {searchInline && searchInput}
        </div>
      )}

      <div className="dt__scroll">
        <table className="dt__table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={c.width ? { width: c.width } : undefined}
                  className={[
                    c.align === "right" && "dt__cell--right",
                    c.align === "center" && "dt__cell--center",
                    c.hideOnSm && "dt__cell--hide-sm",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                  scope="col"
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="dt__empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false} mode="popLayout">
                {visibleRows.map((row) => {
                  const href = rowHref?.(row);
                  return (
                    <motion.tr
                      key={rowKey(row)}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className={`dt__row${href ? " dt__row--link" : ""}`}
                      onClick={href ? () => router.push(href) : undefined}
                      tabIndex={href ? 0 : -1}
                      onKeyDown={
                        href
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                router.push(href);
                              }
                            }
                          : undefined
                      }
                    >
                      {columns.map((c, ci) => {
                        const v = c.render
                          ? c.render(row)
                          : (row as Record<string, unknown>)[c.key];
                        const isFirst = ci === 0;
                        return (
                          <td
                            key={c.key}
                            className={[
                              c.align === "right" && "dt__cell--right",
                              c.align === "center" && "dt__cell--center",
                              c.hideOnSm && "dt__cell--hide-sm",
                            ]
                              .filter(Boolean)
                              .join(" ") || undefined}
                          >
                            {href && isFirst ? (
                              <Link
                                href={href}
                                className="dt__row-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {v as ReactNode}
                              </Link>
                            ) : (
                              (v as ReactNode)
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DataTable;

