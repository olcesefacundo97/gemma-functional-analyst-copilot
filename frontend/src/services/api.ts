import type { AnalysisRequest, AnalysisResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function generateDeliverable(payload: AnalysisRequest): Promise<AnalysisResponse> {
  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || "The AI generation request failed.");
  }

  return data as AnalysisResponse;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
