import React, { useState, useEffect } from "react";
import { motion, useScroll, useReducedMotion } from "framer-motion";
import { landingTokens } from "../landing-ui/designTokens";
import { Compass, Menu, X, Sun, Moon } from "lucide-react";

export const StickyNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("chapter-hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // ── Dark mode toggle (standalone, works without AppContext) ──────────
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("pm-guest-dark-mode", String(next));
    } catch {}
  };

  // Sync on mount if localStorage has a value
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pm-guest-dark-mode");
      if (saved !== null) {
        const val = saved === "true";
        setIsDark(val);
        document.documentElement.classList.toggle("dark", val);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      const sections = [
        "chapter-hero",
        "chapter-showcase",
        "chapter-workflow",
        "chapter-reports",
        "chapter-ai",
      ];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { target: "chapter-showcase", label: "Features" },
    { target: "chapter-workflow", label: "Workflow" },
    { target: "chapter-reports",  label: "Reports" },
    { target: "chapter-ai",       label: "AI Vision" },
  ];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 shadow-sm shadow-slate-900/5"
          : "py-5 bg-transparent"
      }`}
    >
      {/* Scroll progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-500 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollTo("chapter-hero")}
          className="flex items-center gap-2 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Compass className="w-[18px] h-[18px]" />
          </div>
          <span className="text-base font-black tracking-tight text-slate-800 dark:text-white">
            Career OS
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map(({ target, label }) => {
            const isActive = activeSection === target;
            return (
              <button
                key={target}
                onClick={() => scrollTo(target)}
                className={`relative text-xs font-bold uppercase tracking-wider py-1.5 focus:outline-none transition-colors duration-200 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {label}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400"
                    transition={shouldReduceMotion ? { duration: 0.1 } : landingTokens.spring}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop CTAs + Theme Toggle */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Dark/Light toggle */}
          <button
            onClick={toggleDarkMode}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            aria-label="Toggle dark mode"
          >
            <motion.div
              key={isDark ? "moon" : "sun"}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.div>
          </button>

          <a
            href="/login"
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2 transition-colors"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition-all duration-200 shadow-md shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Get Started
          </a>
        </div>

        {/* Mobile: toggle + menu */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-600 dark:text-slate-300 focus:outline-none"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/5 py-5 px-6 flex flex-col gap-4 shadow-xl">
          {navLinks.map(({ target, label }) => (
            <button
              key={target}
              onClick={() => scrollTo(target)}
              className="text-left py-1 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {label}
            </button>
          ))}
          <div className="flex items-center gap-4 pt-3 border-t border-slate-200 dark:border-white/5">
            <a href="/login" className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Sign In
            </a>
            <a
              href="/register"
              className="text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-xl flex-1 text-center"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
export default StickyNavbar;
