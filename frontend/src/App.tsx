import { useMemo, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Deliverables } from "./components/Deliverables";
import { ExportPanel } from "./components/ExportPanel";
import { Insights } from "./components/Insights";
import { Landing } from "./components/Landing";
import { MarketingSections } from "./components/MarketingSections";
import { Shell } from "./components/Shell";
import { Toast } from "./components/Toast";
import { Workspace } from "./components/Workspace";
import { sampleContext, sampleRequirement, templates } from "./data/templates";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { generateDeliverable } from "./services/api";
import type { AnalysisResponse, HistoryItem, Language, TemplateId } from "./types";

export function App() {
  const [darkMode, setDarkMode] = useLocalStorage("gfac.darkMode", true);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>("gfac.history", []);
  const [rawText, setRawText] = useLocalStorage("gfac.rawText", sampleRequirement);
  const [context, setContext] = useLocalStorage("gfac.context", sampleContext);
  const [template, setTemplate] = useLocalStorage<TemplateId>("gfac.template", "jira_ticket");
  const [language, setLanguage] = useLocalStorage<Language>("gfac.language", "English");
  const [result, setResult] = useState<AnalysisResponse | undefined>(history[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const analytics = useMemo(() => {
    const documentsProcessed = Math.max(history.length, 12);
    const tokensGenerated = history.reduce((total, item) => total + item.tokens_estimated, 18750);
    const hoursSaved = history.reduce((total, item) => total + item.hours_saved_estimated, 18.5);
    const productivityGain = Math.min(78, 42 + history.length * 3);
    return { documentsProcessed, tokensGenerated, hoursSaved, productivityGain };
  }, [history]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const response = await generateDeliverable({
        raw_text: rawText,
        project_context: context,
        output_type: template,
        language,
      });
      const item: HistoryItem = {
        ...response,
        id: crypto.randomUUID(),
        title: templates.find((candidate) => candidate.id === template)?.name || "Generated deliverable",
        createdAt: new Date().toISOString(),
        sourcePreview: rawText.slice(0, 150),
      };
      setResult(item);
      setHistory([item, ...history].slice(0, 8));
      showToast("Deliverable generated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while generating the deliverable.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file: File) {
    const text = await file.text();
    setRawText(text);
    showToast(`${file.name} imported into the workspace.`);
  }

  return (
    <Shell darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)}>
      <Landing onStart={() => document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" })} />
      <main>
        <Dashboard history={history} {...analytics} />
        <Workspace
          rawText={rawText}
          context={context}
          template={template}
          language={language}
          loading={loading}
          error={error}
          onRawTextChange={setRawText}
          onContextChange={setContext}
          onTemplateChange={setTemplate}
          onLanguageChange={setLanguage}
          onGenerate={handleGenerate}
          onFileUpload={handleFileUpload}
        />
        <Deliverables
          result={result}
          loading={loading}
          onEdit={(markdown) => setResult(result ? { ...result, result_markdown: markdown } : undefined)}
        />
        <Insights result={result} />
        <ExportPanel result={result} onToast={showToast} />
        <MarketingSections />
      </main>
      <Toast message={toast} />
    </Shell>
  );
}
