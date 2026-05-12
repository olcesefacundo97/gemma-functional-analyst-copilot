import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface ShellProps {
  children: ReactNode;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Shell({ children, darkMode, onToggleDarkMode }: ShellProps) {
  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-paper text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <a href="#dashboard" className="flex items-center gap-3 font-semibold">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white shadow-glow dark:bg-white dark:text-slate-950">
                <Icon name="Sparkles" className="h-5 w-5" />
              </span>
              <span>Gemma Analyst Copilot</span>
            </a>
            <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
              <a href="#workspace">Workspace</a>
              <a href="#deliverables">Deliverables</a>
              <a href="#insights">Insights</a>
              <a href="#export">Export</a>
            </div>
            <button className="icon-button" onClick={onToggleDarkMode} aria-label="Toggle dark mode">
              <Icon name={darkMode ? "Sun" : "Moon"} />
            </button>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
