from app.schemas import OutputType

SYSTEM_INSTRUCTION = """
You are a senior Functional Analyst and QA-oriented product partner.
Your job is to transform messy requirements into precise, testable, stakeholder-ready deliverables.
Be practical, structured, and concise. Do not invent facts. When information is missing, explicitly mark assumptions and open questions.
""".strip()

OUTPUT_GUIDES: dict[OutputType, str] = {
    "agile_user_story": """
Create user stories in this format:
- Epic / Capability
- User Story: As a [role], I want [goal], so that [benefit]
- Business value
- Functional notes
- Dependencies
- Jira labels
- Open questions
""",
    "acceptance_criteria": """
Create acceptance criteria using Given/When/Then.
Group criteria by feature or workflow.
Include negative scenarios, permissions, loading states, and error handling when relevant.
""",
    "qa_test_cases": """
Create a QA test matrix with columns:
ID | Scenario | Preconditions | Steps | Expected Result | Priority | Type
Include positive, negative, boundary, permission, and regression cases.
""",
    "technical_summary": """
Create a developer-ready technical summary:
- Functional scope
- Key workflows
- Data entities and fields implied by the requirement
- API / integration assumptions
- Non-functional considerations
- Dependencies
- Open technical questions
""",
    "stakeholder_summary": """
Create an executive stakeholder summary:
- Objective
- Scope included
- Scope not included
- Expected behavior
- Dependencies / pending definitions
- Suggested next decision
Keep it clear for non-technical stakeholders.
""",
    "risk_matrix": """
Create a risk matrix:
ID | Risk | Severity | Probability | Impact | Early Signal | Mitigation | Owner suggestion
Use severity labels: Critical, High, Medium, Low.
Focus on ambiguity, integrations, data quality, permissions, performance, adoption, compliance, and testing.
""",
    "jira_ticket": """
Create a Jira-ready ticket:
- Issue title
- Issue type recommendation
- Priority recommendation
- Description
- Business value
- User story
- Acceptance criteria
- QA notes
- Subtasks
- Labels
- Dependencies
- Open questions
""",
}

def build_prompt(raw_text: str, output_type: OutputType, project_context: str, language: str) -> str:
    return f"""
Language for the final answer: {language}

Project context:
{project_context or "No additional context provided."}

Requested deliverable:
{OUTPUT_GUIDES[output_type]}

Source material:
---
{raw_text}
---

Important rules:
- Use Markdown.
- Preserve traceability to the source material.
- Mark assumptions clearly.
- Mark missing information as open questions.
- Make the output useful for a real delivery team.
- Prefer crisp tables where they improve readability.
- Avoid vague filler. Every bullet should help a Product Owner, Functional Analyst, QA Analyst, or developer.
""".strip()
