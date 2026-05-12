import type { Template } from "../types";

export const templates: Template[] = [
  {
    id: "agile_user_story",
    name: "Agile User Story",
    description: "Epic, user stories, business value, dependencies, and open questions.",
    icon: "Users",
  },
  {
    id: "acceptance_criteria",
    name: "Acceptance Criteria",
    description: "Given/When/Then coverage for happy paths, edge cases, and failures.",
    icon: "ListChecks",
  },
  {
    id: "qa_test_cases",
    name: "QA Test Cases",
    description: "A test matrix with preconditions, steps, expected results, and priority.",
    icon: "Bug",
  },
  {
    id: "technical_summary",
    name: "Technical Summary",
    description: "Developer-ready scope, system assumptions, data needs, and integrations.",
    icon: "Code2",
  },
  {
    id: "stakeholder_summary",
    name: "Stakeholder Summary",
    description: "Executive-ready narrative for product owners, sponsors, and clients.",
    icon: "Presentation",
  },
  {
    id: "risk_matrix",
    name: "Risk Matrix",
    description: "Severity-labeled product, delivery, data, testing, and adoption risks.",
    icon: "ShieldAlert",
  },
  {
    id: "jira_ticket",
    name: "Jira-ready Ticket",
    description: "Title, description, AC, subtasks, labels, dependencies, and QA notes.",
    icon: "TicketCheck",
  },
];

export const sampleRequirement = `Meeting notes / rough requirement:
The city operations team needs a map-first dashboard to monitor traffic incidents, construction work, and road closures.
Users should see current events on the map, filter by event type, select an event to view details, and understand whether weather conditions may affect traffic.
The first MVP should support mocked data if the backend integration is not ready. Admin users will later manage alerts, but that is not part of this first scope.
The operations director wants a weekly executive summary showing response times and unresolved incidents.`;

export const sampleContext =
  "Urban mobility MVP for a public-sector client. The product team needs functional deliverables that can be reviewed by developers, QA analysts, and city stakeholders.";
