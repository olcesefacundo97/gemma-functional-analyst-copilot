from typing import Literal, Optional
from pydantic import BaseModel, Field

OutputType = Literal[
    "agile_user_story",
    "acceptance_criteria",
    "qa_test_cases",
    "technical_summary",
    "stakeholder_summary",
    "risk_matrix",
    "jira_ticket",
]

class AnalysisRequest(BaseModel):
    raw_text: str = Field(..., min_length=20, description="Messy notes, ticket text, requirement, meeting notes, or technical documentation.")
    output_type: OutputType
    project_context: Optional[str] = Field(default="", description="Optional business/project context.")
    language: Literal["English", "Spanish"] = "English"

class Insight(BaseModel):
    label: str
    value: str
    tone: Literal["success", "warning", "danger", "neutral"] = "neutral"

class AnalysisResponse(BaseModel):
    output_type: OutputType
    model: str
    result_markdown: str
    confidence_score: int = Field(ge=0, le=100)
    tokens_estimated: int
    hours_saved_estimated: float
    insights: list[Insight]
    warnings: list[str]
