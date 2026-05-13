---
title: I Built a Functional Analyst Copilot with Gemma
published: false
description: A practical AI SaaS MVP that turns messy requirements into user stories, acceptance criteria, QA test cases, risks, summaries, and Jira-ready tickets with Gemma.
tags: google-gemma, gemma, ai, fastapi
---

## The problem

Most software teams do not start with perfect requirements.

They start with meeting notes, partial Jira tickets, Slack threads, client comments, technical caveats, and "we will define this later" assumptions. Before engineers and QA can work confidently, someone has to turn that mess into clear delivery artifacts.

That person is often a Functional Analyst, Business Analyst, QA Analyst, or Product Owner.

So I built **Gemma Functional Analyst Copilot**, an AI-powered workspace that uses Gemma to transform rough requirements into professional functional-analysis deliverables.

## Why analysts waste time

Analysts do not waste time because they lack skill. They lose hours because the raw material is scattered and ambiguous.

A single feature can require:

- user stories,
- acceptance criteria,
- QA test cases,
- executive summaries,
- risk analysis,
- technical notes,
- Jira-ready tickets,
- open questions for stakeholders.

Those outputs are repetitive, but they still require judgment. The first draft is the bottleneck. My goal was to make that first draft dramatically faster while keeping the analyst in control.

## What the app does

The app lets users paste requirements or upload text/Markdown files, add project context, choose a generation template, and generate:

- Agile user stories,
- acceptance criteria,
- QA test cases,
- technical summaries,
- stakeholder summaries,
- risk matrices,
- Jira-ready tickets.

The output is editable, exportable, and designed to look like something a real delivery team could paste into Jira, Confluence, or a project document.

## Why Gemma

Gemma is central to the product because the task is not just summarization. The model needs to reason over vague input, detect missing information, structure outputs consistently, and adapt the deliverable to different audiences.

For this MVP, Gemma is used to:

- convert ambiguity into assumptions and open questions,
- generate testable acceptance criteria,
- create realistic QA coverage,
- identify product and delivery risks,
- produce enterprise-grade Markdown,
- support multilingual output.

The default hosted model is configured as `models/gemma-4-26b-a4b-it`, the hosted Gemma 4 model resource ID confirmed by the Google AI Studio API model listing. The backend abstraction can also run in demo mode for local portfolio reviews or public demos where no API key is configured.

## Architecture

```text
React + Vite + TypeScript + TailwindCSS
        |
        | POST /analyze
        v
FastAPI + Pydantic
        |
        | Google AI Studio API
        v
Gemma via Gemini API or demo provider
```

The frontend is built as a polished SaaS-style workspace with a landing page, dashboard, prompt workspace, deliverables panel, AI insights, exports, and history.

The backend handles validation, prompt construction, Gemma calls, and response metadata such as confidence score, estimated tokens, hours saved, warnings, and insight chips.

## Screenshots

![Landing page hero with CTA and feature cards](../screenshots/01-landing-page.png)
![Agile user story generation workspace and output](../screenshots/02-user-story-generation.png)
![Risk matrix generation with AI insights](../screenshots/03-risk-matrix-generation.png)
![QA test cases generation workflow](../screenshots/04-qa-test-cases-generation.png)

## Demo explanation

The demo uses a public-sector traffic operations scenario:

> The city operations team needs a map-first dashboard to monitor traffic incidents, road closures, and weather impact.

From that source material, the app can generate a Jira-ready story with acceptance criteria, QA notes, subtasks, labels, dependencies, and open questions. It can also generate a risk matrix with severity labels and mitigation owners.

That makes the project feel less like a chatbot and more like a daily workflow tool for analysts.

## Prompting strategy

The backend uses a stable system instruction that frames the model as a senior Functional Analyst and QA-oriented product partner.

Each generation template adds a specific structure. For example, QA test cases request a matrix with scenario, preconditions, steps, expected result, priority, and type. Risk output requires severity labels and mitigation ownership.

The prompt also tells the model to preserve traceability, avoid inventing facts, and mark assumptions clearly.

## Technical challenges

The first challenge was designing a UX that felt useful instead of decorative. Analysts need density, clear controls, and outputs they can move into real tools.

The second challenge was keeping the backend flexible. I wanted the app to support Google AI Studio for real Gemma calls, but also run in demo mode without an API key so recruiters and judges can still try the workflow locally.

## Production configuration

The backend uses a provider abstraction controlled by environment variables:

```text
AI_PROVIDER=google
GOOGLE_API_KEY=<set in Render or local .env only>
GEMMA_MODEL=models/gemma-4-26b-a4b-it
```

API keys are generated in [Google AI Studio](https://aistudio.google.com/) and should never be committed. Production uses `AI_PROVIDER=google` with `GEMMA_MODEL=models/gemma-4-26b-a4b-it` for real Gemma 4 inference. For a static public demo or local review mode, set `AI_PROVIDER=demo`. The public deployment may run in either mode depending on the configured Render environment.

To verify real Gemma generation after deployment:

```bash
curl -X POST "https://gemma-functional-analyst-copilot.onrender.com/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "raw_text": "The city operations team needs a map-first dashboard to monitor active traffic incidents, road closures, and weather impact. Operators need filters by incident type and a details panel for selected events.",
    "output_type": "qa_test_cases",
    "project_context": "Public sector traffic operations MVP",
    "language": "English"
  }'
```

The response should include `"model":"models/gemma-4-26b-a4b-it"` and a generated deliverable that is not one of the static demo templates. Google AI Studio free tier quota, rate limits, invalid keys, unavailable models, and timeouts are handled as clean API errors by the FastAPI backend.

The third challenge was making generated text feel actionable. The app adds confidence, warnings, insights, editable output, history, and exports so generation is only one step in a broader delivery process.

## Future improvements

Next I would add:

- PDF and DOCX ingestion,
- Jira API export,
- Confluence publishing,
- shared team workspaces,
- project-specific prompt libraries,
- local Gemma endpoint support,
- evaluation tests for generated artifact quality,
- reviewer comments and approval workflows.

## Conclusion

Gemma Functional Analyst Copilot is a practical example of how open AI models can be placed inside a specific professional workflow.

Instead of building a generic assistant, I built a tool for the messy middle of software delivery: the moment where unclear requirements need to become something developers, QA analysts, stakeholders, and product owners can actually use.

That is where Gemma shines in this project.

Repository:

```text
https://github.com/olcesefacundo97/gemma-functional-analyst-copilot
```

Frontend Demo:

```text
https://gemma-functional-analyst-copilot-cl.vercel.app
```

Backend API:

```text
https://gemma-functional-analyst-copilot.onrender.com
```
