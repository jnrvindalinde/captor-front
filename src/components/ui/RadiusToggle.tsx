"use client";

import { useEffect, useState } from "react";

/**
 * Floating dev toggle that flips `data-radius` on <html> between the default
 * rounded design language and a "sharp" / edgy override (all radii → 0).
 *
 * To remove the experiment entirely: delete this file and its import in
 * `src/app/layout.tsx`. Nothing else in the app references it.
 */
export function RadiusToggle() {
  const [sharp, setSharp] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (sharp) root.setAttribute("data-radius", "sharp");
    else root.removeAttribute("data-radius");
  }, [sharp]);

  return (
    <button
      type="button"
      onClick={() => setSharp((v) => !v)}
      aria-pressed={sharp}
      title="Toggle sharp / rounded design"
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        zIndex: 9999,
        padding: "10px 14px",
        background: sharp ? "#0a2659" : "#ffffff",
        color: sharp ? "#ffffff" : "#0a2659",
        border: "1px solid #0a2659",
        borderRadius: sharp ? 0 : 999,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(15,23,42,0.18)",
      }}
    >
      {sharp ? "Sharp · on" : "Sharp · off"}
    </button>
  );
}
