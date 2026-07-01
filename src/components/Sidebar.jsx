import { motion } from "framer-motion";
import {
  BookOpen,
  BriefcaseBusiness,
  Calendar,
  ChartColumnBig,
  Compass,
  FileText,
  FileBarChart,
  FolderKanban,
  Goal,
  Home,
  LayoutPanelLeft,
  NotebookPen,
  Settings,
  UserCircle2,
  HelpCircle,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../utils/helpers";

const items = [
  { to: "/app/dashboard", label: "Dashboard", icon: Home },
  { to: "/app/planner", label: "Daily Planner", icon: LayoutPanelLeft },
  { to: "/app/calendar", label: "Calendar", icon: Calendar },
  { to: "/app/roadmap", label: "Roadmap", icon: Compass },
  { to: "/app/skills", label: "Skills", icon: ChartColumnBig },
  { to: "/app/learning", label: "Learning Hub", icon: BookOpen },
  { to: "/app/projects", label: "Projects", icon: FolderKanban },
  { to: "/app/weekly-review", label: "Weekly Review", icon: NotebookPen },
  { to: "/app/reports", label: "Reports", icon: FileBarChart },
  { to: "/app/notes", label: "Notes", icon: FileText },
  { to: "/app/resources", label: "Resources", icon: BriefcaseBusiness },
  { to: "/app/portfolio-goals", label: "Portfolio Goals", icon: Goal },
  { to: "/app/profile", label: "Profile", icon: UserCircle2 },
  { to: "/app/settings", label: "Settings", icon: Settings },
  { to: "/app/support", label: "Help & Support", icon: HelpCircle },
];

export default function Sidebar({ collapsed, mobile, onClose }) {
  return (
    <aside
      className={cn(
        "glass-panel flex h-full flex-col rounded-[32px] px-3 py-4",
        collapsed ? "w-[94px]" : "w-full lg:w-[280px]",
        mobile ? "rounded-none border-none" : "",
      )}
    >
      <div className={cn("mb-6 flex items-center gap-3 px-3", collapsed && !mobile ? "justify-center" : "")}>
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-sky-400 text-lg font-bold text-white shadow-soft">
          PM
        </div>
        {!collapsed || mobile ? (
          <div>
            <p className="font-display text-base font-semibold text-ink dark:text-white">PM Career OS</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Premium personal dashboard</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 scrollbar-thin">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} onClick={onClose}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-accent text-white shadow-soft"
                      : "text-slate-500 hover:bg-white hover:text-ink dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white",
                    collapsed && !mobile ? "justify-center px-0" : "",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed || mobile ? <span>{item.label}</span> : null}
                  {isActive ? <span className="absolute inset-y-2 left-1 w-1 rounded-full bg-white/80" /> : null}
                </motion.div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
