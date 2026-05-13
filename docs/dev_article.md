---
title: I Built a Gemma 4 Copilot for the Most Underrated Bottleneck in Software Delivery
published: false
description: A production Gemma 4 challenge submission that turns rough requirements into user stories, QA test cases, risk matrices, and stakeholder-ready delivery docs.
tags: devchallenge, gemmachallenge, gemma, ai
---

Functional analysts live in the messy middle of software delivery.

Before engineers can estimate, before QA can test, and before stakeholders can approve scope, someone has to translate raw product ambiguity into something the team can actually use.

That work usually means writing:

- user stories
- acceptance criteria
- QA test cases
- risk matrices
- stakeholder summaries
- technical notes
- Jira-ready tickets

It is valuable work, but it is also repetitive, time-consuming, and easy to underestimate.

So for the [Build With Gemma 4 DEV Challenge](https://dev.to/challenges/google-gemma-2026-05-06), I built **Gemma Functional Analyst Copilot**: a production-deployed AI workspace that uses Gemma 4 to accelerate software delivery documentation.

- Repository: [github.com/olcesefacundo97/gemma-functional-analyst-copilot](https://github.com/olcesefacundo97/gemma-functional-analyst-copilot)
- Live frontend: [gemma-functional-analyst-copilot-cl.vercel.app](https://gemma-functional-analyst-copilot-cl.vercel.app)
- Live backend: [gemma-functional-analyst-copilot.onrender.com](https://gemma-functional-analyst-copilot.onrender.com)
- Production model: `models/gemma-4-26b-a4b-it`

## The Idea

Most teams do not start with clean requirements.

They start with meeting notes, partial tickets, stakeholder comments, support escalations, Slack threads, screenshots, and "we will define this later" assumptions.

A functional analyst then has to turn that into structured artifacts like:

- "As a user..." stories
- testable acceptance criteria
- QA scenarios
- product and delivery risks
- technical summaries
- stakeholder-friendly summaries

The goal of this project was not to build another generic chatbot. It was to put Gemma 4 inside a specific workflow that analysts, PMs, and QA engineers already recognize.

The app lets a user paste rough requirements, add project context, choose the type of deliverable, and generate an editable Markdown artifact that can be copied into Jira, Confluence, a test plan, or a stakeholder document.

## Why Gemma 4

The production backend is configured to use:

```text
models/gemma-4-26b-a4b-it
```

I chose this Gemma 4 model because the task is not just summarization.

Functional analysis requires the model to:

- reason over incomplete requirements
- identify assumptions and open questions
- structure output consistently
- adapt tone for technical and non-technical audiences
- generate QA scenarios that are specific enough to test
- avoid pretending that missing information is known

Gemma 4's MoE architecture is a good fit for this kind of structured reasoning workload: strong enough to produce useful delivery artifacts, but still practical to consume through hosted inference.

For this submission, I used hosted inference through the Google AI Studio API via the Google GenAI SDK. That made the project easier to deploy as a public demo while still using real Gemma 4 inference in production.

## What It Generates

The app currently supports several analyst-oriented output types:

- Agile user stories
- acceptance criteria
- QA test cases
- technical summaries
- stakeholder summaries
- risk matrices
- Jira-ready tickets

Each output type has a dedicated prompt structure. For example, QA test cases are generated as a test matrix with scenarios, preconditions, steps, expected results, priority, and test type. Risk matrices include severity, probability, business impact, early warning signals, mitigations, and likely owners.

The intent is practical: give the analyst a strong first draft, then keep the human in control.

## Architecture

The project is a small but real production stack:

```text
React + Vite + TypeScript frontend
        |
        | POST /analyze
        v
FastAPI backend
        |
        | Google GenAI SDK
        v
Google AI Studio hosted Gemma 4
```

### Frontend

The frontend is built with:

- React
- Vite
- TypeScript
- Tailwind CSS
- local storage for prompt history
- Markdown/TXT/JSON export helpers

It is deployed on Vercel:

```text
https://gemma-functional-analyst-copilot-cl.vercel.app
```

The UI is intentionally closer to a delivery workspace than a landing page. The main path is:

1. paste requirements
2. choose a deliverable
3. generate output
4. review insights and warnings
5. export or copy the result

### Backend

The backend is built with:

- FastAPI
- Pydantic schemas
- CORS configuration for the Vercel origin
- provider abstraction
- Google GenAI SDK integration
- demo provider fallback for local development

It is deployed on Render:

```text
https://gemma-functional-analyst-copilot.onrender.com
```

The backend uses environment variables to choose the provider and model:

```text
AI_PROVIDER=google
GOOGLE_API_KEY=<configured in Render>
GEMMA_MODEL=models/gemma-4-26b-a4b-it
```

The provider abstraction matters because it let me build and test the product UI before production inference was fully stable, while still making the production path use real Gemma 4.

## Screenshots

### Landing Page

![Landing page](https://raw.githubusercontent.com/olcesefacundo97/gemma-functional-analyst-copilot/main/screenshots/01-landing-page.png)

### User Story Generation

![User story generation](https://raw.githubusercontent.com/olcesefacundo97/gemma-functional-analyst-copilot/main/screenshots/02-user-story-generation.png)

### Risk Matrix Generation

![Risk matrix generation](https://raw.githubusercontent.com/olcesefacundo97/gemma-functional-analyst-copilot/main/screenshots/03-risk-matrix-generation.png)

### QA Test Case Generation

![QA test case generation](https://raw.githubusercontent.com/olcesefacundo97/gemma-functional-analyst-copilot/main/screenshots/04-qa-test-cases-generation.png)

## The Debugging Story

This was the most valuable part of the build.

The first version of the app worked in demo mode. That was useful for UI development, but it was not enough for the challenge. I wanted production to prove that the backend was calling Gemma 4 for real.

The journey looked like this:

### 1. Start With Demo Mode

The backend originally had a static demo provider so the frontend could be designed without depending on API keys, quotas, or provider availability.

That helped move quickly, but it also created a risk: a nice demo that did not actually validate Gemma 4 inference.

So I made production validation explicit. Successful responses needed to return the configured model and generate scenario-specific content that was clearly not the static demo template.

### 2. Hit Invalid Model IDs

The first Google provider attempts failed because I used short model names.

The important discovery was that the hosted API expected the full model resource ID:

```text
models/gemma-4-26b-a4b-it
```

Short names like this were not enough in this deployment path:

```text
gemma-4-26b-a4b-it
```

To make the backend more robust, I added model resolution logic that maps legacy or short Gemma IDs back to the correct production ID.

```python
DEFAULT_GEMMA_MODEL = "models/gemma-4-26b-a4b-it"

LEGACY_GEMMA_MODELS = {
    "gemma-3-27b-it",
    "models/gemma-3-27b-it",
    "gemma-4-26b-a4b-it",
}
```

### 3. Validate Accessible Models Dynamically

I also added a diagnostic path for listing Gemma models exposed to the configured Google API key.

That made it possible to confirm what the account could actually access instead of guessing from docs or model names.

The backend filters model listings for Gemma-related entries and checks whether each model supports `generateContent`.

That small diagnostic step saved a lot of time.

### 4. Fix Render Deployment Issues

The Render deploy had its own lesson.

At one point, the service startup was wrong because of a gunicorn command mismatch. The app is FastAPI, so the deployment needed a production command that actually launches the ASGI app correctly.

The final backend deploy uses the Render service configuration from the repository and starts the API with:

```text
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Once the startup command, environment variables, CORS, and model ID were aligned, the production backend began returning real Gemma 4 responses.

### 5. Prove Production Success

The final validation checked both direct backend calls and browser-based frontend flows.

A successful production response includes the real model:

```json
{
  "model": "models/gemma-4-26b-a4b-it"
}
```

The generated content also changed based on the input domain, including banking, healthcare, logistics, and public-sector scenarios.

That was the key signal: the app was no longer serving static demo output. It was using hosted Gemma 4 inference in the deployed product.

## Production Validation

I ran production validation against the public Vercel frontend and Render backend.

The final result was:

```text
READY WITH MINOR WARNINGS
```

What passed:

- backend health check
- CORS preflight from the Vercel origin
- frontend loading on Vercel
- browser console check
- frontend-to-backend generation
- real Gemma 4 model verification
- Markdown, TXT, and JSON export
- copy-to-clipboard flow
- responsive checks on desktop, tablet, and mobile
- public GitHub, frontend, backend, and screenshot URLs
- secret scan for obvious committed API keys

The important honest warning:

Under repeated production load, some large-model requests returned provider-side `503` or `504` responses. This was most visible with the Risk Matrix path and occasional retries on other artifact types.

That is not ideal, but it is a real production behavior worth documenting. The app handled these as provider errors instead of pretending everything was fine.

The practical lesson: hosted large-model inference can be excellent, but you still need UX and backend behavior that account for latency, retries, and temporary provider failures.

## Example Backend Call

A direct production request looks like this:

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

The backend builds a deliverable-specific prompt, sends it to Gemma 4 through the Google GenAI SDK, and returns structured metadata plus the generated Markdown.

## What I Learned

This project taught me more from the integration work than from the happy-path implementation.

### Model Names Matter

The difference between a short model name and the full hosted model resource ID can be the difference between a working production app and repeated provider errors.

For this deployment, the correct model was:

```text
models/gemma-4-26b-a4b-it
```

### Demo Mode Is Useful, But Dangerous

Demo mode helped me build the frontend quickly and made local development easier.

But for an AI challenge submission, it is not enough for the UI to look good. The app needs proof that production inference is real.

That is why I validated:

- response model metadata
- dynamic output content
- frontend calls to the deployed backend
- CORS behavior
- exports and UI rendering

### Hosted Open Models Still Need Product Thinking

Even with hosted inference, you need to design around:

- latency
- quota
- provider-side failures
- model availability
- environment variable mistakes
- clear user feedback

The frontend needs loading states. The backend needs clean errors. The docs need to explain what production is actually doing.

### AI Output Needs Workflow Context

The most useful output came from prompts that were specific to functional analysis and QA.

Generic "summarize this" prompting was not enough. The model performed better when each deliverable had a clear structure, role, audience, and expectation.

## What I Would Improve Next

Given more time, I would add:

- PDF and DOCX ingestion
- Jira API export
- Confluence publishing
- team workspaces
- project-specific prompt libraries
- evaluation tests for artifact quality
- retry/backoff controls for provider instability
- async job handling for long-running generations

The async generation path is especially interesting. Some production calls took long enough that a job-based UX would be better than keeping the user inside a single request-response wait.

## Final Thoughts

Gemma Functional Analyst Copilot is a practical example of using Gemma 4 inside a real software delivery workflow.

It does not try to replace analysts. It tries to remove the blank-page problem from repetitive documentation work so analysts can spend more time reviewing, correcting, challenging assumptions, and aligning teams.

The build also reinforced a very normal engineering truth: the demo is only half the work. The rest is deployment, configuration, validation, debugging, and telling the truth about what happened.

Try it here:

- [Live frontend](https://gemma-functional-analyst-copilot-cl.vercel.app)
- [Backend health endpoint](https://gemma-functional-analyst-copilot.onrender.com/health)
- [GitHub repository](https://github.com/olcesefacundo97/gemma-functional-analyst-copilot)

Challenge tags:

#devchallenge #gemmachallenge #gemma #ai #react #fastapi
