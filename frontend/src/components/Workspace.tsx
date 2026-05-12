import type { Language, TemplateId } from "../types";
import { templates } from "../data/templates";
import { Icon } from "./Icon";

interface WorkspaceProps {
  rawText: string;
  context: string;
  template: TemplateId;
  language: Language;
  loading: boolean;
  error: string;
  onRawTextChange: (value: string) => void;
  onContextChange: (value: string) => void;
  onTemplateChange: (value: TemplateId) => void;
  onLanguageChange: (value: Language) => void;
  onGenerate: () => void;
  onFileUpload: (file: File) => void;
}

export function Workspace(props: WorkspaceProps) {
  return (
    <section id="workspace" className="section">
      <div className="section-heading">
        <p>Prompt Workspace</p>
        <h2>Turn raw requirements into delivery artifacts</h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="panel">
          <label className="field-label" htmlFor="context">Project context</label>
          <textarea
            id="context"
            className="input min-h-24"
            value={props.context}
            onChange={(event) => props.onContextChange(event.target.value)}
          />
          <div className="mt-5 flex items-center justify-between gap-3">
            <label className="field-label" htmlFor="requirements">Requirements source</label>
            <label className="icon-button cursor-pointer" title="Upload .txt or .md file">
              <Icon name="Upload" />
              <input
                className="sr-only"
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) props.onFileUpload(file);
                }}
              />
            </label>
          </div>
          <textarea
            id="requirements"
            className="input min-h-[340px] font-mono text-sm"
            value={props.rawText}
            onChange={(event) => props.onRawTextChange(event.target.value)}
          />
          {props.error && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200">{props.error}</p>}
        </div>
        <aside className="panel">
          <label className="field-label" htmlFor="template">Generation template</label>
          <div className="grid gap-2">
            {templates.map((item) => (
              <button
                key={item.id}
                className={`template-button ${props.template === item.id ? "template-button-active" : ""}`}
                onClick={() => props.onTemplateChange(item.id)}
              >
                <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
            ))}
          </div>
          <label className="field-label mt-5" htmlFor="language">Language</label>
          <select
            id="language"
            className="input"
            value={props.language}
            onChange={(event) => props.onLanguageChange(event.target.value as Language)}
          >
            <option>English</option>
            <option>Spanish</option>
          </select>
          <button className="primary-button mt-5 w-full justify-center" disabled={props.loading || props.rawText.trim().length < 20} onClick={props.onGenerate}>
            <Icon name="WandSparkles" />
            {props.loading ? "Generating..." : "Generate deliverable"}
          </button>
        </aside>
      </div>
    </section>
  );
}
