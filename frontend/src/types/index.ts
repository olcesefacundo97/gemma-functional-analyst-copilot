export type TemplateId =
  | "agile_user_story"
  | "acceptance_criteria"
  | "qa_test_cases"
  | "technical_summary"
  | "stakeholder_summary"
  | "risk_matrix"
  | "jira_ticket";

export type Language = "English" | "Spanish";

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  icon: string;
}

export interface AnalysisRequest {
  raw_text: string;
  project_context: string;
  output_type: TemplateId;
  language: Language;
}

export interface Insight {
  label: string;
  value: string;
  tone: "success" | "warning" | "danger" | "neutral";
}

export interface AnalysisResponse {
  output_type: TemplateId;
  model: string;
  result_markdown: string;
  confidence_score: number;
  tokens_estimated: number;
  hours_saved_estimated: number;
  insights: Insight[];
  warnings: string[];
}

export interface HistoryItem extends AnalysisResponse {
  id: string;
  title: string;
  createdAt: string;
  sourcePreview: string;
}
