import { ACCOUNTING_FINANCE_SKILL_TOTAL } from "./accountingFinanceSkillCatalog";
import { IT_SKILL_TOTAL } from "./itSkillCatalog";
import { OPERATIONS_SKILL_TOTAL } from "./operationsSkillCatalog";
import { SALES_SKILL_TOTAL } from "./salesSkillCatalog";

export type BusinessFunctionSource = "core" | "suggested";
export type BusinessFunctionStatus = "live" | "planned";
export type BusinessFunctionTaskPhase =
  | "Workflow Mapping"
  | "Data & Systems"
  | "Skill Pack"
  | "Spec Writing"
  | "MVP Build"
  | "Pilot";

export interface BusinessFunctionTask {
  readonly phase: BusinessFunctionTaskPhase;
  readonly title: string;
  readonly deliverable: string;
}

export interface BusinessFunctionCategory {
  readonly slug: string;
  readonly name: string;
  readonly source: BusinessFunctionSource;
  readonly status: BusinessFunctionStatus;
  readonly summary: string;
  readonly currentSkillCount: number;
  readonly targetSkillCount: number;
  readonly owners: ReadonlyArray<string>;
  readonly workflowTracks: ReadonlyArray<string>;
  readonly keySystems: ReadonlyArray<string>;
  readonly tasks: ReadonlyArray<BusinessFunctionTask>;
}

interface PlannedCategoryInput {
  readonly slug: string;
  readonly name: string;
  readonly source: BusinessFunctionSource;
  readonly summary: string;
  readonly targetSkillCount: number;
  readonly owners: ReadonlyArray<string>;
  readonly workflowTracks: ReadonlyArray<string>;
  readonly keySystems: ReadonlyArray<string>;
  readonly firstWave: string;
  readonly pilotMotion: string;
}

function createPlannedTasks(input: PlannedCategoryInput): ReadonlyArray<BusinessFunctionTask> {
  return [
    {
      phase: "Workflow Mapping",
      title: `Map the highest-friction ${input.name.toLowerCase()} workflows`,
      deliverable: `Workflow map covering ${input.workflowTracks.slice(0, 3).join(", ")} with current pain points and decision owners.`,
    },
    {
      phase: "Data & Systems",
      title: `Define the ${input.name.toLowerCase()} data and integration contract`,
      deliverable: `System matrix for ${input.keySystems.slice(0, 4).join(", ")} plus required entities, events, approvals, and audit rules.`,
    },
    {
      phase: "Skill Pack",
      title: `Prioritize the first skill pack for ${input.name}`,
      deliverable: `Ranked backlog of the first ${input.targetSkillCount >= 60 ? 15 : 10} candidate skills, anchored on ${input.firstWave}.`,
    },
    {
      phase: "Spec Writing",
      title: `Draft build specs for the first ${input.name.toLowerCase()} wave`,
      deliverable: `Detailed specs for the first wave, including trigger, workflow, outputs, integrations, KPIs, and guardrails.`,
    },
    {
      phase: "MVP Build",
      title: `Build the core ${input.name.toLowerCase()} runtime and UI primitives`,
      deliverable: `Shared entity model, task orchestration, category UI, and review loop needed to ship the first ${input.name.toLowerCase()} skills.`,
    },
    {
      phase: "Pilot",
      title: `Run a pilot for the first ${input.name.toLowerCase()} skill pack`,
      deliverable: input.pilotMotion,
    },
  ];
}

const SALES_CATEGORY: BusinessFunctionCategory = {
  slug: "sales",
  name: "Sales",
  source: "core",
  status: "live",
  summary:
    "Revenue generation workflows across prospecting, qualification, deal strategy, forecasting, and account growth.",
  currentSkillCount: SALES_SKILL_TOTAL,
  targetSkillCount: 150,
  owners: ["Sales leadership", "RevOps", "AEs and SDRs", "Deal desk"],
  workflowTracks: [
    "Prospecting and territory planning",
    "Qualification and discovery",
    "Proposal, procurement, and close plans",
    "Forecasting, inspection, and account growth",
  ],
  keySystems: ["Salesforce", "HubSpot", "Gong", "Outreach", "CPQ", "Slack"],
  tasks: [
    {
      phase: "Workflow Mapping",
      title: "Group the 100 sales skills into productized build lanes",
      deliverable:
        "A normalized taxonomy that rolls the current catalog into reusable packs such as prospecting, deal execution, forecasting, and expansion.",
    },
    {
      phase: "Data & Systems",
      title: "Define the shared sales entity model",
      deliverable:
        "A single contract for accounts, contacts, opportunities, stakeholder maps, sequences, approvals, and forecast evidence.",
    },
    {
      phase: "Skill Pack",
      title: "Pick the first production sales pack",
      deliverable:
        "Prioritized launch wave of 10 to 15 skills with the fastest path to measurable rep time savings and forecast improvement.",
    },
    {
      phase: "Spec Writing",
      title: "Expand every sales card into implementation-grade specs",
      deliverable:
        "Detailed per-skill specs with API boundaries, state transitions, prompt templates, evaluation rubrics, and operator guardrails.",
    },
    {
      phase: "MVP Build",
      title: "Ship the shared sales runtime",
      deliverable:
        "A reusable engine for account context assembly, transcript ingestion, approval routing, CRM sync, and task recommendations.",
    },
    {
      phase: "Pilot",
      title: "Pilot the first sales pack with one manager pod",
      deliverable:
        "A pilot scorecard measuring prep time saved, CRM hygiene, reply-to-meeting conversion, and forecast-confidence lift.",
    },
  ],
};

const OPERATIONS_CATEGORY: BusinessFunctionCategory = {
  slug: "operations",
  name: "Operations",
  source: "core",
  status: "live",
  summary:
    "Internal execution, service delivery, scheduling, SOP enforcement, quality control, and exception management.",
  currentSkillCount: OPERATIONS_SKILL_TOTAL,
  targetSkillCount: 80,
  owners: ["COO", "Operations manager", "Service lead", "Branch manager"],
  workflowTracks: [
    "Scheduling and dispatch",
    "Workforce and capacity planning",
    "SOP compliance and operating controls",
    "Service quality and escalation recovery",
  ],
  keySystems: ["ERP", "Scheduling system", "Maps provider", "Forms", "Slack", "Service desk"],
  tasks: [
    {
      phase: "Workflow Mapping",
      title: "Group the operations skills into dispatch, staffing, compliance, quality, and escalation lanes",
      deliverable:
        "A lane model that maps every operations skill to the daily operating rhythms managers already run.",
    },
    {
      phase: "Data & Systems",
      title: "Define the shared operations entity model",
      deliverable:
        "A contract for jobs, crews, shifts, SOP checklists, incidents, blockers, and service-quality evidence.",
    },
    {
      phase: "Skill Pack",
      title: "Pick the first production operations pack",
      deliverable:
        "A prioritized launch wave of dispatch, capacity, and escalation skills with the shortest path to SLA and cycle-time impact.",
    },
    {
      phase: "Spec Writing",
      title: "Expand operations cards into execution-grade specs",
      deliverable:
        "Per-skill specs with assignment rules, escalation thresholds, review checkpoints, and operational guardrails.",
    },
    {
      phase: "MVP Build",
      title: "Ship the shared operations runtime",
      deliverable:
        "Reusable state and workflows for schedule refresh, job prioritization, checklist validation, and exception routing.",
    },
    {
      phase: "Pilot",
      title: "Pilot the first operations pack with one live team",
      deliverable:
        "A scorecard measuring schedule adherence, dispatch prep time, exception response speed, and QA completion quality.",
    },
  ],
};

const ACCOUNTING_FINANCE_CATEGORY: BusinessFunctionCategory = {
  slug: "accounting-finance",
  name: "Accounting & Finance",
  source: "core",
  status: "live",
  summary:
    "Billing, collections, payables, close, treasury, controls, planning, and management reporting.",
  currentSkillCount: ACCOUNTING_FINANCE_SKILL_TOTAL,
  targetSkillCount: 90,
  owners: ["Controller", "Finance manager", "FP&A lead", "Accounting ops"],
  workflowTracks: [
    "Receivables and billing",
    "Payables and approvals",
    "Close and reconciliation",
    "Treasury, controls, and FP&A reporting",
  ],
  keySystems: ["QuickBooks", "NetSuite", "ERP", "Bank feeds", "Planning models", "BI"],
  tasks: [
    {
      phase: "Workflow Mapping",
      title: "Group the accounting and finance skills into money movement, close, controls, and planning lanes",
      deliverable:
        "A lane model that separates collection, spend, close, treasury, and reporting work without duplicating shared finance logic.",
    },
    {
      phase: "Data & Systems",
      title: "Define the shared accounting and finance entity model",
      deliverable:
        "A contract for invoices, payments, approvals, reconciliations, cash positions, controls, budgets, and forecast assumptions.",
    },
    {
      phase: "Skill Pack",
      title: "Pick the first production accounting and finance pack",
      deliverable:
        "A ranked first wave focused on AR, close management, and variance reporting where payback should be clearest.",
    },
    {
      phase: "Spec Writing",
      title: "Expand finance cards into control-ready build specs",
      deliverable:
        "Detailed specs covering evidence requirements, approval boundaries, data quality rules, and audit-safe operator review points.",
    },
    {
      phase: "MVP Build",
      title: "Ship the shared accounting and finance runtime",
      deliverable:
        "Reusable logic for exception queues, reconciliation review, cash visibility, approval routing, and reporting commentary generation.",
    },
    {
      phase: "Pilot",
      title: "Pilot the first accounting and finance pack through one reporting cycle",
      deliverable:
        "A scorecard measuring close speed, exception visibility, cash review prep time, and reporting turnaround.",
    },
  ],
};

const IT_CATEGORY: BusinessFunctionCategory = {
  slug: "it",
  name: "IT",
  source: "core",
  status: "live",
  summary:
    "Support tickets, access workflows, endpoint lifecycle, incident response, and change governance.",
  currentSkillCount: IT_SKILL_TOTAL,
  targetSkillCount: 65,
  owners: ["IT manager", "Help desk lead", "Security admin", "Systems administrator"],
  workflowTracks: [
    "Ticket triage and knowledge reuse",
    "Access provisioning and offboarding",
    "Endpoint and lifecycle management",
    "Incident communication and response",
  ],
  keySystems: ["Jira Service Management", "Okta", "Google Workspace", "MDM", "CMDB"],
  tasks: [
    {
      phase: "Workflow Mapping",
      title: "Group IT skills into support, access, endpoint, incident, and change lanes",
      deliverable:
        "A lane model that keeps service desk and infrastructure workflows connected without blending ownership boundaries.",
    },
    {
      phase: "Data & Systems",
      title: "Define the shared IT entity model",
      deliverable:
        "A contract for tickets, identities, entitlements, devices, incidents, and change records across IT operations.",
    },
    {
      phase: "Skill Pack",
      title: "Pick the first production IT pack",
      deliverable:
        "A ranked first wave focused on ticket triage, access flows, and incident communication where operational payoff is immediate.",
    },
    {
      phase: "Spec Writing",
      title: "Expand IT cards into implementation-ready specs",
      deliverable:
        "Per-skill specs with triggers, required evidence, integration boundaries, KPI targets, and operator guardrails.",
    },
    {
      phase: "MVP Build",
      title: "Ship the shared IT runtime",
      deliverable:
        "Reusable state and workflows for support routing, identity actions, endpoint remediation, and reliability follow-through.",
    },
    {
      phase: "Pilot",
      title: "Pilot the first IT pack with one support pod",
      deliverable:
        "A scorecard measuring first-response time, access turnaround, endpoint compliance recovery, and incident communication quality.",
    },
  ],
};
const PLANNED_CATEGORIES = [
  {
    slug: "distribution",
    name: "Distribution",
    source: "core",
    summary:
      "Warehouse, routing, delivery coordination, stock movement, and fulfillment visibility across distribution workflows.",
    targetSkillCount: 60,
    owners: ["Distribution manager", "Warehouse lead", "Logistics coordinator", "Dispatch lead"],
    workflowTracks: [
      "Warehouse receiving and putaway",
      "Pick-pack-ship coordination",
      "Route and handoff management",
      "Inventory movement exceptions",
    ],
    keySystems: ["WMS", "TMS", "ERP", "Barcode systems", "Carrier APIs"],
    firstWave: "fulfillment exception handling, route updates, and stock movement visibility",
    pilotMotion:
      "Pilot in one site or route region and track pick accuracy, on-time delivery, and exception resolution time.",
  },
  {
    slug: "ordering-rfp-rfq",
    name: "Ordering, RFP & RFQ",
    source: "core",
    summary:
      "Quote requests, sourcing requests, proposal assembly, intake validation, and bid-response workflows.",
    targetSkillCount: 65,
    owners: ["Bid manager", "Sales ops", "Procurement lead", "Proposal team"],
    workflowTracks: [
      "RFQ and order intake validation",
      "RFP response coordination",
      "Pricing and quote assembly",
      "Approval and submission tracking",
    ],
    keySystems: ["CPQ", "Proposal docs", "ERP", "Bid portals", "Email", "CRM"],
    firstWave: "RFP intake, RFQ scoping, and quote-approval routing",
    pilotMotion:
      "Pilot on one proposal or sourcing team and measure time to first draft, approval turnaround, and submission quality.",
  },
  {
    slug: "marketing",
    name: "Marketing",
    source: "core",
    summary:
      "Campaign planning, content production, demand capture, approvals, and performance reporting across growth functions.",
    targetSkillCount: 75,
    owners: ["Marketing leader", "Demand gen manager", "Content lead", "Growth ops"],
    workflowTracks: [
      "Campaign planning and launch",
      "Content operations and approvals",
      "Lead handoff and attribution",
      "Performance reporting and optimization",
    ],
    keySystems: ["HubSpot", "Marketo", "GA4", "LinkedIn Ads", "CMS", "Creative workflows"],
    firstWave: "campaign briefs, content approvals, and performance summarization",
    pilotMotion:
      "Pilot with one demand-gen team and measure launch time, approval latency, and lead-quality feedback from sales.",
  },
  {
    slug: "development",
    name: "Development",
    source: "core",
    summary:
      "Engineering execution, backlog refinement, review workflows, release coordination, and technical documentation.",
    targetSkillCount: 90,
    owners: ["Engineering manager", "Tech lead", "Product engineer", "QA lead"],
    workflowTracks: [
      "Backlog refinement and scoping",
      "Code review and release readiness",
      "Incident follow-up and bug triage",
      "Developer documentation and enablement",
    ],
    keySystems: ["GitHub", "Linear", "CI/CD", "Docs", "Observability tools"],
    firstWave: "triage, spec drafting, release notes, and developer handoff workflows",
    pilotMotion:
      "Pilot inside one engineering squad and measure cycle time, review latency, and release-prep effort.",
  },
  {
    slug: "customer-support-success",
    name: "Customer Support & Success",
    source: "suggested",
    summary:
      "Support case handling, onboarding, renewals, health monitoring, and customer outcome delivery.",
    targetSkillCount: 70,
    owners: ["Support manager", "CSM lead", "Implementation manager", "Renewals lead"],
    workflowTracks: [
      "Ticket triage and resolution",
      "Onboarding and implementation",
      "Health and escalation management",
      "Renewal and expansion readiness",
    ],
    keySystems: ["Zendesk", "Intercom", "Gainsight", "CRM", "Knowledge base"],
    firstWave: "ticket triage, onboarding plans, and renewal-risk detection",
    pilotMotion:
      "Pilot with one support-success pod and measure response time, onboarding throughput, and renewal-risk lead time.",
  },
  {
    slug: "hr-people-ops",
    name: "HR & People Ops",
    source: "suggested",
    summary:
      "Hiring, onboarding, policy management, performance workflows, and employee service operations.",
    targetSkillCount: 55,
    owners: ["People ops lead", "Recruiting manager", "HRBP", "Talent ops"],
    workflowTracks: [
      "Candidate screening and scheduling",
      "Employee onboarding and offboarding",
      "Policy, compliance, and acknowledgements",
      "Performance and people-service workflows",
    ],
    keySystems: ["ATS", "HRIS", "Slack", "DocuSign", "LMS"],
    firstWave: "candidate triage, onboarding orchestration, and HR service automation",
    pilotMotion:
      "Pilot with people ops and measure onboarding time, HR request turnaround, and policy-completion rates.",
  },
  {
    slug: "procurement-vendor-management",
    name: "Procurement & Vendor Management",
    source: "suggested",
    summary:
      "Sourcing, vendor onboarding, purchase approvals, contract tracking, and supplier performance workflows.",
    targetSkillCount: 55,
    owners: ["Procurement manager", "Sourcing lead", "Vendor manager", "Finance ops"],
    workflowTracks: [
      "Vendor intake and onboarding",
      "Purchase request and approval routing",
      "Supplier comparison and sourcing",
      "Contract renewals and compliance",
    ],
    keySystems: ["Procurement suite", "ERP", "Contract repository", "AP system", "Email"],
    firstWave: "vendor onboarding, purchase approvals, and supplier comparison",
    pilotMotion:
      "Pilot with procurement on one sourcing lane and measure approval speed, onboarding completeness, and contract visibility.",
  },
  {
    slug: "legal-compliance",
    name: "Legal & Compliance",
    source: "suggested",
    summary:
      "Policy review, contract intake, audit evidence, risk triage, and regulatory task management.",
    targetSkillCount: 50,
    owners: ["Legal ops", "Compliance manager", "Security lead", "Risk owner"],
    workflowTracks: [
      "Contract intake and review routing",
      "Policy change and acknowledgement tracking",
      "Audit and evidence collection",
      "Risk issue triage and escalation",
    ],
    keySystems: ["Contract management", "GRC tools", "Shared docs", "Ticketing", "Approval workflows"],
    firstWave: "contract triage, evidence collection, and policy control automation",
    pilotMotion:
      "Pilot with legal or compliance on one intake workflow and measure review turnaround plus evidence completeness.",
  },
  {
    slug: "product-project-management",
    name: "Product & Project Management",
    source: "suggested",
    summary:
      "Roadmap planning, requirements, delivery coordination, stakeholder updates, and launch readiness.",
    targetSkillCount: 60,
    owners: ["Product manager", "Program manager", "PMO lead", "Delivery manager"],
    workflowTracks: [
      "Roadmap and intake triage",
      "Requirements and spec assembly",
      "Cross-functional status tracking",
      "Launch and readiness coordination",
    ],
    keySystems: ["Linear", "Jira", "Docs", "Roadmap tools", "Release calendars"],
    firstWave: "intake triage, spec drafting, and launch-readiness coordination",
    pilotMotion:
      "Pilot with one product-program pair and measure planning overhead, spec quality, and status-prep time.",
  },
  {
    slug: "executive-strategy-fpa",
    name: "Executive & Strategy",
    source: "suggested",
    summary:
      "Planning, KPI review, board reporting, and cross-functional decision support for leadership teams.",
    targetSkillCount: 45,
    owners: ["CEO staff", "Strategy lead", "FP&A manager", "Business ops"],
    workflowTracks: [
      "Planning and target setting",
      "Budget and variance analysis",
      "Board and leadership reporting",
      "Cross-functional initiative tracking",
    ],
    keySystems: ["BI dashboards", "Spreadsheet models", "ERP", "Planning docs", "Exec reporting"],
    firstWave: "variance analysis, KPI packs, and executive briefing generation",
    pilotMotion:
      "Pilot with finance or business ops and measure reporting turnaround, briefing quality, and planning-cycle compression.",
  },
] satisfies ReadonlyArray<PlannedCategoryInput>;

export const BUSINESS_FUNCTION_CATALOG: ReadonlyArray<BusinessFunctionCategory> = [
  SALES_CATEGORY,
  OPERATIONS_CATEGORY,
  ACCOUNTING_FINANCE_CATEGORY,
  IT_CATEGORY,
  ...PLANNED_CATEGORIES.map((category) => {
    const tasks = createPlannedTasks(category);
    return {
      slug: category.slug,
      name: category.name,
      source: category.source,
      status: "planned" as const,
      summary: category.summary,
      currentSkillCount: 0,
      targetSkillCount: category.targetSkillCount,
      owners: category.owners,
      workflowTracks: category.workflowTracks,
      keySystems: category.keySystems,
      tasks,
    };
  }),
];

export const CORE_BUSINESS_FUNCTIONS = BUSINESS_FUNCTION_CATALOG.filter(
  (category) => category.source === "core",
);

export const SUGGESTED_BUSINESS_FUNCTIONS = BUSINESS_FUNCTION_CATALOG.filter(
  (category) => category.source === "suggested",
);

export const TOTAL_BUSINESS_FUNCTIONS = BUSINESS_FUNCTION_CATALOG.length;
