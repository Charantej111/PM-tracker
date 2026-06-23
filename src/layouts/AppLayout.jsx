import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import MobileNav from "../components/MobileNav";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen px-3 pb-24 pt-4 md:px-4 lg:px-5">
      <div className="mx-auto flex max-w-[1600px] gap-4">
        <div className="sticky top-4 hidden h-[calc(100vh-2rem)] flex-col lg:flex">
          <div className="mb-3 flex justify-end shrink-0">
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-400"
            >
              {collapsed ? "Expand" : "Collapse"}
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <Sidebar collapsed={collapsed} />
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ duration: 0.24 }}
                className="h-full w-[300px] p-4"
                onClick={(event) => event.stopPropagation()}
              >
                <Sidebar mobile onClose={() => setMobileOpen(false)} />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main className="min-w-0 flex-1">
          <Header onOpenSidebar={() => setMobileOpen(true)} />
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
