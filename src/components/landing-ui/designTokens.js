// Central design token registry for the landing page
// Every section and component reads from here — no ad-hoc values.

export const landingTokens = {
  // ── Border radius ─────────────────────────────────────────────────────────
  radius:       "rounded-3xl",
  radiusInner:  "rounded-2xl",
  radiusCard:   "rounded-xl",

  // ── Glass surfaces ────────────────────────────────────────────────────────
  // Semi-transparent panel (blur-based)
  glass:
    "bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/8 backdrop-blur-xl",
  // Solid panel (high opacity, still readable on any bg)
  glassSolid:
    "bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-white/8 backdrop-blur-2xl",

  // ── Shadows ───────────────────────────────────────────────────────────────
  shadowSoft:
    "shadow-[0_8px_32px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
  shadowHover:
    "shadow-[0_16px_48px_rgba(37,99,235,0.12)] dark:shadow-[0_16px_48px_rgba(37,99,235,0.22)]",

  // ── Typography ────────────────────────────────────────────────────────────
  textMuted:  "text-slate-500 dark:text-slate-400 font-medium",
  textTitle:  "text-slate-900 dark:text-white font-black",
  textLabel:  "text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500",

  // ── Motion springs ────────────────────────────────────────────────────────
  spring: {
    type:      "spring",
    stiffness: 90,
    damping:   16,
    mass:      0.85,
  },
  springSnappy: {
    type:      "spring",
    stiffness: 130,
    damping:   12,
    mass:      0.7,
  },

  // ── Duration presets (seconds) ────────────────────────────────────────────
  duration: {
    fast:   0.2,
    normal: 0.45,
    slow:   0.8,
  },

  // ── Section backgrounds — alternating light rhythm ────────────────────────
  // Use these in order down the page for visual rhythm:
  // sectionA → sectionB → sectionA → sectionB …
  sectionA: "bg-white dark:bg-slate-950",
  sectionB: "bg-slate-50 dark:bg-[#080c14]",
  // Special dark-only section (AI Labs, cinematic sections)
  sectionDark: "bg-[#030712]",
};
