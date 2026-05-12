import type { AnalysisResponse } from "../types";

export function Deliverables({
  result,
  loading,
  onEdit,
}: {
  result?: AnalysisResponse;
  loading: boolean;
  onEdit: (markdown: string) => void;
}) {
  return (
    <section id="deliverables" className="section">
      <div className="section-heading">
        <p>Generated Deliverables</p>
        <h2>Editable Markdown output</h2>
      </div>
      <div className="panel">
        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-7 w-1/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-48 w-full" />
          </div>
        ) : result ? (
          <textarea
            className="input min-h-[560px] font-mono text-sm leading-6"
            value={result.result_markdown}
            onChange={(event) => onEdit(event.target.value)}
            aria-label="Editable generated deliverable"
          />
        ) : (
          <div className="empty-state">
            <h3>No deliverable generated yet</h3>
            <p>Choose a template, add context, and run Gemma 4 to create a structured first draft.</p>
          </div>
        )}
      </div>
    </section>
  );
}
