import {
  BookOpen,
  ChartColumnBig,
  Compass,
  FolderKanban,
  Home,
  NotebookPen,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../utils/helpers";

const items = [
  { to: "/app/dashboard", label: "Home", icon: Home },
  { to: "/app/planner", label: "Plan", icon: NotebookPen },
  { to: "/app/roadmap", label: "Roadmap", icon: Compass },
  { to: "/app/skills", label: "Skills", icon: ChartColumnBig },
  { to: "/app/learning", label: "Learn", icon: BookOpen },
  { to: "/app/projects", label: "Projects", icon: FolderKanban },
];

export default function MobileNav() {
  return (
    <div className="glass-panel fixed inset-x-3 bottom-3 z-40 grid grid-cols-6 gap-1 rounded-[28px] p-2 lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.to} to={item.to}>
            {({ isActive }) => (
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium transition",
                  isActive
                    ? "bg-accent text-white"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                <Icon className="mb-1 h-4 w-4" />
                {item.label}
              </div>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}
