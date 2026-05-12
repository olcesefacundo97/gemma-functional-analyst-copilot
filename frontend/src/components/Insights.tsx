import type { AnalysisResponse } from "../types";

const toneClasses = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-200 dark:border-emerald-400/30",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-400/30",
  danger: "bg-red-50 text-red-700 border-red-200 dark:bg-red-400/10 dark:text-red-200 dark:border-red-400/30",
  neutral: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-slate-200 dark:border-white/10",
};

export function Insights({ result }: { result?: AnalysisResponse }) {
  return (
    <section id="insights" className="section">
      <div className="section-heading">
        <p>AI Insights</p>
        <h2>Confidence, risks, and quality signals</h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="panel">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Confidence score</p>
          <div className="mt-4 text-5xl font-black tracking-normal">{result ? `${result.confidence_score}%` : "--"}</div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${result?.confidence_score || 0}%` }} />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Score is estimated from source length, ambiguity markers, and output type complexity.</p>
        </div>
        <div className="panel">
          {result ? (
            <div className="grid gap-3 md:grid-cols-2">
              {result.insights.map((insight) => (
                <div className={`rounded-lg border p-4 ${toneClasses[insight.tone]}`} key={insight.label}>
                  <p className="text-sm font-semibold opacity-80">{insight.label}</p>
                  <strong className="mt-1 block text-xl tracking-normal">{insight.value}</strong>
                </div>
              ))}
              {result.warnings.map((warning) => (
                <div className={toneClasses.warning + " rounded-lg border p-4"} key={warning}>
                  <p className="text-sm font-semibold">Open question</p>
                  <strong className="mt-1 block text-base">{warning}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Insights appear after generation</h3>
              <p>Gemma output metadata will surface confidence, ambiguity, tokens, and estimated analyst time saved.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
