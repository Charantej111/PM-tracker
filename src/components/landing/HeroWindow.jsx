import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Calendar, Layout, Award, BarChart2, Activity, Search, Bell } from "lucide-react";

const NAV = [
  { key: "planner", label: "Planner", icon: Calendar },
  { key: "roadmap", label: "Roadmap", icon: Layout },
  { key: "reports", label: "Reports", icon: BarChart2 },
  { key: "portfolio", label: "Portfolio", icon: Award },
];

export default function HeroWindow({ step, tab, activePresetData, skill, readinessPct, roadmapPct, checked, noMotion }) {
  return (
    <div
      className="relative bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-white/[0.07] rounded-[20px] overflow-hidden shadow-2xl shadow-slate-300/50 dark:shadow-black/50 backdrop-blur-sm"
      style={noMotion ? {} : { transform: "perspective(1200px) rotateY(-3deg) rotateX(2deg)" }}
    >
      {/* Top gradient strip */}
      <div className="h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      {/* Chrome bar */}
      <div className="h-11 bg-slate-50/90 dark:bg-slate-950/70 border-b border-slate-100 dark:border-white/[0.05] flex items-center px-4 gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-3">
          <div className="mx-auto w-48 h-6 rounded-md bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/[0.04] flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">career-os.app</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-300 dark:text-slate-600">
          <Search className="w-3.5 h-3.5" />
          <Bell className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Body */}
      <div className="flex h-[380px]">
        {/* Sidebar */}
        <div className="w-[148px] shrink-0 bg-slate-50/60 dark:bg-slate-950/40 border-r border-slate-100/60 dark:border-white/[0.05] flex flex-col p-3 gap-4">
          {/* User avatar */}
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-white/[0.05]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black shadow-md shadow-blue-500/20">AC</div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-800 dark:text-white truncate leading-none">Alex Chen</div>
              <div className="text-[8px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{activePresetData.role}</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-0.5 flex-1">
            {NAV.map(item => {
              const active = tab === item.key;
              return (
                <div key={item.key} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[10px] font-semibold transition-all duration-200 ${
                  active
                    ? "bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}>
                  <item.icon className={`w-3.5 h-3.5 shrink-0 ${active ? "" : "opacity-60"}`} />
                  {item.label}
                  {active && <div className="ml-auto w-1 h-1 rounded-full bg-blue-500" />}
                </div>
              );
            })}
          </nav>

          {/* Readiness ring */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.05]">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 40 40" className="w-9 h-9 -rotate-90 shrink-0">
                <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3.5" className="stroke-slate-100 dark:stroke-slate-800" />
                <motion.circle
                  cx="20" cy="20" r="16" fill="none" strokeWidth="3.5" strokeLinecap="round"
                  stroke={activePresetData.accent || "#3b82f6"}
                  strokeDasharray="100"
                  animate={{ strokeDashoffset: 100 * (1 - readinessPct / 100) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div>
                <div className="text-sm font-black text-slate-800 dark:text-white leading-none">{readinessPct}%</div>
                <div className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Readiness</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab bar */}
          <div className="h-10 border-b border-slate-100 dark:border-white/[0.05] flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${tab === "planner" ? "bg-emerald-400" : tab === "roadmap" ? "bg-blue-400" : tab === "reports" ? "bg-violet-400" : "bg-amber-400"}`} />
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {tab === "planner" ? "Daily Planner" : tab === "roadmap" ? "Learning Roadmap" : tab === "reports" ? "Performance" : "Portfolio Goals"}
              </span>
            </div>
            <span className="text-[8px] font-bold text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {/* PLANNER */}
              {tab === "planner" && (
                <motion.div key="planner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-2.5">
                  <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Today · Jun 30</div>
                  {[
                    { text: `Study ${skill}`, time: "9:00 AM", done: checked, tag: "Learning" },
                    { text: "Build portfolio page", time: "1:00 PM", done: false, tag: "Project" },
                    { text: "Write weekly reflection", time: "6:00 PM", done: false, tag: "Review" },
                  ].map((t, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                      t.done
                        ? "border-emerald-200/60 dark:border-emerald-500/15 bg-emerald-50/60 dark:bg-emerald-500/5"
                        : "border-slate-100 dark:border-white/[0.05] bg-white/60 dark:bg-white/[0.02]"
                    }`}>
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${t.done ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600"}`}>
                        {t.done && <svg viewBox="0 0 10 10" className="w-2.5 h-2.5"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" /></svg>}
                      </div>
                      <span className={`text-[11px] font-semibold flex-1 truncate ${t.done ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>{t.text}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{t.tag}</span>
                        <span className="text-[8px] text-slate-400">{t.time}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ROADMAP */}
              {tab === "roadmap" && (
                <motion.div key="roadmap" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{skill} Path</span>
                      <span className="text-[10px] font-black text-blue-500">{roadmapPct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" animate={{ width: `${roadmapPct}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {(activePresetData.milestones || []).slice(0, 3).map((m, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                          i === 0 ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/20"
                          : i === 1 ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}>{i === 0 ? "✓" : i + 1}</div>
                        <span className={`text-[11px] font-medium ${i === 0 ? "text-slate-400 line-through" : i === 1 ? "text-slate-700 dark:text-slate-200 font-semibold" : "text-slate-400 dark:text-slate-500"}`}>{m}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* REPORTS */}
              {tab === "reports" && (
                <motion.div key="reports" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Weekly Study Hours</span>
                    <span className="text-[11px] font-black text-emerald-500">+12.5h</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-20">
                    {[35, 55, 40, 75, 60, 88, 50].map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          className="w-full rounded-t-lg bg-gradient-to-t from-blue-500/80 to-indigo-400/60"
                          initial={{ height: 0 }}
                          animate={{ height: `${v}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] font-medium text-slate-400 dark:text-slate-600">
                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <span key={d}>{d}</span>)}
                  </div>
                </motion.div>
              )}

              {/* PORTFOLIO */}
              {tab === "portfolio" && (
                <motion.div key="portfolio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">
                  <div className="flex items-center gap-4">
                    <svg viewBox="0 0 48 48" className="w-14 h-14 shrink-0 -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4" className="stroke-slate-100 dark:stroke-slate-800" />
                      <motion.circle cx="24" cy="24" r="20" fill="none" strokeWidth="4" strokeLinecap="round" stroke="url(#rg)" strokeDasharray="125" animate={{ strokeDashoffset: 125 * (1 - readinessPct / 100) }} transition={{ duration: 1 }} />
                      <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#ef4444" /></linearGradient></defs>
                    </svg>
                    <div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">{readinessPct}%</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Career Readiness</div>
                    </div>
                  </div>
                  {(activePresetData.portfolioGoals || []).slice(0, 2).map((g, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.05] bg-white/50 dark:bg-white/[0.02]">
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{g.title}</div>
                        <div className="text-[8px] text-slate-400 font-medium mt-0.5">{g.deadline}</div>
                      </div>
                      <div className="ml-3 shrink-0">
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div className={`h-full rounded-full ${g.completed ? "bg-emerald-500" : "bg-blue-500"}`} animate={{ width: `${g.progress}%` }} transition={{ duration: 0.8 }} />
                        </div>
                        <div className={`text-[8px] font-bold mt-0.5 text-right ${g.completed ? "text-emerald-500" : "text-blue-500"}`}>{g.completed ? "Done" : `${g.progress}%`}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status bar */}
          <div className="h-8 border-t border-slate-100 dark:border-white/[0.05] flex items-center px-4 justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/30">
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 dark:text-slate-600">
              <Activity className="w-3 h-3 text-blue-400" />
              {step === 0 ? "Waiting for input…" : step === 1 ? "Task completed ✓" : step === 2 ? "Roadmap +8% progress" : step === 3 ? "Report compiled" : "Readiness score updated"}
            </span>
            <span className="flex items-center gap-1 text-[8px] font-bold text-blue-500 dark:text-blue-400">
              <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />SYNC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
