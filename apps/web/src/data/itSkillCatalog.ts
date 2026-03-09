import {
  createSlug,
  type FunctionSkillComplexity,
  type FunctionSkillIdea,
  unique,
} from "./functionSkillTypes";

export type ItSkillCategory =
  | "Help Desk Triage"
  | "Access & Identity"
  | "Endpoint & Asset Management"
  | "Incident Response & Reliability"
  | "Knowledge & Change Management";

interface CategoryTemplate {
  readonly stage: string;
  readonly primaryUsers: ReadonlyArray<string>;
  readonly inputs: ReadonlyArray<string>;
  readonly workflow: ReadonlyArray<string>;
  readonly outputs: ReadonlyArray<string>;
  readonly integrations: ReadonlyArray<string>;
  readonly automations: ReadonlyArray<string>;
  readonly kpis: ReadonlyArray<string>;
  readonly guardrails: ReadonlyArray<string>;
  readonly complexity: FunctionSkillComplexity;
  readonly estimatedBuildWeeks: number;
  readonly rolloutMotion: string;
}

interface ItSkillSeed {
  readonly name: string;
  readonly idealFor: string;
  readonly value: string;
  readonly focus: string;
  readonly artifact: string;
  readonly kpi: string;
  readonly complexity?: FunctionSkillComplexity;
  readonly estimatedBuildWeeks?: number;
}

const TEMPLATES: Record<ItSkillCategory, CategoryTemplate> = {
  "Help Desk Triage": {
    stage: "Daily support operations",
    primaryUsers: ["Help desk lead", "Support analyst", "IT manager"],
    inputs: ["Ticket queue", "Request metadata", "SLA policy"],
    workflow: [
      "Normalize incoming support requests and context",
      "Classify issue type, urgency, and ownership",
      "Recommend the next triage action with clear routing",
    ],
    outputs: ["triage board", "routing recommendation", "support summary"],
    integrations: ["Jira Service Management", "Slack", "Email", "Knowledge base"],
    automations: ["Escalate stalled tickets", "Notify owners on SLA risk"],
    kpis: ["First-response time", "SLA breach rate", "Reassignment rate"],
    guardrails: [
      "Never auto-close tickets without explicit customer confirmation",
      "Preserve a complete audit trail of all triage decisions",
    ],
    complexity: "medium",
    estimatedBuildWeeks: 5,
    rolloutMotion: "Pilot with one support queue and measure triage quality plus SLA adherence.",
  },
  "Access & Identity": {
    stage: "Identity and access control",
    primaryUsers: ["IT admin", "Security admin", "People ops partner"],
    inputs: ["Access request", "Role profile", "Approval policy"],
    workflow: [
      "Validate requester identity and role requirements",
      "Check policy fit, segregation constraints, and exceptions",
      "Generate an approval-ready access recommendation",
    ],
    outputs: ["access decision brief", "approval package", "provisioning checklist"],
    integrations: ["Okta", "Google Workspace", "HRIS", "Ticketing"],
    automations: ["Remind approvers on aging requests", "Trigger deprovisioning tasks on offboarding"],
    kpis: ["Access request turnaround", "Policy exception rate", "Offboarding completion time"],
    guardrails: [
      "Require explicit approval evidence for privileged access changes",
      "Block recommendations that violate separation-of-duties rules",
    ],
    complexity: "medium",
    estimatedBuildWeeks: 5,
    rolloutMotion: "Pilot with one department and measure approval latency plus audit readiness.",
  },
  "Endpoint & Asset Management": {
    stage: "Asset lifecycle control",
    primaryUsers: ["Endpoint admin", "IT operations analyst", "Procurement ops"],
    inputs: ["Device inventory", "Lifecycle status", "Compliance policy"],
    workflow: [
      "Reconcile asset records with current endpoint signals",
      "Detect lifecycle gaps, compliance drift, and ownership risk",
      "Recommend prioritized remediation and replacement actions",
    ],
    outputs: ["asset lifecycle report", "compliance action queue", "replacement plan"],
    integrations: ["MDM", "CMDB", "Procurement system", "Ticketing"],
    automations: ["Open tasks for non-compliant devices", "Notify owners before replacement deadlines"],
    kpis: ["Asset accuracy", "Endpoint compliance rate", "Replacement cycle adherence"],
    guardrails: [
      "Do not retire or wipe devices without approved handoff records",
      "Require evidence before marking endpoint compliance complete",
    ],
    complexity: "medium",
    estimatedBuildWeeks: 5,
    rolloutMotion: "Pilot with one endpoint segment and measure compliance recovery velocity.",
  },
  "Incident Response & Reliability": {
    stage: "Incident and reliability response",
    primaryUsers: ["Incident commander", "SRE lead", "IT manager"],
    inputs: ["Incident alerts", "System health signals", "Runbooks"],
    workflow: [
      "Consolidate incident context from alerts and recent changes",
      "Prioritize impact and suggest next response steps",
      "Track ownership, recovery progress, and communication updates",
    ],
    outputs: ["incident brief", "response plan", "recovery timeline"],
    integrations: ["Monitoring", "PagerDuty", "Slack", "Status page"],
    automations: ["Escalate unresolved incidents", "Prompt status update cadence"],
    kpis: ["Mean time to acknowledge", "Mean time to recover", "Repeat incident rate"],
    guardrails: [
      "Escalate suspected security incidents immediately",
      "Keep customer-facing updates factual and timestamped",
    ],
    complexity: "high",
    estimatedBuildWeeks: 6,
    rolloutMotion: "Pilot on one incident class and compare response coordination quality.",
  },
  "Knowledge & Change Management": {
    stage: "Documentation and change governance",
    primaryUsers: ["IT lead", "Change manager", "Support enablement owner"],
    inputs: ["Runbooks", "Change requests", "Post-incident notes"],
    workflow: [
      "Review change scope, dependencies, and rollback readiness",
      "Map required communications and knowledge updates",
      "Package a release-ready change and enablement plan",
    ],
    outputs: ["change brief", "rollback checklist", "knowledge update plan"],
    integrations: ["Docs", "Ticketing", "GitHub", "Slack"],
    automations: ["Remind teams to update docs after changes", "Flag stale runbooks after incidents"],
    kpis: ["Change success rate", "Rollback frequency", "Knowledge freshness"],
    guardrails: [
      "Do not approve high-risk changes without rollback validation",
      "Require owner sign-off for user-facing knowledge updates",
    ],
    complexity: "medium",
    estimatedBuildWeeks: 4,
    rolloutMotion: "Pilot with one weekly change window and tune governance thresholds.",
  },
};

const SEEDS: Record<ItSkillCategory, ReadonlyArray<ItSkillSeed>> = {
  "Help Desk Triage": [
    {
      name: "Ticket Intake Normalizer",
      idealFor: "Teams receiving requests through chat, forms, and email",
      value: "Creates consistent intake context so triage starts with usable data.",
      focus: "request channel, account context, and issue summary",
      artifact: "intake quality report",
      kpi: "Tickets with complete intake context",
    },
    {
      name: "SLA Risk Detector",
      idealFor: "Support leads trying to prevent avoidable breaches",
      value: "Flags which tickets are likely to breach and why.",
      focus: "ticket age, SLA policy, owner queue load, and priority",
      artifact: "SLA risk queue",
      kpi: "Avoided SLA breaches",
    },
    {
      name: "Tier Routing Advisor",
      idealFor: "Help desks balancing Tier 1, Tier 2, and specialist queues",
      value: "Improves first routing quality by matching issues to the right tier.",
      focus: "issue type, historical resolution path, and skill ownership",
      artifact: "tier routing recommendation",
      kpi: "First-pass routing accuracy",
    },
    {
      name: "Escalation Readiness Checker",
      idealFor: "Analysts preparing tickets for advanced support escalation",
      value: "Ensures escalations include complete diagnostic evidence.",
      focus: "diagnostics, repro steps, impacted users, and environment data",
      artifact: "escalation readiness checklist",
      kpi: "Escalations resolved without bounce-back",
    },
  ],
  "Access & Identity": [
    {
      name: "Access Request Classifier",
      idealFor: "Teams triaging high volumes of provisioning requests",
      value: "Separates standard, privileged, and exception requests automatically.",
      focus: "requested systems, requester role, and access level",
      artifact: "access routing matrix",
      kpi: "Access request triage time",
    },
    {
      name: "Joiner Provisioning Coordinator",
      idealFor: "IT teams handling onboarding at scale",
      value: "Coordinates account setup tasks by role and start date.",
      focus: "job role, start date, team, and required applications",
      artifact: "onboarding provisioning plan",
      kpi: "Day-one access completeness",
    },
    {
      name: "Leaver Deprovisioning Tracker",
      idealFor: "Teams ensuring complete offboarding controls",
      value: "Tracks every system where access must be revoked.",
      focus: "account inventory, privileged groups, and offboarding deadlines",
      artifact: "offboarding access checklist",
      kpi: "Offboarding access closure within SLA",
    },
    {
      name: "SoD Conflict Detector",
      idealFor: "Teams enforcing separation-of-duties controls",
      value: "Highlights access combinations that violate control policy.",
      focus: "entitlement sets, role combinations, and policy matrix",
      artifact: "SoD exception report",
      kpi: "Unresolved SoD conflicts",
      complexity: "high",
      estimatedBuildWeeks: 6,
    },
  ],
  "Endpoint & Asset Management": [
    {
      name: "Endpoint Compliance Drift Tracker",
      idealFor: "Endpoint teams monitoring patch and policy drift",
      value: "Flags endpoint populations that are drifting out of compliance.",
      focus: "patch state, policy status, and endpoint health signals",
      artifact: "endpoint drift report",
      kpi: "Endpoint compliance recovery time",
    },
    {
      name: "Patch Rollout Risk Triage",
      idealFor: "Teams staging patch waves across mixed device fleets",
      value: "Prioritizes rollout groups based on risk and business exposure.",
      focus: "patch criticality, device cohorts, and business criticality",
      artifact: "patch rollout plan",
      kpi: "Critical patch coverage within target",
    },
    {
      name: "Asset Ownership Reconciler",
      idealFor: "IT ops teams with stale CMDB ownership data",
      value: "Aligns endpoint records with current people and team ownership.",
      focus: "CMDB owner fields, HR roster data, and active-user signals",
      artifact: "asset ownership mismatch log",
      kpi: "Assets with validated owner records",
    },
    {
      name: "Software Entitlement Cleanup Advisor",
      idealFor: "IT ops and finance teams controlling software waste",
      value: "Identifies inactive or duplicate software entitlements for cleanup.",
      focus: "license usage, assignment roster, and renewal dates",
      artifact: "license cleanup recommendation",
      kpi: "Recovered software license spend",
    },
  ],
  "Incident Response & Reliability": [
    {
      name: "Incident Severity Classifier",
      idealFor: "On-call teams triaging incoming incident alerts",
      value: "Applies consistent impact-based severity levels to incidents.",
      focus: "service impact, user scope, and dependency criticality",
      artifact: "severity classification record",
      kpi: "Time to severity assignment",
    },
    {
      name: "Status Update Composer",
      idealFor: "Incident commanders issuing frequent stakeholder updates",
      value: "Creates structured, factual updates for internal and external audiences.",
      focus: "current impact, mitigation steps, and ETA confidence",
      artifact: "incident status update draft",
      kpi: "Status update cadence adherence",
    },
    {
      name: "Dependency Blast Radius Mapper",
      idealFor: "Teams diagnosing cascading failures across services",
      value: "Highlights likely downstream systems and teams affected.",
      focus: "service dependency map, recent changes, and traffic paths",
      artifact: "blast radius map",
      kpi: "Time to impacted-service identification",
      complexity: "high",
      estimatedBuildWeeks: 7,
    },
    {
      name: "Post-incident Action Curator",
      idealFor: "Teams running structured postmortem follow-through",
      value: "Converts postmortem findings into owned actions with deadlines.",
      focus: "root causes, findings, and owner availability",
      artifact: "postmortem action plan",
      kpi: "Postmortem action closure time",
    },
  ],
  "Knowledge & Change Management": [
    {
      name: "Runbook Freshness Auditor",
      idealFor: "Teams maintaining operational runbooks at scale",
      value: "Finds stale runbooks and prioritizes updates by risk.",
      focus: "runbook update age, recent incidents, and service criticality",
      artifact: "runbook freshness backlog",
      kpi: "Critical runbooks updated on schedule",
    },
    {
      name: "Change Intake Quality Checker",
      idealFor: "Change managers reviewing high request volume",
      value: "Ensures change requests include impact and rollback details.",
      focus: "change scope, test evidence, and rollback plan",
      artifact: "change intake validation report",
      kpi: "Change requests passing first review",
    },
    {
      name: "Change Window Collision Detector",
      idealFor: "IT teams managing concurrent changes across services",
      value: "Identifies risky overlaps in planned change windows.",
      focus: "change schedules, service dependencies, and risk levels",
      artifact: "change collision matrix",
      kpi: "High-risk change collisions prevented",
    },
    {
      name: "Rollback Readiness Verifier",
      idealFor: "Teams shipping production changes with strict reliability standards",
      value: "Verifies rollback plans are testable and owned before release.",
      focus: "rollback procedures, test results, and owner assignments",
      artifact: "rollback readiness scorecard",
      kpi: "Changes with validated rollback plan",
      complexity: "high",
      estimatedBuildWeeks: 6,
    },
  ],
};

const IT_SKILL_BASES = (Object.entries(SEEDS) as ReadonlyArray<[ItSkillCategory, ReadonlyArray<ItSkillSeed>]>).flatMap(
  ([category, skills]) => skills.map((skill) => ({ ...skill, category })),
);

function buildItSkill(skill: ItSkillSeed & { readonly category: ItSkillCategory }, id: number): FunctionSkillIdea<ItSkillCategory> {
  const template = TEMPLATES[skill.category];

  return {
    id,
    slug: createSlug(skill.name),
    name: skill.name,
    category: skill.category,
    stage: template.stage,
    idealFor: skill.idealFor,
    value: skill.value,
    spec: {
      problem: `${skill.name} fails when teams rely on manual handoffs and inconsistent context.`,
      trigger: `Run when ${skill.focus} changes or a related IT workflow is created.`,
      primaryUsers: template.primaryUsers,
      inputs: unique([...template.inputs, skill.focus]),
      workflow: unique([
        ...template.workflow,
        `Prioritize ${skill.focus} based on business impact and urgency.`,
      ]),
      outputs: unique([...template.outputs, skill.artifact]),
      integrations: template.integrations,
      automations: unique([...template.automations, `Auto-track ${skill.artifact} updates`]),
      kpis: unique([...template.kpis, skill.kpi]),
      guardrails: template.guardrails,
      complexity: skill.complexity ?? template.complexity,
      estimatedBuildWeeks: skill.estimatedBuildWeeks ?? template.estimatedBuildWeeks,
      rolloutMotion: template.rolloutMotion,
    },
  };
}

export const IT_SKILL_CATALOG: ReadonlyArray<FunctionSkillIdea<ItSkillCategory>> = IT_SKILL_BASES.map(
  (skill, index) => buildItSkill(skill, index + 1),
);

export const IT_SKILL_CATEGORIES: ReadonlyArray<ItSkillCategory> = Array.from(
  new Set(IT_SKILL_CATALOG.map((skill) => skill.category)),
).toSorted((left, right) => left.localeCompare(right));

export const IT_SKILL_TOTAL = IT_SKILL_CATALOG.length;
