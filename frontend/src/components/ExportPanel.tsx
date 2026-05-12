import type { AnalysisResponse } from "../types";
import { downloadReport, slugify, toJson, toTxt } from "../utils/exporters";
import { Icon } from "./Icon";

export function ExportPanel({ result, onToast }: { result?: AnalysisResponse; onToast: (message: string) => void }) {
  const disabled = !result;
  const filename = result ? `gemma-${slugify(result.output_type)}-report` : "gemma-report";

  async function copyMarkdown() {
    if (!result) return;
    await navigator.clipboard.writeText(result.result_markdown);
    onToast("Markdown copied to clipboard.");
  }

  return (
    <section id="export" className="section">
      <div className="section-heading">
        <p>Export</p>
        <h2>Move from analysis to delivery</h2>
      </div>
      <div className="panel grid gap-3 md:grid-cols-4">
        <button className="export-button" disabled={disabled} onClick={copyMarkdown}>
          <Icon name="Copy" /> Copy
        </button>
        <button className="export-button" disabled={disabled} onClick={() => result && downloadReport(`${filename}.md`, result.result_markdown, "text/markdown")}>
          <Icon name="FileText" /> Markdown
        </button>
        <button className="export-button" disabled={disabled} onClick={() => result && downloadReport(`${filename}.txt`, toTxt(result), "text/plain")}>
          <Icon name="Download" /> TXT
        </button>
        <button className="export-button" disabled={disabled} onClick={() => result && downloadReport(`${filename}.json`, toJson(result), "application/json")}>
          <Icon name="FileJson" /> JSON
        </button>
      </div>
    </section>
  );
}
