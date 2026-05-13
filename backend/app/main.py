import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.gemma_client import GemmaClient, GemmaProviderError, get_runtime_config
from app.schemas import AnalysisRequest, AnalysisResponse, Insight

load_dotenv()
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper())
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Gemma Functional Analyst Copilot",
    description="Turns messy requirements into user stories, acceptance criteria, test cases, summaries, and risk checklists with Gemma.",
    version="1.0.0",
)

origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.get("/diagnostics/gemma-models")
def gemma_model_diagnostics() -> dict[str, object]:
    try:
        config = get_runtime_config()
        client = GemmaClient()
        models = client.list_gemma_models()
        return {
            "provider": config.provider,
            "configured_model": config.model,
            "gemma_models": models,
        }
    except GemmaProviderError as exc:
        logger.warning("Gemma model diagnostics failed: %s", exc.detail)
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc

@app.on_event("startup")
def log_startup_config() -> None:
    config = get_runtime_config()
    if config.demo_mode:
        logger.info("Starting backend in demo mode. No Google GenAI calls will be made.")
    else:
        logger.info(
            "Starting backend in google mode with provider=%s model=%s google_api_key_configured=%s",
            config.provider,
            config.model,
            config.has_google_api_key,
        )

@app.post("/analyze", response_model=AnalysisResponse)
def analyze(payload: AnalysisRequest) -> AnalysisResponse:
    try:
        client = GemmaClient()
        result = client.analyze(
            raw_text=payload.raw_text,
            output_type=payload.output_type,
            project_context=payload.project_context or "",
            language=payload.language,
        )
        metadata = build_metadata(payload.raw_text, result, payload.output_type)
        return AnalysisResponse(
            output_type=payload.output_type,
            model=client.model,
            result_markdown=result,
            confidence_score=metadata["confidence_score"],
            tokens_estimated=metadata["tokens_estimated"],
            hours_saved_estimated=metadata["hours_saved_estimated"],
            insights=metadata["insights"],
            warnings=metadata["warnings"],
        )
    except GemmaProviderError as exc:
        logger.warning("Gemma provider request failed: %s", exc.detail)
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    except Exception as exc:
        logger.exception("Unexpected analysis failure")
        raise HTTPException(status_code=500, detail="Unexpected backend error while generating analysis.") from exc


def build_metadata(raw_text: str, result: str, output_type: str) -> dict:
    ambiguity_markers = ["maybe", "later", "pending", "not sure", "tbd", "unclear", "if", "should"]
    lower_text = raw_text.lower()
    ambiguity_count = sum(lower_text.count(marker) for marker in ambiguity_markers)
    source_words = len(raw_text.split())
    output_words = len(result.split())
    complexity_bonus = 8 if output_type in {"risk_matrix", "jira_ticket", "qa_test_cases"} else 4
    confidence_score = max(68, min(96, 88 + complexity_bonus - ambiguity_count * 3 + min(source_words // 120, 4)))
    tokens_estimated = max(600, int((source_words + output_words) * 1.35))
    hours_saved_estimated = round(max(0.8, output_words / 450), 1)

    warnings = []
    if ambiguity_count:
        warnings.append("Requirement contains ambiguity markers that should be validated with stakeholders.")
    if "integration" in lower_text or "api" in lower_text or "backend" in lower_text:
        warnings.append("Integration ownership and source-of-truth contracts should be confirmed.")
    if "admin" in lower_text and "not part" in lower_text:
        warnings.append("Admin scope appears explicitly deferred; keep it out of MVP acceptance criteria.")
    if not warnings:
        warnings.append("No major ambiguity detected, but final scope should still be reviewed before sprint commitment.")

    insights = [
        Insight(label="Source maturity", value="Draft requirement" if ambiguity_count else "Well-formed brief", tone="warning" if ambiguity_count else "success"),
        Insight(label="Recommended review", value="PO + QA triage", tone="neutral"),
        Insight(label="Estimated output tokens", value=f"{tokens_estimated:,}", tone="neutral"),
        Insight(label="Analyst time saved", value=f"{hours_saved_estimated} hours", tone="success"),
    ]

    return {
        "confidence_score": confidence_score,
        "tokens_estimated": tokens_estimated,
        "hours_saved_estimated": hours_saved_estimated,
        "insights": insights,
        "warnings": warnings[:3],
    }
