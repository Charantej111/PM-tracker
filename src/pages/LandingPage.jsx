import { motion } from "framer-motion";
import { ArrowRight, BarChart3, BookOpen, CheckCircle2, Moon, ShieldCheck, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import DashboardPreview from "../components/DashboardPreview";
import { useAppContext } from "../context/AppContext";

const features = [
  {
    icon: BarChart3,
    title: "Track career readiness",
    description: "See your roadmap, skill growth, and portfolio progress in one clean operating system.",
  },
  {
    icon: BookOpen,
    title: "Stay consistent daily",
    description: "Use focused planning blocks for PM, SQL, analytics, and communication practice.",
  },
  {
    icon: ShieldCheck,
    title: "Own your momentum",
    description: "Local-first persistence keeps your learning system fast, private, and dependable.",
  },
];

export default function LandingPage() {
  const { isDarkMode, toggleTheme } = useAppContext();

  return (
    <div className="min-h-screen overflow-hidden px-4 pb-16 pt-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="glass-panel flex items-center justify-between rounded-[28px] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-sky-400 text-lg font-bold text-white">
              PM
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-ink dark:text-white">PM Career OS</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Premium PM growth dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:border-accent/30 hover:text-accent dark:border-white/10 dark:text-slate-300"
              title={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Create account</Button>
            </Link>
          </div>
        </header>

        <section className="relative isolate pt-14 md:pt-20">
          <div className="absolute inset-x-0 -top-10 h-[420px] bg-hero-glow blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.96fr] lg:items-center">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex rounded-full border border-accent/15 bg-white/80 px-4 py-2 text-sm font-semibold text-accent shadow-soft dark:border-white/10 dark:bg-slate-900/80"
              >
                Become a Product Manager, One Day at a Time.
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink dark:text-white md:text-6xl"
              >
                A personal operating system for learning, shipping, and breaking into product.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400"
              >
                Track learning, skills, projects, goals, and career progress toward becoming a Product Manager with a calm, premium dashboard built for focus.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link to="/register">
                  <Button className="px-6">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="secondary" className="px-6">
                    View Roadmap
                  </Button>
                </Link>
              </motion.div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Learning streak", value: "19 days" },
                  { label: "Overall completion", value: "74%" },
                  { label: "Weekly study hours", value: "22h" },
                ].map((stat) => (
                  <Card key={stat.label} className="bg-white/75 dark:bg-slate-900/75" hover={false}>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <div className="mt-3 text-3xl font-bold text-ink dark:text-white">{stat.value}</div>
                  </Card>
                ))}
              </div>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <section className="mt-20 grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="h-full bg-white/80 dark:bg-slate-900/80">
                  <div className="w-fit rounded-2xl bg-accent-soft/15 p-3 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-ink dark:text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{feature.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </section>

        <section className="mt-20">
          <div className="glass-panel rounded-[36px] px-6 py-10 text-center md:px-12">
            <div className="mx-auto max-w-2xl">
              <div className="inline-flex rounded-full bg-accent-soft/15 px-4 py-2 text-sm font-semibold text-accent">
                Portfolio-worthy by design
              </div>
              <h3 className="mt-5 font-display text-4xl font-semibold text-ink dark:text-white">
                Built to look like a real SaaS product recruiters can trust.
              </h3>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
                Use PM Career OS in interviews, portfolios, internship applications, and your LinkedIn featured projects.
              </p>
              <div className="mt-8">
                <Link to="/register">
                  <Button className="px-6">
                    Start your dashboard
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
