import { Icon } from "./Icon";

export function MarketingSections() {
  const features = [
    ["Structured analysis", "From ambiguous notes to consistent analyst deliverables."],
    ["QA-ready outputs", "Acceptance criteria, test matrices, negative paths, and regression thinking."],
    ["Delivery workflow", "Export Markdown, TXT, JSON, or copy output directly into Jira and Confluence."],
  ];
  const faqs = [
    ["Does this replace analysts?", "No. It accelerates first drafts so analysts can focus on validation, stakeholder alignment, and delivery quality."],
    ["Can it run without an API key?", "Yes. The backend supports a demo provider for local portfolio review and a Google AI Studio provider for real Gemma 4 generation."],
    ["Is the output editable?", "Yes. Generated Markdown can be revised in the app before export."],
  ];

  return (
    <>
      <section id="features" className="section">
        <div className="section-heading">
          <p>Features</p>
          <h2>Built like a practical AI SaaS MVP</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map(([title, body]) => (
            <article className="panel" key={title}>
              <Icon name="Sparkles" className="mb-4 h-6 w-6 text-emerald-500" />
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 text-slate-600 dark:text-slate-300">{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="rounded-lg bg-slate-950 p-8 text-white shadow-glow md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-300">Ready for the demo</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">Generate a complete analysis pack in one workflow.</h2>
            </div>
            <a className="primary-button bg-white text-slate-950 hover:bg-slate-100" href="#workspace">Open workspace</a>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <p>FAQ</p>
          <h2>Product notes for judges and recruiters</h2>
        </div>
        <div className="grid gap-3">
          {faqs.map(([question, answer]) => (
            <details className="panel" key={question}>
              <summary className="cursor-pointer font-bold">{question}</summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <footer className="border-t border-slate-200 px-4 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        Built with React, Vite, TypeScript, TailwindCSS, FastAPI, Pydantic, and Google Gemma 4.
      </footer>
    </>
  );
}
