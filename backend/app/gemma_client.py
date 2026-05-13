import os
import logging
from dataclasses import dataclass
from app.prompts import SYSTEM_INSTRUCTION, build_prompt
from app.schemas import OutputType

DEFAULT_GEMMA_MODEL = "gemma-4-26b-a4b-it"
logger = logging.getLogger(__name__)


class GemmaProviderError(Exception):
    def __init__(self, detail: str, status_code: int = 502) -> None:
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


@dataclass(frozen=True)
class GemmaRuntimeConfig:
    provider: str
    model: str
    demo_mode: bool
    has_google_api_key: bool


def get_runtime_config() -> GemmaRuntimeConfig:
    provider = os.getenv("AI_PROVIDER", "demo").strip().lower()
    api_key = os.getenv("GOOGLE_API_KEY")
    model = os.getenv("GEMMA_MODEL", DEFAULT_GEMMA_MODEL).strip() or DEFAULT_GEMMA_MODEL
    return GemmaRuntimeConfig(
        provider=provider,
        model=model,
        demo_mode=provider == "demo",
        has_google_api_key=bool(api_key),
    )


class GemmaClient:
    def __init__(self) -> None:
        config = get_runtime_config()
        self.provider = config.provider
        self.model = config.model
        self.demo_mode = config.demo_mode
        self.client = None

        if self.provider not in {"demo", "google"}:
            raise GemmaProviderError(
                "Unsupported AI_PROVIDER. Use 'demo' or 'google'.",
                status_code=503,
            )

        if self.demo_mode:
            logger.info("Gemma provider initialized in demo mode")
            return

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise GemmaProviderError(
                "Google provider is selected but GOOGLE_API_KEY is not configured.",
                status_code=503,
            )

        from google import genai
        from google.genai import types

        self.client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(timeout=60_000),
        )
        logger.info("Gemma provider initialized in google mode with model=%s", self.model)

    def list_gemma_models(self) -> list[dict[str, object]]:
        if self.demo_mode:
            raise GemmaProviderError(
                "Gemma model diagnostics require AI_PROVIDER=google.",
                status_code=503,
            )

        models = []
        for model in self.client.models.list(config={"page_size": 1000}):  # type: ignore[union-attr]
            name = getattr(model, "name", "") or ""
            display_name = getattr(model, "display_name", "") or ""
            description = getattr(model, "description", "") or ""
            search_text = " ".join([name, display_name, description]).lower()
            if "gemma" not in search_text:
                continue

            supported_actions = list(getattr(model, "supported_actions", []) or [])
            models.append(
                {
                    "name": name,
                    "display_name": display_name,
                    "version": getattr(model, "version", None),
                    "description": description,
                    "input_token_limit": getattr(model, "input_token_limit", None),
                    "output_token_limit": getattr(model, "output_token_limit", None),
                    "supported_actions": supported_actions,
                    "supports_generate_content": "generateContent" in supported_actions,
                }
            )
        return models

    def analyze(self, raw_text: str, output_type: OutputType, project_context: str, language: str) -> str:
        if self.demo_mode:
            return self._demo_response(raw_text, output_type, project_context, language)

        from google.genai import types
        from google.genai.errors import APIError
        import httpx
        import requests

        prompt = build_prompt(raw_text, output_type, project_context, language)
        logger.info("Generating analysis with provider=%s model=%s", self.provider, self.model)
        try:
            response = self.client.models.generate_content(  # type: ignore[union-attr]
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.25,
                ),
            )
            return response.text or "No output returned by the model."
        except APIError as exc:
            raise _map_google_api_error(exc) from exc
        except (TimeoutError, httpx.TimeoutException, requests.exceptions.Timeout) as exc:
            raise GemmaProviderError(
                "Google GenAI request timed out. Please retry in a moment.",
                status_code=504,
            ) from exc

    def _demo_response(self, raw_text: str, output_type: OutputType, project_context: str, language: str) -> str:
        source_theme = _first_sentence(raw_text)
        context_line = project_context or "No additional project context was supplied."
        if output_type == "risk_matrix":
            return f"""# Risk Matrix

## Source Trace
- Requirement theme: {source_theme}
- Context: {context_line}

| ID | Risk | Severity | Probability | Impact | Early Signal | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-01 | External data source is not confirmed | High | Medium | Map or status views may ship with stale data | Integration owner is not assigned by sprint planning | Define source-of-truth API and fallback mocked-data contract | Product Owner |
| R-02 | Admin alert management is mentioned but outside MVP | Medium | Medium | Stakeholders may expect admin workflows in the first release | Backlog items mix operator and admin personas | Mark admin capabilities as post-MVP and create separate epic | Functional Analyst |
| R-03 | Weather impact rules are ambiguous | High | Medium | QA cannot validate traffic-impact logic consistently | No threshold for "weather affects traffic" | Define rule table for weather condition, severity, and display behavior | Business Analyst |

## Open Questions
- Which external systems provide incident, closure, and weather data?
- What refresh interval is acceptable for operations users?
- Which roles can view restricted incident details?
"""

        if output_type == "qa_test_cases":
            return f"""# QA Test Cases

## Test Matrix
| ID | Scenario | Preconditions | Steps | Expected Result | Priority | Type |
| --- | --- | --- | --- | --- | --- | --- |
| QA-01 | Operator views active incidents | Mock incident data exists | Open dashboard | Map displays active incidents with type and status indicators | High | Functional |
| QA-02 | Filter by event type | Multiple event types exist | Select Road Closure filter | Only road closures remain visible and count updates | High | Functional |
| QA-03 | Empty state for no events | Dataset returns zero events | Open dashboard | Empty state explains no active events and keeps filters available | Medium | Edge |
| QA-04 | Weather source unavailable | Weather API fails | Select incident details | Incident details remain visible with a weather unavailable message | High | Resilience |
| QA-05 | Admin scope excluded | User expects alert management | Search for alert editor | App does not expose admin editing in MVP workflow | Medium | Scope |

## QA Notes
- Add regression coverage for map markers, filter state, and detail panel rendering.
- Validate copy with operations stakeholders before UAT.
"""

        if output_type == "acceptance_criteria":
            return f"""# Acceptance Criteria

## Incident Monitoring
- Given an operations user opens the dashboard, when active traffic events exist, then each event is visible on the map with type, status, and severity.
- Given the user filters by event type, when a filter is selected, then the map and event list update consistently.
- Given an event is selected, when details load successfully, then the user sees location, description, updated time, and operational status.

## Resilience
- Given the weather integration is unavailable, when the user opens event details, then the app shows a clear unavailable state without blocking incident monitoring.
- Given mocked data is enabled, when backend integration is not ready, then the MVP still demonstrates the target workflow with clearly labeled sample data.

## Open Questions
- What event statuses are valid for MVP?
- What weather conditions should change operational priority?
"""

        if output_type == "technical_summary":
            return f"""# Technical Summary

## Functional Scope
The MVP provides a map-first traffic operations dashboard for incident and road-closure visibility.

## Data Entities
| Entity | Key Fields |
| --- | --- |
| TrafficEvent | id, type, severity, status, location, description, updatedAt |
| WeatherSignal | condition, severity, source, observedAt |
| UserRole | operator, admin_future |

## Integration Assumptions
- Incident data can start as mocked JSON while API integration is pending.
- Weather data requires a clear provider, refresh interval, and failure state.
- Admin alert management should be separated into a future epic.

## Engineering Notes
- Keep mocked data behind an environment flag.
- Add contract tests once the backend provider is selected.
- Capture map state in QA scenarios for regression coverage.
"""

        if output_type == "stakeholder_summary":
            return f"""# Stakeholder Summary

## Objective
Enable city operations teams to monitor traffic incidents, road closures, and weather-related traffic impact from one dashboard.

## Included in MVP
- Map-first incident monitoring.
- Event type filtering.
- Event detail view.
- Mocked data fallback while backend integration is pending.

## Not Included
- Admin alert management.
- Final production integrations until source systems are confirmed.

## Next Decision
Confirm the incident data source, weather provider, refresh interval, and MVP event taxonomy before sprint commitment.
"""

        if output_type == "jira_ticket":
            return f"""# Jira-ready Ticket

## Title
Build map-first traffic incident monitoring dashboard

## Issue Type
Story

## Priority
High

## Description
As an operations user, I want to view current traffic incidents and road closures on a map so that I can monitor city mobility conditions and respond faster to disruptions.

## Business Value
Reduces manual coordination effort and gives operations stakeholders a shared view of live traffic events.

## Acceptance Criteria
- Given active events exist, when the dashboard loads, then incidents and road closures are visible on the map.
- Given the user filters by event type, when the filter is applied, then only matching events remain visible.
- Given the user selects an event, when details are available, then the app displays location, status, description, and last update.
- Given backend integration is pending, when demo mode is enabled, then mocked data supports the complete MVP workflow.

## QA Notes
- Test happy path, empty state, filter combinations, weather unavailable state, and mocked-data mode.

## Subtasks
- Create map dashboard layout.
- Add event filters and selected-event detail panel.
- Add mocked data service.
- Define weather impact display state.
- Add QA regression checklist.

## Labels
`traffic-ops`, `mvp`, `map-dashboard`, `functional-analysis`

## Open Questions
- Which system is the source of truth for incidents?
- What roles are allowed to access event details?
- What refresh interval should the dashboard use?
"""

        return f"""# Agile User Stories

## Epic: Traffic Operations Monitoring

### Story FA-01: View Active Traffic Events
As an operations user, I want to see incidents and road closures on a map so that I can understand current mobility disruptions quickly.

**Business Value:** Gives operators a shared operational picture and reduces manual status checking.

**Functional Notes**
- Events should include type, severity, location, status, and last updated timestamp.
- Mocked data is acceptable for the MVP while integrations are pending.

**Dependencies**
- Incident data source or mocked data contract.
- Map provider decision.

**Open Questions**
- Which event types are in scope for launch?
- What defines a high-severity traffic event?

### Story FA-02: Filter Events
As an operations user, I want to filter events by type so that I can focus on the disruptions relevant to my workflow.

**Business Value:** Improves response speed and reduces cognitive load during high-volume periods.
"""


def _first_sentence(value: str) -> str:
    cleaned = " ".join(value.strip().split())
    if not cleaned:
        return "No source text provided."
    return cleaned.split(".")[0][:180]


def _map_google_api_error(exc: Exception) -> GemmaProviderError:
    code = getattr(exc, "code", None)
    status = str(getattr(exc, "status", "") or "").upper()
    message = str(getattr(exc, "message", "") or "")
    logger.warning("Google GenAI API error: code=%s status=%s message=%s", code, status, message)

    if code in {401, 403} or status in {"UNAUTHENTICATED", "PERMISSION_DENIED"}:
        return GemmaProviderError(
            "Google GenAI authentication failed. Check GOOGLE_API_KEY in the backend environment.",
            status_code=502,
        )
    if code == 429 or status == "RESOURCE_EXHAUSTED":
        return GemmaProviderError(
            "Google GenAI quota or rate limit was reached. Please retry later or check the Google AI Studio quota.",
            status_code=429,
        )
    if code == 404 or status == "NOT_FOUND":
        return GemmaProviderError(
            "Configured Gemma model is unavailable. Check GEMMA_MODEL in the backend environment.",
            status_code=503,
        )
    if code in {408, 504} or status in {"DEADLINE_EXCEEDED", "TIMEOUT"}:
        return GemmaProviderError(
            "Google GenAI request timed out. Please retry in a moment.",
            status_code=504,
        )
    if code and code >= 500:
        return GemmaProviderError(
            "Google GenAI service is temporarily unavailable. Please retry later.",
            status_code=503,
        )
    return GemmaProviderError(
        "Google GenAI request failed. Check backend logs for provider details.",
        status_code=502,
    )
