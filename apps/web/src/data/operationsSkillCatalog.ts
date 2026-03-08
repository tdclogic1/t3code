import {
  createSlug,
  type FunctionSkillComplexity,
  type FunctionSkillIdea,
  unique,
} from "./functionSkillTypes";

export type OperationsSkillCategory =
  | "Scheduling & Dispatch"
  | "Workforce & Capacity"
  | "SOP & Compliance"
  | "Service Delivery & Quality"
  | "Exceptions & Escalations";

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

interface OperationsSkillSeed {
  readonly name: string;
  readonly idealFor: string;
  readonly value: string;
  readonly problem: string;
  readonly trigger: string;
  readonly inputFocus: string;
  readonly workflowFocus: string;
  readonly artifact: string;
  readonly automation: string;
  readonly kpi: string;
  readonly integration?: string;
  readonly guardrail?: string;
  readonly complexity?: FunctionSkillComplexity;
  readonly estimatedBuildWeeks?: number;
}

interface OperationsSkillBase extends OperationsSkillSeed {
  readonly category: OperationsSkillCategory;
}

const CATEGORY_TEMPLATES: Record<OperationsSkillCategory, CategoryTemplate> = {
  "Scheduling & Dispatch": {
    stage: "Daily coordination",
    primaryUsers: ["Dispatch manager", "Operations coordinator", "Service lead"],
    inputs: ["Job queue", "Resource availability", "Location and route data"],
    workflow: [
      "Normalize open jobs and resource status",
      "Prioritize the queue by urgency, SLA, and constraints",
      "Recommend the next assignment or reroute action",
    ],
    outputs: ["dispatch plan", "assignment queue", "schedule change summary"],
    integrations: ["ERP", "Scheduling tool", "Maps provider", "SMS"],
    automations: ["Auto-alert dispatch changes", "Queue refresh on status updates"],
    kpis: ["On-time assignment rate", "Schedule adherence", "Dispatch planning time"],
    guardrails: [
      "Respect labor, geography, and skill constraints before recommending assignments",
      "Escalate resource conflicts instead of silently overbooking work",
    ],
    complexity: "medium",
    estimatedBuildWeeks: 5,
    rolloutMotion:
      "Pilot with one dispatch team and compare manual rescheduling effort against assisted coordination.",
  },
  "Workforce & Capacity": {
    stage: "Planning and staffing",
    primaryUsers: ["Operations manager", "Capacity planner", "Shift supervisor"],
    inputs: ["Demand forecast", "Shift roster", "Labor rules"],
    workflow: [
      "Compare expected work against available labor and assets",
      "Detect shortages, overloads, or underutilization",
      "Recommend staffing or sequencing adjustments",
    ],
    outputs: ["capacity forecast", "staffing recommendation", "coverage gap report"],
    integrations: ["Workforce system", "ERP", "Spreadsheet plan"],
    automations: ["Daily coverage alerts", "Shift shortage notifications"],
    kpis: ["Capacity utilization", "Overtime hours", "Coverage gap reduction"],
    guardrails: [
      "Honor labor rules and shift constraints",
      "Separate forecast assumptions from confirmed staffing commitments",
    ],
    complexity: "medium",
    estimatedBuildWeeks: 5,
    rolloutMotion:
      "Deploy with one planning cadence and tune thresholds against actual staffing outcomes.",
  },
  "SOP & Compliance": {
    stage: "Controlled execution",
    primaryUsers: ["Operations lead", "Compliance coordinator", "Site supervisor"],
    inputs: ["SOP library", "Checklist completion data", "Audit evidence"],
    workflow: [
      "Check work against required SOP steps and controls",
      "Identify missing evidence, skipped steps, or overdue actions",
      "Package the next follow-up for the owner",
    ],
    outputs: ["compliance scorecard", "missing-step alert", "audit-ready summary"],
    integrations: ["Forms", "Document storage", "Slack", "ERP"],
    automations: ["Checklist reminders", "Control escalation alerts"],
    kpis: ["SOP completion rate", "Audit readiness", "Exception closure time"],
    guardrails: [
      "Preserve audit evidence trails for every compliance recommendation",
      "Do not mark controls complete without supporting evidence",
    ],
    complexity: "medium",
    estimatedBuildWeeks: 5,
    rolloutMotion:
      "Pilot on one controlled process and compare audit prep effort plus exception visibility.",
  },
  "Service Delivery & Quality": {
    stage: "Execution and verification",
    primaryUsers: ["Service manager", "Quality lead", "Operations analyst"],
    inputs: ["Job completion data", "Customer feedback", "Service QA checklist"],
    workflow: [
      "Review delivered work and completion quality signals",
      "Find recurring quality gaps or service misses",
      "Recommend corrective action for teams and managers",
    ],
    outputs: ["quality review", "service trend summary", "corrective action plan"],
    integrations: ["CRM", "Survey tool", "ERP", "Ticketing"],
    automations: ["QA follow-up creation", "Repeat defect alerts"],
    kpis: ["First-time completion rate", "Quality defect rate", "Customer satisfaction"],
    guardrails: [
      "Link quality findings to source records and evidence",
      "Avoid closing quality issues until a human verifies the resolution",
    ],
    complexity: "medium",
    estimatedBuildWeeks: 6,
    rolloutMotion:
      "Start with one service line and validate that quality trends become visible sooner and cleaner.",
  },
  "Exceptions & Escalations": {
    stage: "Recovery and control",
    primaryUsers: ["Operations manager", "Escalation lead", "Support coordinator"],
    inputs: ["Incident queue", "SLA definitions", "Open blocker records"],
    workflow: [
      "Classify the severity and owner for each exception",
      "Rank the queue by business impact and SLA risk",
      "Generate the escalation or recovery path",
    ],
    outputs: ["exception queue", "escalation brief", "recovery status summary"],
    integrations: ["Ticketing system", "Slack", "Email", "ERP"],
    automations: ["SLA breach warnings", "Escalation routing"],
    kpis: ["Time to acknowledge", "Time to resolution", "Escalation containment rate"],
    guardrails: [
      "Keep a clear owner and timestamp trail for every escalation decision",
      "Require explicit severity evidence before escalating to critical",
    ],
    complexity: "medium",
    estimatedBuildWeeks: 5,
    rolloutMotion:
      "Pilot with one exception-heavy team and measure queue visibility plus response speed gains.",
  },
};

function createCategorySkills(
  category: OperationsSkillCategory,
  skills: ReadonlyArray<OperationsSkillSeed>,
): ReadonlyArray<OperationsSkillBase> {
  return skills.map((skill) => ({ ...skill, category }));
}

const SCHEDULING_AND_DISPATCH = createCategorySkills("Scheduling & Dispatch", [
  {
    name: "Dispatch Queue Optimizer",
    idealFor: "Teams assigning jobs throughout the day",
    value: "Ranks the live dispatch queue by urgency, route fit, and capacity.",
    problem: "Dispatchers lose time manually reordering work as field conditions change.",
    trigger: "Run whenever jobs, ETAs, or resource availability change.",
    inputFocus: "job priority, travel context, and team availability",
    workflowFocus: "re-score the queue and highlight the best next dispatch move",
    artifact: "ranked dispatch queue",
    automation: "Refresh the queue after every status update.",
    kpi: "Reduction in manual queue reshuffling time",
  },
  {
    name: "Route Change Recommender",
    idealFor: "Mobile teams with mid-day changes",
    value: "Suggests route changes when jobs slip, cancel, or surge unexpectedly.",
    problem: "A single cancellation or delay can break the day because route updates are reactive.",
    trigger: "Run when route timing drifts beyond the allowed threshold.",
    inputFocus: "ETA variance, cancellations, and nearby resource capacity",
    workflowFocus: "model reroute options with the least service disruption",
    artifact: "route change recommendation",
    automation: "Notify dispatchers as soon as a route deviation becomes actionable.",
    kpi: "On-time completion after route disruptions",
    integration: "Maps provider, routing data",
  },
  {
    name: "Field Assignment Matcher",
    idealFor: "Teams matching work to technician skill and territory",
    value: "Matches open work orders to the best-fit operator or technician.",
    problem: "Incorrect assignments create repeat visits, overtime, and SLA misses.",
    trigger: "Run when new jobs are created or assignments are rejected.",
    inputFocus: "skills, certifications, territory, and workload",
    workflowFocus: "rank the best-fit assignees and explain the tradeoffs",
    artifact: "assignment recommendation list",
    automation: "Push high-confidence matches into the dispatch review queue.",
    kpi: "First-time assignment accuracy",
  },
  {
    name: "Schedule Recovery Planner",
    idealFor: "Teams dealing with cascading lateness",
    value: "Builds a recovery plan when the day has already fallen behind.",
    problem: "Operations teams struggle to recover a broken schedule without a quick scenario view.",
    trigger: "Run when planned completion falls outside daily target thresholds.",
    inputFocus: "open jobs, delay reasons, and remaining capacity",
    workflowFocus: "sequence the recovery options and recommend the least painful reset",
    artifact: "schedule recovery plan",
    automation: "Generate a recovery draft when delay thresholds are crossed.",
    kpi: "Jobs saved from same-day slippage",
  },
  {
    name: "Crew Availability Monitor",
    idealFor: "Managers balancing field or shift crews",
    value: "Monitors live crew availability and flags coverage risks before they bite.",
    problem: "Coverage gaps stay hidden until work is already late or reassignment is forced.",
    trigger: "Run at shift start and after attendance or status changes.",
    inputFocus: "attendance, shift coverage, and job backlog",
    workflowFocus: "detect the upcoming availability risk and recommend the next adjustment",
    artifact: "crew coverage alert",
    automation: "Alert supervisors when coverage falls below plan.",
    kpi: "Coverage gap lead time",
  },
  {
    name: "SLA-aware Scheduler",
    idealFor: "Service teams operating under tiered SLAs",
    value: "Schedules work with SLA risk visible instead of buried in ticket data.",
    problem: "Teams overfocus on volume and miss which jobs actually carry SLA risk.",
    trigger: "Run during job assignment and schedule refresh windows.",
    inputFocus: "SLA tier, promised window, and queue backlog",
    workflowFocus: "surface jobs whose schedule path is likely to miss service obligations",
    artifact: "SLA risk schedule view",
    automation: "Escalate jobs likely to breach within the next scheduling window.",
    kpi: "SLA breach prevention rate",
  },
  {
    name: "Emergency Slot Finder",
    idealFor: "Teams inserting urgent jobs into full schedules",
    value: "Finds the least disruptive slot for emergency work.",
    problem: "Urgent jobs force hasty tradeoffs because teams lack a fast view of insertion options.",
    trigger: "Run whenever a critical-priority job enters the queue.",
    inputFocus: "critical work priority, open route time, and customer commitments",
    workflowFocus: "locate the best insertion path with the lowest downstream impact",
    artifact: "emergency insertion plan",
    automation: "Page dispatch review for critical insertion scenarios.",
    kpi: "Critical job response time",
  },
  {
    name: "Travel Buffer Estimator",
    idealFor: "Teams with route unpredictability",
    value: "Estimates where the schedule needs extra buffer before delays snowball.",
    problem: "Travel assumptions are too optimistic, creating brittle daily schedules.",
    trigger: "Run during planning and route refreshes.",
    inputFocus: "historical travel variance, route density, and weather or traffic signals",
    workflowFocus: "recommend realistic buffers and identify fragile schedule blocks",
    artifact: "buffer recommendation report",
    automation: "Update buffer guidance as route conditions shift.",
    kpi: "Schedule variance caused by travel assumptions",
  },
]);

const WORKFORCE_AND_CAPACITY = createCategorySkills("Workforce & Capacity", [
  {
    name: "Shift Coverage Planner",
    idealFor: "Leads responsible for weekly or daily shift fill",
    value: "Shows whether the current shift plan covers demand and where gaps remain.",
    problem: "Managers build schedules without a clear view of where demand will exceed staffing.",
    trigger: "Run when shifts are drafted or adjusted.",
    inputFocus: "forecast demand, rostered labor, and skill coverage",
    workflowFocus: "compare plan versus demand and identify the highest-risk gaps",
    artifact: "shift coverage plan",
    automation: "Alert planners when a new gap appears after a roster change.",
    kpi: "Uncovered shift hours",
  },
  {
    name: "Overtime Risk Detector",
    idealFor: "Teams trying to control labor overrun",
    value: "Flags where labor plans are likely to force overtime before the week is gone.",
    problem: "Overtime spikes are often discovered only after the work is already committed.",
    trigger: "Run daily on active labor schedules.",
    inputFocus: "planned hours, actual hours, and backlog pressure",
    workflowFocus: "identify likely overtime pockets and the actions that could reduce them",
    artifact: "overtime risk summary",
    automation: "Notify managers before overtime thresholds are exceeded.",
    kpi: "Avoidable overtime hours",
  },
  {
    name: "Absence Impact Simulator",
    idealFor: "Operations teams managing call-outs and unplanned absences",
    value: "Shows the operational impact of an absence and the best recovery choices.",
    problem: "One absence can create cascading coverage gaps without a clear response plan.",
    trigger: "Run when a call-out or unplanned absence is logged.",
    inputFocus: "role coverage, open workload, and backup availability",
    workflowFocus: "simulate the operational gap and rank the best substitute actions",
    artifact: "absence recovery scenario",
    automation: "Publish the top recovery option to the shift lead immediately.",
    kpi: "Service impact from unplanned absences",
  },
  {
    name: "Load Balancing Assistant",
    idealFor: "Supervisors balancing work across sites or teams",
    value: "Rebalances work across available teams before bottlenecks harden.",
    problem: "Some teams overload while others have slack because balancing happens too slowly.",
    trigger: "Run during planning cycles and when backlogs diverge sharply.",
    inputFocus: "team backlog, utilization, and skill compatibility",
    workflowFocus: "identify imbalance and propose workload transfers or sequencing changes",
    artifact: "load balancing recommendation",
    automation: "Flag overloaded teams as soon as the imbalance threshold is hit.",
    kpi: "Reduction in cross-team workload imbalance",
  },
  {
    name: "Seasonal Demand Forecaster",
    idealFor: "Teams with predictable seasonal peaks",
    value: "Forecasts when operating demand will spike so staffing can shift earlier.",
    problem: "Seasonal surges still surprise teams because the forecast is not tied to staffing action.",
    trigger: "Run weekly and before known seasonal periods.",
    inputFocus: "historical volume, seasonal patterns, and planned promotions or events",
    workflowFocus: "forecast volume swings and translate them into capacity guidance",
    artifact: "seasonal capacity outlook",
    automation: "Trigger staffing review when a spike window approaches.",
    kpi: "Forecasted versus actual demand variance",
  },
  {
    name: "Cross-training Opportunity Finder",
    idealFor: "Teams reducing single-point labor risk",
    value: "Identifies where cross-training would remove the biggest operational bottlenecks.",
    problem: "Operations remain fragile when critical tasks depend on too few people.",
    trigger: "Run monthly or when repeated coverage risks appear.",
    inputFocus: "skill coverage, exception history, and workload concentration",
    workflowFocus: "surface the roles and tasks where cross-training would reduce the most risk",
    artifact: "cross-training priority list",
    automation: "Prompt supervisors when a recurring single-point dependency persists.",
    kpi: "Critical tasks with backup coverage",
  },
  {
    name: "Backlog Burn Estimator",
    idealFor: "Managers deciding if teams can clear demand on time",
    value: "Estimates how fast teams can burn down backlog under the current staffing plan.",
    problem: "Backlog conversations lack a grounded view of whether the current team can actually catch up.",
    trigger: "Run during planning reviews and after large backlog changes.",
    inputFocus: "backlog age, average throughput, and available labor",
    workflowFocus: "project burn-down under current and adjusted staffing scenarios",
    artifact: "backlog burn projection",
    automation: "Alert leaders when burn-down falls outside target windows.",
    kpi: "Backlog age reduction rate",
  },
  {
    name: "Resource Utilization Coach",
    idealFor: "Managers optimizing labor and asset usage",
    value: "Shows where labor or asset utilization is too low or too high to be sustainable.",
    problem: "Utilization conversations are noisy because teams lack a simple operating view.",
    trigger: "Run daily and during weekly performance reviews.",
    inputFocus: "scheduled work, productive time, and idle or blocked periods",
    workflowFocus: "translate utilization patterns into concrete staffing or sequencing recommendations",
    artifact: "utilization coaching brief",
    automation: "Publish a coaching brief to managers before performance reviews.",
    kpi: "Utilization stability across teams",
  },
]);

const SOP_AND_COMPLIANCE = createCategorySkills("SOP & Compliance", [
  {
    name: "Checklist Completion Auditor",
    idealFor: "Teams enforcing daily or job-level checklists",
    value: "Audits checklist completion quality, not just whether boxes were clicked.",
    problem: "Checklist compliance looks healthy until someone reviews the missing evidence in detail.",
    trigger: "Run after checklist submission and at end-of-day review.",
    inputFocus: "step completion, evidence attachments, and required sign-offs",
    workflowFocus: "detect missing or low-quality evidence behind completed tasks",
    artifact: "checklist audit summary",
    automation: "Create a follow-up item when evidence is missing or weak.",
    kpi: "Checklist defects found before audit",
  },
  {
    name: "SOP Drift Detector",
    idealFor: "Leads trying to standardize execution",
    value: "Detects when teams are working around the standard process.",
    problem: "Teams quietly create process drift that increases risk and inconsistency over time.",
    trigger: "Run weekly across repeated workflows.",
    inputFocus: "process steps, completion timing, and exception notes",
    workflowFocus: "compare live behavior to the approved SOP and identify drift patterns",
    artifact: "SOP drift report",
    automation: "Escalate recurring drift patterns to process owners.",
    kpi: "Process drift incidents per workflow",
  },
  {
    name: "Audit Evidence Collector",
    idealFor: "Teams preparing for internal or external audits",
    value: "Collects and organizes the evidence needed to prove control execution.",
    problem: "Audit evidence is scattered, forcing painful manual collection every cycle.",
    trigger: "Run before audits and continuously on controlled processes.",
    inputFocus: "control checklist, evidence repositories, and task completions",
    workflowFocus: "map required controls to available evidence and flag missing items",
    artifact: "audit evidence packet",
    automation: "Request missing evidence from owners before the audit window starts.",
    kpi: "Time spent collecting audit evidence",
  },
  {
    name: "Training Compliance Tracker",
    idealFor: "Sites with recurring training requirements",
    value: "Tracks required training status and the operational risk of overdue completions.",
    problem: "Training gaps surface too late because completion status is not tied to operating risk.",
    trigger: "Run daily on training and certification records.",
    inputFocus: "training assignments, expiry dates, and role criticality",
    workflowFocus: "identify overdue or soon-expiring training that impacts active operations",
    artifact: "training compliance alert",
    automation: "Notify managers before certifications or training lapse.",
    kpi: "Overdue critical training count",
  },
  {
    name: "Corrective Action Tracker",
    idealFor: "Teams resolving audit or quality findings",
    value: "Tracks corrective actions through closure with visibility on blockers and risk.",
    problem: "Corrective actions stay open too long because owners and evidence trails are unclear.",
    trigger: "Run when a finding or corrective action is opened or updated.",
    inputFocus: "findings, owners, due dates, and evidence progress",
    workflowFocus: "monitor corrective action movement and surface overdue closure risk",
    artifact: "corrective action status brief",
    automation: "Escalate overdue actions with missing evidence.",
    kpi: "Corrective action closure time",
  },
  {
    name: "Permit Requirement Checker",
    idealFor: "Operations with permit or approval steps",
    value: "Checks whether all required permits or approvals are in place before work starts.",
    problem: "Work begins without all permits verified, creating avoidable compliance risk.",
    trigger: "Run before dispatch or task start on permit-sensitive jobs.",
    inputFocus: "job type, permit requirements, and approval records",
    workflowFocus: "compare required permits to the job record and identify missing prerequisites",
    artifact: "permit readiness check",
    automation: "Block start approval when required permits remain missing.",
    kpi: "Jobs started with full permit readiness",
  },
  {
    name: "Policy Acknowledgement Monitor",
    idealFor: "Distributed teams rolling out policy changes",
    value: "Tracks who has acknowledged required policy changes and where risk remains.",
    problem: "Policy change rollouts are hard to verify across large operating teams.",
    trigger: "Run after policy releases and reminder cycles.",
    inputFocus: "policy updates, employee acknowledgements, and role scope",
    workflowFocus: "map open acknowledgements to criticality and follow-up urgency",
    artifact: "policy acknowledgment tracker",
    automation: "Send reminder waves based on policy criticality and team status.",
    kpi: "Policy acknowledgment completion rate",
  },
  {
    name: "Incident Documentation Coach",
    idealFor: "Teams logging operational incidents consistently",
    value: "Improves the quality of incident documentation before records are closed.",
    problem: "Incident logs are incomplete, making audits and root-cause reviews harder than they need to be.",
    trigger: "Run when an incident record is saved or prepared for closure.",
    inputFocus: "incident notes, required fields, and evidence attachments",
    workflowFocus: "check the record for missing context, causes, actions, and supporting evidence",
    artifact: "incident documentation review",
    automation: "Prompt owners to finish missing incident details before closure.",
    kpi: "Incidents closed with complete documentation",
  },
]);

const SERVICE_DELIVERY_AND_QUALITY = createCategorySkills("Service Delivery & Quality", [
  {
    name: "Job Completion Reviewer",
    idealFor: "Teams verifying work quality at close-out",
    value: "Reviews completed jobs for quality, completeness, and follow-up risk.",
    problem: "Completed work is marked done before anyone checks whether it truly meets the standard.",
    trigger: "Run when jobs are closed or ready for manager review.",
    inputFocus: "completion notes, checklists, photos, and customer acknowledgements",
    workflowFocus: "identify missing completion evidence or quality gaps before closure",
    artifact: "job close-out review",
    automation: "Route questionable closes into manager review.",
    kpi: "Jobs reopened due to incomplete close-out",
  },
  {
    name: "Repeat Defect Detector",
    idealFor: "Teams fighting recurring quality issues",
    value: "Finds patterns in repeat defects so managers can intervene upstream.",
    problem: "Repeat issues hide inside job history until the same failure happens again and again.",
    trigger: "Run weekly across closed jobs and defect logs.",
    inputFocus: "defect reason codes, job history, and team or site patterns",
    workflowFocus: "group repeat defects by cause, team, and recurrence frequency",
    artifact: "repeat defect pattern report",
    automation: "Alert quality leads when a repeat-defect threshold is crossed.",
    kpi: "Reduction in repeat defects",
  },
  {
    name: "Customer Feedback Sorter",
    idealFor: "Operations teams processing post-service feedback",
    value: "Turns customer comments into categorized action items and improvement signals.",
    problem: "Feedback comes in, but the team cannot quickly tell what needs action versus trending observation.",
    trigger: "Run when new survey or feedback responses arrive.",
    inputFocus: "feedback text, satisfaction rating, and service context",
    workflowFocus: "classify comments into praise, defect, training issue, or process gap",
    artifact: "feedback action queue",
    automation: "Route urgent negative feedback into follow-up workflows.",
    kpi: "Time to follow up on negative feedback",
  },
  {
    name: "QA Sampling Assistant",
    idealFor: "Quality teams choosing which work to inspect",
    value: "Selects the highest-risk work for QA review instead of random sampling alone.",
    problem: "Manual QA sampling misses the work most likely to contain defects.",
    trigger: "Run on a daily or weekly QA cadence.",
    inputFocus: "completion risk signals, team history, and issue rates",
    workflowFocus: "rank work items by inspection value and explain why they were chosen",
    artifact: "QA sample list",
    automation: "Generate the next QA sample batch before review sessions.",
    kpi: "Defects found per QA review hour",
  },
  {
    name: "Service Recovery Planner",
    idealFor: "Teams repairing failed customer experiences",
    value: "Builds a recovery plan when service delivery has already gone wrong.",
    problem: "Recovery efforts are inconsistent because teams lack a shared way to assess service failure severity.",
    trigger: "Run when a severe complaint, rework, or missed commitment is logged.",
    inputFocus: "service failure details, customer history, and promised SLA",
    workflowFocus: "recommend the right recovery path, owner, and urgency level",
    artifact: "service recovery plan",
    automation: "Escalate severe recovery scenarios to the appropriate manager tier.",
    kpi: "Recovery time after major service failure",
  },
  {
    name: "Process Bottleneck Finder",
    idealFor: "Leads improving throughput",
    value: "Finds the process step where work is piling up or slowing down disproportionately.",
    problem: "Teams know throughput is slipping but not which process handoff is causing it.",
    trigger: "Run weekly on high-volume workflows.",
    inputFocus: "step durations, handoff timestamps, and queue length",
    workflowFocus: "compare expected versus actual flow and isolate the biggest choke points",
    artifact: "bottleneck analysis",
    automation: "Flag major bottlenecks as soon as they sustain beyond threshold.",
    kpi: "Cycle time improvement after bottleneck intervention",
  },
  {
    name: "Handoff Readiness Checker",
    idealFor: "Multi-step operations with team handoffs",
    value: "Checks whether work is actually ready before it moves to the next team.",
    problem: "Downstream teams receive incomplete work and lose time clarifying missing information.",
    trigger: "Run whenever work is handed off to the next team or stage.",
    inputFocus: "handoff checklist, attachments, and downstream requirements",
    workflowFocus: "verify readiness against the receiving team's required inputs",
    artifact: "handoff readiness assessment",
    automation: "Block incomplete handoffs and notify the sender immediately.",
    kpi: "Rejected or bounced handoffs",
  },
  {
    name: "Continuous Improvement Backlog Builder",
    idealFor: "Teams collecting too many improvement ideas without prioritization",
    value: "Turns recurring operational pain into a ranked improvement backlog.",
    problem: "Operational improvements stay ad hoc because issues are not aggregated into a usable backlog.",
    trigger: "Run monthly and after major incident or defect reviews.",
    inputFocus: "defect patterns, delay causes, feedback themes, and manager notes",
    workflowFocus: "group recurring issues and rank them by impact and frequency",
    artifact: "continuous improvement backlog",
    automation: "Refresh the backlog after new quality or efficiency patterns emerge.",
    kpi: "Improvement items addressed per quarter",
  },
]);

const EXCEPTIONS_AND_ESCALATIONS = createCategorySkills("Exceptions & Escalations", [
  {
    name: "Incident Triage Router",
    idealFor: "Teams managing a mixed exception queue",
    value: "Routes incidents to the right owner and severity lane immediately.",
    problem: "Exception queues clog because triage is inconsistent and slow.",
    trigger: "Run when a new operational incident or blocker is reported.",
    inputFocus: "incident type, severity clues, and ownership rules",
    workflowFocus: "classify the issue and send it to the right resolution path",
    artifact: "triaged incident queue",
    automation: "Assign high-confidence triage decisions the moment issues land.",
    kpi: "Time to first owner assignment",
  },
  {
    name: "SLA Breach Predictor",
    idealFor: "Teams with strict response or resolution windows",
    value: "Warns before open issues cross their SLA threshold.",
    problem: "SLA breaches are often noticed too late because teams look at age, not actual risk.",
    trigger: "Run continuously on active incidents and requests.",
    inputFocus: "age, severity, queue state, and pending dependencies",
    workflowFocus: "estimate breach risk from current queue and owner conditions",
    artifact: "breach risk alert",
    automation: "Escalate the owner and manager before likely breach.",
    kpi: "Breaches prevented before deadline",
  },
  {
    name: "Escalation Summary Writer",
    idealFor: "Managers escalating issues upward or cross-functionally",
    value: "Creates a concise escalation summary with what happened, what is blocked, and what is needed.",
    problem: "Escalations are delayed because context has to be rebuilt before leaders can act.",
    trigger: "Run when an issue moves into escalation or executive attention.",
    inputFocus: "incident notes, owners, impact, and attempted actions",
    workflowFocus: "compress the issue into a decision-ready escalation brief",
    artifact: "escalation summary",
    automation: "Prepare an escalation draft the moment severity changes.",
    kpi: "Escalation preparation time",
  },
  {
    name: "Root Cause Pattern Miner",
    idealFor: "Teams moving from firefighting to prevention",
    value: "Finds root-cause patterns across incidents and escalations.",
    problem: "Teams solve each issue locally without seeing the broader pattern behind recurring failures.",
    trigger: "Run weekly or after a cluster of incidents is closed.",
    inputFocus: "incident causes, blockers, and recurrence history",
    workflowFocus: "group similar root causes and tie them to systems or processes",
    artifact: "root cause pattern report",
    automation: "Feed recurring patterns into the improvement backlog automatically.",
    kpi: "Repeat escalations from the same root cause",
  },
  {
    name: "Critical Incident Communicator",
    idealFor: "Teams managing urgent customer or internal incidents",
    value: "Generates status updates that keep stakeholders informed without recreating the story each time.",
    problem: "Incident updates consume time because every new message has to be rebuilt from scattered notes.",
    trigger: "Run on each critical incident update cycle.",
    inputFocus: "current status, impact, mitigation steps, and ETA confidence",
    workflowFocus: "turn live incident notes into a consistent stakeholder update",
    artifact: "incident status update",
    automation: "Draft the next update at each reporting interval.",
    kpi: "Time spent producing incident updates",
  },
  {
    name: "Blocker Dependency Tracker",
    idealFor: "Teams resolving issues that need cross-team action",
    value: "Tracks which blocker depends on which team and where progress is stuck.",
    problem: "Exceptions linger because dependencies are invisible once several teams are involved.",
    trigger: "Run when incidents or operational blockers need external input.",
    inputFocus: "blocked tasks, dependency owners, and promised response dates",
    workflowFocus: "map dependencies and highlight the blocker most likely to stall resolution",
    artifact: "dependency tracker",
    automation: "Remind dependent owners before committed dates slip.",
    kpi: "Dependency-driven delay time",
  },
  {
    name: "Escalation Queue Prioritizer",
    idealFor: "Managers with more escalations than immediate capacity",
    value: "Ranks escalations by business impact and urgency so the right ones move first.",
    problem: "Escalation handling turns reactive when everything is treated as equally urgent.",
    trigger: "Run whenever the escalation queue changes.",
    inputFocus: "severity, customer impact, operational risk, and SLA exposure",
    workflowFocus: "prioritize the queue and identify what should move first",
    artifact: "escalation priority board",
    automation: "Refresh queue ranking when impact or status shifts.",
    kpi: "High-impact escalations resolved within target",
  },
  {
    name: "Recovery Task Orchestrator",
    idealFor: "Teams coordinating multiple actions after a failure",
    value: "Turns a messy recovery effort into a trackable action plan.",
    problem: "Recovery tasks spread across chat and tickets, making accountability weak.",
    trigger: "Run when a significant exception requires multi-owner recovery work.",
    inputFocus: "recovery steps, owners, due dates, and blocked tasks",
    workflowFocus: "sequence the recovery work and surface the next unresolved dependency",
    artifact: "recovery action plan",
    automation: "Track overdue recovery tasks and escalate blockers automatically.",
    kpi: "Recovery completion time",
  },
]);

const OPERATIONS_SKILL_BASES = [
  ...SCHEDULING_AND_DISPATCH,
  ...WORKFORCE_AND_CAPACITY,
  ...SOP_AND_COMPLIANCE,
  ...SERVICE_DELIVERY_AND_QUALITY,
  ...EXCEPTIONS_AND_ESCALATIONS,
] as const satisfies ReadonlyArray<OperationsSkillBase>;

function buildOperationsSkill(
  skill: OperationsSkillBase,
  id: number,
): FunctionSkillIdea<OperationsSkillCategory> {
  const template = CATEGORY_TEMPLATES[skill.category];

  return {
    id,
    slug: createSlug(skill.name),
    name: skill.name,
    category: skill.category,
    stage: template.stage,
    idealFor: skill.idealFor,
    value: skill.value,
    spec: {
      problem: skill.problem,
      trigger: skill.trigger,
      primaryUsers: template.primaryUsers,
      inputs: unique([...template.inputs, skill.inputFocus]),
      workflow: unique([
        ...template.workflow,
        skill.workflowFocus,
        `Convert the recommendation into a ${skill.artifact}.`,
      ]),
      outputs: unique([...template.outputs, skill.artifact]),
      integrations: unique(
        skill.integration ? [...template.integrations, skill.integration] : template.integrations,
      ),
      automations: unique([...template.automations, skill.automation]),
      kpis: unique([...template.kpis, skill.kpi]),
      guardrails: unique(
        skill.guardrail ? [...template.guardrails, skill.guardrail] : template.guardrails,
      ),
      complexity: skill.complexity ?? template.complexity,
      estimatedBuildWeeks: skill.estimatedBuildWeeks ?? template.estimatedBuildWeeks,
      rolloutMotion: template.rolloutMotion,
    },
  };
}

export const OPERATIONS_SKILL_CATALOG: ReadonlyArray<FunctionSkillIdea<OperationsSkillCategory>> =
  OPERATIONS_SKILL_BASES.map((skill, index) => buildOperationsSkill(skill, index + 1));

export const OPERATIONS_SKILL_CATEGORIES: ReadonlyArray<OperationsSkillCategory> = Array.from(
  new Set(OPERATIONS_SKILL_CATALOG.map((skill) => skill.category)),
).toSorted((left, right) => left.localeCompare(right));

export const OPERATIONS_SKILL_TOTAL = OPERATIONS_SKILL_CATALOG.length;
