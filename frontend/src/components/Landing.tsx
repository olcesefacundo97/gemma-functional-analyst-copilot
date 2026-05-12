import { Icon } from "./Icon";

export function Landing({ onStart }: { onStart: () => void }) {
  const heroFeatures = [
    ["Analyst-ready outputs", "Stories, criteria, tests, risks, and tickets"],
    ["Enterprise prompts", "Assumptions, traceability, and open questions"],
    ["Delivery exports", "Markdown, TXT, JSON, and clipboard workflows"],
  ];

  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.12),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(8,145,178,0.14),transparent_26%)]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
              <Icon name="WandSparkles" className="h-4 w-4" /> Built for the Gemma 4 Challenge
            </div>
            <h1 className="max-w-4xl text-5xl font-black tracking-normal text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
              Gemma Functional Analyst Copilot
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Convert messy notes, Jira fragments, stakeholder requests, and QA context into enterprise-grade user stories,
              acceptance criteria, test cases, summaries, risk matrices, and tickets.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="primary-button" onClick={onStart}>
                <Icon name="Send" className="h-5 w-5" /> Launch workspace
              </button>
              <a className="secondary-button" href="#features">
                View features
              </a>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 shadow-glow dark:border-white/10">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm font-semibold text-white">Generated Analysis Pack</span>
              <span className="rounded-md bg-emerald-400/15 px-2 py-1 text-xs font-bold text-emerald-200">92% confidence</span>
            </div>
            <div className="space-y-4 font-mono text-sm leading-6 text-slate-200">
              <p className="text-emerald-200"># Executive Summary</p>
              <p>The MVP enables city operations teams to monitor traffic events through a map-first incident dashboard.</p>
              <p className="text-cyan-200">## Acceptance Criteria</p>
              <p>Given an operator opens the dashboard, when live events are available, then incidents are grouped by type and severity.</p>
              <p className="text-amber-200">## Risk Matrix</p>
              <p>High: unclear weather data source. Mitigation: define integration owner before sprint planning.</p>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {heroFeatures.map(([title, body]) => (
            <article className="rounded-lg border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5" key={title}>
              <p className="text-sm font-bold text-slate-950 dark:text-white">{title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
