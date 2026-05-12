import type { HistoryItem } from "../types";
import { Icon } from "./Icon";

interface DashboardProps {
  documentsProcessed: number;
  tokensGenerated: number;
  hoursSaved: number;
  productivityGain: number;
  history: HistoryItem[];
}

export function Dashboard({ documentsProcessed, tokensGenerated, hoursSaved, productivityGain, history }: DashboardProps) {
  const stats = [
    { label: "Documents processed", value: documentsProcessed.toString(), icon: "FileText" },
    { label: "Tokens generated", value: tokensGenerated.toLocaleString(), icon: "BarChart3" },
    { label: "Estimated hours saved", value: `${hoursSaved.toFixed(1)}h`, icon: "ClipboardCheck" },
    { label: "Productivity gain", value: `${productivityGain}%`, icon: "Sparkles" },
  ];

  return (
    <section id="dashboard" className="section">
      <div className="section-heading">
        <p>Dashboard</p>
        <h2>Operational snapshot</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <article className="metric-card" key={stat.label}>
            <div className="metric-icon">
              <Icon name={stat.icon} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <strong className="mt-2 block text-3xl tracking-normal">{stat.value}</strong>
          </article>
        ))}
      </div>
      <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2 font-semibold">
          <Icon name="History" /> Prompt history
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No generated deliverables yet. Your recent work will appear here automatically.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {history.slice(0, 3).map((item) => (
              <div className="rounded-lg border border-slate-200 p-4 text-sm dark:border-white/10">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap text-slate-500 dark:text-slate-400">{item.sourcePreview}</p>
                <p className="mt-3 text-xs font-semibold text-cyan-700 dark:text-cyan-200">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
