import {
  createSlug,
  type FunctionSkillComplexity,
  type FunctionSkillIdea,
  unique,
} from "./functionSkillTypes";

export type AccountingFinanceSkillCategory =
  | "Receivables & Billing"
  | "Payables & Approvals"
  | "Close & Reconciliation"
  | "Cash, Treasury & Controls"
  | "FP&A & Reporting";

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

interface AccountingFinanceSkillSeed {
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

interface AccountingFinanceSkillBase extends AccountingFinanceSkillSeed {
  readonly category: AccountingFinanceSkillCategory;
}

const CATEGORY_TEMPLATES: Record<AccountingFinanceSkillCategory, CategoryTemplate> = {
  "Receivables & Billing": {
    stage: "Revenue collection",
    primaryUsers: ["Controller", "AR specialist", "Billing manager"],
    inputs: ["Invoice records", "Payment status", "Customer account data"],
    workflow: [
      "Review invoice state, aging, and payment behavior",
      "Detect collection risks, disputes, or billing errors",
      "Recommend the next billing or follow-up action",
    ],
    outputs: ["AR follow-up plan", "billing exception summary", "collection queue"],
    integrations: ["QuickBooks", "NetSuite", "Stripe", "ERP"],
    automations: ["Past-due reminders", "Billing exception alerts"],
    kpis: ["Days sales outstanding", "Collection rate", "Billing cycle time"],
    guardrails: [
      "Require invoice and payment evidence before changing billing status",
      "Escalate disputed charges rather than auto-resolving them",
    ],
    complexity: "medium",
    estimatedBuildWeeks: 5,
    rolloutMotion:
      "Pilot with one receivables team and compare collection throughput plus dispute visibility.",
  },
  "Payables & Approvals": {
    stage: "Spend control",
    primaryUsers: ["AP manager", "Finance ops", "Approver"],
    inputs: ["Bills and invoices", "Approval policies", "Vendor master data"],
    workflow: [
      "Validate incoming spend requests and invoice records",
      "Check policy fit, coding, and approval routing requirements",
      "Package the next AP or approval action",
    ],
    outputs: ["approval packet", "AP exception queue", "payment readiness summary"],
    integrations: ["ERP", "AP platform", "Email", "Document storage"],
    automations: ["Approval reminders", "Coding exception alerts"],
    kpis: ["Invoice approval time", "Late payment rate", "Manual AP touch time"],
    guardrails: [
      "Do not release payments without confirmed approval state",
      "Preserve approval and coding trails for every recommendation",
    ],
    complexity: "medium",
    estimatedBuildWeeks: 5,
    rolloutMotion:
      "Start with one approval path and one AP lane, then expand after routing accuracy is trusted.",
  },
  "Close & Reconciliation": {
    stage: "Month-end and control",
    primaryUsers: ["Controller", "Senior accountant", "Close manager"],
    inputs: ["Ledger entries", "Bank data", "Subledger balances"],
    workflow: [
      "Compare balances, tasks, and reconciliation status",
      "Identify missing close tasks, mismatches, or unresolved recon items",
      "Recommend the next close or reconciliation action",
    ],
    outputs: ["close status brief", "reconciliation exception list", "task backlog"],
    integrations: ["ERP", "Bank feeds", "Spreadsheet workbooks", "Close tracker"],
    automations: ["Close deadline reminders", "Reconciliation mismatch alerts"],
    kpis: ["Days to close", "Outstanding recon items", "Manual reconciliation time"],
    guardrails: [
      "Require source evidence for reconciliation conclusions",
      "Do not mark close tasks complete without matching support",
    ],
    complexity: "high",
    estimatedBuildWeeks: 6,
    rolloutMotion:
      "Pilot on one close cycle and refine the exception logic against controller review.",
  },
  "Cash, Treasury & Controls": {
    stage: "Liquidity and control",
    primaryUsers: ["Treasury lead", "Controller", "Finance manager"],
    inputs: ["Cash balances", "Payment schedules", "Control logs"],
    workflow: [
      "Monitor cash position, payment obligations, and control status",
      "Detect liquidity pressure, unusual movement, or control gaps",
      "Prepare the next review or escalation packet",
    ],
    outputs: ["cash position summary", "control risk alert", "treasury action brief"],
    integrations: ["Bank feeds", "ERP", "Treasury workbook", "Payment platform"],
    automations: ["Cash threshold alerts", "Control reminder workflows"],
    kpis: ["Cash visibility freshness", "Control completion rate", "Unexpected outflow detection"],
    guardrails: [
      "Flag anomalies for review instead of treating them as confirmed fraud or error",
      "Keep treasury recommendations attributable to source transactions",
    ],
    complexity: "high",
    estimatedBuildWeeks: 6,
    rolloutMotion:
      "Pilot with finance leadership on one weekly cash cadence and one control pack.",
  },
  "FP&A & Reporting": {
    stage: "Planning and reporting",
    primaryUsers: ["FP&A manager", "Finance analyst", "Business ops lead"],
    inputs: ["Budget plan", "Actuals", "Operational driver data"],
    workflow: [
      "Compare actuals to plan and examine business drivers",
      "Identify meaningful variance and forecast risk",
      "Package a clear narrative and next action for leadership",
    ],
    outputs: ["variance brief", "forecast update", "exec reporting pack"],
    integrations: ["ERP", "BI dashboards", "Spreadsheet model", "Planning docs"],
    automations: ["Variance summary generation", "Forecast refresh alerts"],
    kpis: ["Forecast accuracy", "Reporting turnaround time", "Variance review cycle time"],
    guardrails: [
      "Separate confirmed actuals from forecast assumptions",
      "Require stated assumptions for all forecast or scenario outputs",
    ],
    complexity: "medium",
    estimatedBuildWeeks: 5,
    rolloutMotion:
      "Pilot inside one monthly reporting cycle and validate that review prep gets materially faster.",
  },
};

function createCategorySkills(
  category: AccountingFinanceSkillCategory,
  skills: ReadonlyArray<AccountingFinanceSkillSeed>,
): ReadonlyArray<AccountingFinanceSkillBase> {
  return skills.map((skill) => ({ ...skill, category }));
}

const RECEIVABLES_AND_BILLING = createCategorySkills("Receivables & Billing", [
  {
    name: "Invoice Aging Prioritizer",
    idealFor: "AR teams sorting large aging reports",
    value: "Ranks overdue invoices by collection urgency and likely resolution path.",
    problem: "AR teams spend too much time scanning aging reports without a clear next-action order.",
    trigger: "Run daily on open invoice aging data.",
    inputFocus: "aging bucket, customer history, and dispute signals",
    workflowFocus: "prioritize invoices by collection urgency and likely recoverability",
    artifact: "prioritized aging queue",
    automation: "Refresh the queue every morning before collection work starts.",
    kpi: "Past-due invoice recovery rate",
  },
  {
    name: "Collections Follow-up Writer",
    idealFor: "Teams chasing past-due receivables consistently",
    value: "Drafts the right collection follow-up based on account history and invoice state.",
    problem: "Collection outreach is inconsistent and often disconnected from account context.",
    trigger: "Run when invoices cross a follow-up threshold or stall after prior contact.",
    inputFocus: "invoice status, prior follow-up, and customer payment history",
    workflowFocus: "select the correct collection tone and next step by account risk",
    artifact: "collection outreach draft",
    automation: "Prepare outreach drafts before the AR workday begins.",
    kpi: "Collections touches completed per rep-hour",
  },
  {
    name: "Dispute Case Summarizer",
    idealFor: "Billing teams handling invoice disputes",
    value: "Packages billing disputes into a clean case file with the evidence finance needs.",
    problem: "Disputes take too long because teams rebuild context from invoice records and email threads.",
    trigger: "Run when a payment dispute or short pay is logged.",
    inputFocus: "invoice line items, email thread, and payment variance",
    workflowFocus: "summarize the dispute, evidence, and likely owner path",
    artifact: "billing dispute brief",
    automation: "Route the dispute packet to billing or account owners automatically.",
    kpi: "Dispute resolution cycle time",
  },
  {
    name: "Billing Error Detector",
    idealFor: "Teams reducing invoice rework",
    value: "Finds likely billing mistakes before customers escalate them.",
    problem: "Billing errors are often found by customers instead of upstream finance review.",
    trigger: "Run before invoices are sent or during daily invoice audits.",
    inputFocus: "invoice lines, pricing rules, and contract references",
    workflowFocus: "compare invoice content to expected pricing and billing rules",
    artifact: "billing exception report",
    automation: "Hold suspected billing errors for review before send.",
    kpi: "Invoice error rate before customer send",
  },
  {
    name: "Credit Hold Review Assistant",
    idealFor: "Finance teams managing customer credit risk",
    value: "Packages the context behind credit hold decisions and release requests.",
    problem: "Credit hold decisions become inconsistent when account, aging, and payment context are not summarized well.",
    trigger: "Run when a customer enters or requests release from credit hold.",
    inputFocus: "aging exposure, payment behavior, and open order context",
    workflowFocus: "summarize the risk and recommend the review path",
    artifact: "credit hold review packet",
    automation: "Alert approvers when a release request needs decision.",
    kpi: "Credit hold decision turnaround time",
  },
  {
    name: "Cash Application Matcher",
    idealFor: "Teams applying incoming payments",
    value: "Suggests the most likely invoice matches for unapplied cash.",
    problem: "Unapplied cash lingers because finance has to manually chase matching context.",
    trigger: "Run when unapplied cash or payment mismatches appear.",
    inputFocus: "payment remittance, invoice balances, and customer history",
    workflowFocus: "rank the most likely invoice matches and explain confidence",
    artifact: "cash application recommendation",
    automation: "Queue high-confidence matches for review immediately.",
    kpi: "Unapplied cash backlog",
    guardrail: "Treat suggested matches as review candidates, not automatic postings.",
  },
  {
    name: "Customer Promise-to-Pay Tracker",
    idealFor: "AR teams monitoring customer payment commitments",
    value: "Tracks promise-to-pay commitments and flags accounts likely to miss them.",
    problem: "Payment promises disappear into notes and are not actively managed.",
    trigger: "Run when collectors log new payment promises or due dates pass.",
    inputFocus: "promise dates, commitment amount, and prior behavior",
    workflowFocus: "monitor promise fulfillment risk and recommend the next touch",
    artifact: "promise-to-pay tracker",
    automation: "Trigger reminders before or after promise dates are missed.",
    kpi: "Promise-to-pay kept rate",
  },
  {
    name: "Revenue Leakage Finder",
    idealFor: "Teams tightening billing completeness",
    value: "Surfaces missed billing events and leakage patterns before they compound.",
    problem: "Revenue leaks stay hidden when billable events do not reconcile to invoices cleanly.",
    trigger: "Run weekly on billable events versus invoiced amounts.",
    inputFocus: "billable events, invoiced lines, and contract rules",
    workflowFocus: "compare billable activity to actual invoices and isolate leaks",
    artifact: "revenue leakage report",
    automation: "Escalate unresolved leakage patterns to billing owners.",
    kpi: "Recovered revenue from identified leakage",
  },
]);

const PAYABLES_AND_APPROVALS = createCategorySkills("Payables & Approvals", [
  {
    name: "Invoice Coding Assistant",
    idealFor: "AP teams coding high invoice volume",
    value: "Suggests the right coding path and catches records that need human review.",
    problem: "Invoice coding is slow and inconsistent when reviewers rebuild context from scratch.",
    trigger: "Run when AP invoices enter review.",
    inputFocus: "vendor history, PO data, and coding policies",
    workflowFocus: "recommend coding and flag mismatches or missing context",
    artifact: "coding recommendation",
    automation: "Pre-fill suggested coding for standard invoices.",
    kpi: "AP coding touch time",
  },
  {
    name: "Approval Routing Verifier",
    idealFor: "Finance teams enforcing spend approval policy",
    value: "Checks whether each invoice or request is moving through the correct approval path.",
    problem: "Approval routing fails when request type, amount, and owner are not interpreted consistently.",
    trigger: "Run when new spend requests or invoices enter the workflow.",
    inputFocus: "approval matrix, amount, department, and vendor type",
    workflowFocus: "compare current routing to required approval policy",
    artifact: "approval routing check",
    automation: "Re-route requests with clear policy mismatches.",
    kpi: "Approval routing accuracy",
  },
  {
    name: "Duplicate Invoice Checker",
    idealFor: "AP teams reducing duplicate payments",
    value: "Flags likely duplicate invoices before they move to payment.",
    problem: "Duplicate invoices slip through because near-match detection is tedious and inconsistent.",
    trigger: "Run when invoices are imported or prepared for payment.",
    inputFocus: "invoice number, vendor, amount, and timing patterns",
    workflowFocus: "identify likely duplicate submissions and rank by confidence",
    artifact: "duplicate invoice alert",
    automation: "Hold high-confidence duplicates for AP review.",
    kpi: "Duplicate payment prevention rate",
  },
  {
    name: "Vendor Setup Validator",
    idealFor: "Teams onboarding vendors safely",
    value: "Validates vendor setup packets for missing fields, approvals, and risk clues.",
    problem: "Vendor setup delays and control issues happen when intake packets are incomplete.",
    trigger: "Run when a new vendor request or change request is submitted.",
    inputFocus: "vendor master fields, tax docs, banking info, and approvals",
    workflowFocus: "check completeness and risk before setup proceeds",
    artifact: "vendor setup review",
    automation: "Request missing documentation before AP processing starts.",
    kpi: "Vendor setup turnaround time",
  },
  {
    name: "Spend Policy Exception Finder",
    idealFor: "Finance ops reviewing non-standard spend",
    value: "Packages spend requests that fall outside policy into a decision-ready review packet.",
    problem: "Policy exceptions are hard to review because finance receives them without enough context.",
    trigger: "Run when invoices or requests exceed policy thresholds or unsupported categories.",
    inputFocus: "policy limits, request details, and prior exception patterns",
    workflowFocus: "identify why the request is outside policy and who must decide",
    artifact: "spend exception brief",
    automation: "Escalate material policy exceptions immediately.",
    kpi: "Policy exception review time",
  },
  {
    name: "Payment Run Readiness Checker",
    idealFor: "Teams preparing weekly payment runs",
    value: "Checks whether invoices are truly ready before payment batch creation.",
    problem: "Payment runs get delayed by last-minute missing approvals or coding gaps.",
    trigger: "Run before scheduled payment runs.",
    inputFocus: "approval status, coding completeness, and hold flags",
    workflowFocus: "verify readiness and isolate blockers before the batch is built",
    artifact: "payment run readiness list",
    automation: "Alert AP on invoices that threaten the payment run cutoff.",
    kpi: "Invoices held back from payment due to preventable issues",
  },
  {
    name: "PO Match Reviewer",
    idealFor: "AP teams working PO-backed invoices",
    value: "Summarizes 2-way and 3-way match issues so they resolve faster.",
    problem: "PO matching exceptions take too long because mismatch context is scattered across documents.",
    trigger: "Run when PO-backed invoices fail match checks.",
    inputFocus: "PO, receipt, invoice, and variance details",
    workflowFocus: "explain the mismatch and recommend the owner path for resolution",
    artifact: "PO match exception brief",
    automation: "Route each mismatch to the right buyer or receiving owner.",
    kpi: "PO match exception resolution time",
  },
  {
    name: "Vendor Statement Reconciler",
    idealFor: "AP teams reconciling vendor statements monthly",
    value: "Highlights mismatches between vendor statements and internal AP records.",
    problem: "Statement reconciliations are manual and easy to overlook until close pressure hits.",
    trigger: "Run when vendor statements are received.",
    inputFocus: "vendor statement lines, open AP, and payment history",
    workflowFocus: "compare statement balances to internal records and flag mismatches",
    artifact: "vendor statement reconciliation summary",
    automation: "Create follow-up tasks for unresolved statement mismatches.",
    kpi: "Vendor statement mismatches cleared before close",
  },
]);

const CLOSE_AND_RECONCILIATION = createCategorySkills("Close & Reconciliation", [
  {
    name: "Month-end Close Tracker",
    idealFor: "Controllers coordinating close status",
    value: "Keeps close tasks, owners, and blockers in one readable operating view.",
    problem: "Close status meetings waste time because no one has a trusted real-time view of task progress.",
    trigger: "Run daily during active close windows.",
    inputFocus: "task status, owners, due dates, and blocker notes",
    workflowFocus: "summarize close progress and highlight critical blockers",
    artifact: "close status dashboard",
    automation: "Push blocker alerts before key close deadlines are missed.",
    kpi: "Days to close",
  },
  {
    name: "Reconciliation Break Detector",
    idealFor: "Teams working account reconciliations",
    value: "Finds reconciliation breaks and packages the evidence needed to resolve them.",
    problem: "Reconciling balance differences is slow because source mismatches are not grouped clearly.",
    trigger: "Run when account reconciliations are refreshed.",
    inputFocus: "ledger balances, subledger detail, and source transaction data",
    workflowFocus: "identify material breaks and recommend the next investigation path",
    artifact: "reconciliation break report",
    automation: "Notify owners when new material breaks appear.",
    kpi: "Open reconciliation breaks at close",
  },
  {
    name: "Journal Entry Review Assistant",
    idealFor: "Finance teams reviewing manual journals",
    value: "Summarizes manual journals that deserve closer review before posting.",
    problem: "Manual journal review is hard to prioritize when every entry looks similar on the surface.",
    trigger: "Run before journal posting cutoffs or review batches.",
    inputFocus: "journal lines, preparer, amount, and supporting context",
    workflowFocus: "identify journals with unusual patterns or missing support",
    artifact: "journal review queue",
    automation: "Route higher-risk manual journals for extra approval.",
    kpi: "Journal review cycle time",
  },
  {
    name: "Balance Sheet Flux Analyzer",
    idealFor: "Controllers reviewing unusual month-over-month movement",
    value: "Highlights meaningful balance sheet flux and likely reasons behind it.",
    problem: "Flux analysis is slow because accountants manually inspect too many accounts without prioritization.",
    trigger: "Run after trial balance refreshes during close.",
    inputFocus: "current and prior balances, entries, and account thresholds",
    workflowFocus: "rank significant flux and summarize likely drivers",
    artifact: "balance sheet flux brief",
    automation: "Flag unusual movement above account-specific thresholds.",
    kpi: "Time spent preparing flux analysis",
  },
  {
    name: "Accrual Reminder Assistant",
    idealFor: "Teams collecting monthly accrual inputs",
    value: "Keeps accrual collection on schedule and visible before close pressure peaks.",
    problem: "Accrual inputs arrive late because owners are reminded too late or without context.",
    trigger: "Run during pre-close and close windows.",
    inputFocus: "accrual calendar, owner list, and prior submissions",
    workflowFocus: "identify missing accrual inputs and prioritize follow-up",
    artifact: "accrual collection tracker",
    automation: "Send reminder waves before the accrual cutoff date.",
    kpi: "Accrual submissions received by cutoff",
  },
  {
    name: "Intercompany Reconciliation Coach",
    idealFor: "Multi-entity finance teams",
    value: "Surfaces intercompany mismatches and suggests where the break likely lives.",
    problem: "Intercompany reconciliation drags because entity mismatches are hard to isolate quickly.",
    trigger: "Run when intercompany balances are refreshed.",
    inputFocus: "entity balances, counterpart detail, and posting dates",
    workflowFocus: "compare both sides of intercompany activity and isolate breaks",
    artifact: "intercompany mismatch summary",
    automation: "Alert entity owners when unresolved mismatches persist toward close.",
    kpi: "Intercompany differences unresolved at close",
  },
  {
    name: "Close Blocker Escalator",
    idealFor: "Controllers managing escalating close risk",
    value: "Turns close blockers into escalation-ready packets with owner, impact, and next step.",
    problem: "Close blockers do not get escalated fast enough because their impact is not summarized clearly.",
    trigger: "Run when close tasks move behind plan or depend on unresolved issues.",
    inputFocus: "task slippage, blocker notes, and reporting deadlines",
    workflowFocus: "prioritize blockers by impact and summarize the escalation ask",
    artifact: "close blocker escalation brief",
    automation: "Escalate material blockers ahead of reporting deadlines.",
    kpi: "Blockers resolved before close cutoff",
  },
  {
    name: "Support Document Completeness Checker",
    idealFor: "Teams ensuring journals and reconciliations are audit-ready",
    value: "Checks whether required support is actually attached before close items are completed.",
    problem: "Close tasks look finished until reviewers discover missing support behind them.",
    trigger: "Run when tasks are marked ready for review or complete.",
    inputFocus: "close task, attached support, and documentation requirements",
    workflowFocus: "verify that required support exists and is tied to the correct task",
    artifact: "support completeness review",
    automation: "Prevent premature close-off on items missing support.",
    kpi: "Close items completed with full supporting evidence",
  },
]);

const CASH_TREASURY_AND_CONTROLS = createCategorySkills("Cash, Treasury & Controls", [
  {
    name: "Cash Position Summarizer",
    idealFor: "Finance leaders reviewing liquidity daily or weekly",
    value: "Packages current cash position, near-term obligations, and risk signals into one briefing.",
    problem: "Cash reviews require stitching together several sources before leadership can see the true position.",
    trigger: "Run on each cash review cadence.",
    inputFocus: "bank balances, expected inflows, and upcoming outflows",
    workflowFocus: "summarize current liquidity and the most relevant short-term risks",
    artifact: "cash position brief",
    automation: "Generate a fresh briefing before each treasury review.",
    kpi: "Cash review preparation time",
  },
  {
    name: "Payment Anomaly Watcher",
    idealFor: "Teams monitoring for unusual payment activity",
    value: "Flags unusual payment movement that deserves treasury or control review.",
    problem: "Unexpected payment movement is easy to miss when transaction reviews are manual and fragmented.",
    trigger: "Run when payment files, bank activity, or batches update.",
    inputFocus: "payment amount, timing, bank account, and history patterns",
    workflowFocus: "identify unusual payments and explain why they stand out",
    artifact: "payment anomaly alert",
    automation: "Escalate anomalous movement into treasury review immediately.",
    kpi: "Time to review unusual payment activity",
    guardrail: "Present anomalies as review candidates rather than confirmed fraud.",
  },
  {
    name: "Control Evidence Packager",
    idealFor: "Finance teams proving control execution",
    value: "Packages the evidence behind key controls for internal review and audits.",
    problem: "Control evidence is difficult to gather quickly once reviews begin.",
    trigger: "Run on control review cadence and before audit requests.",
    inputFocus: "control list, evidence artifacts, and owner attestations",
    workflowFocus: "match controls to evidence and identify missing or stale support",
    artifact: "control evidence pack",
    automation: "Remind owners when control support is missing or out of date.",
    kpi: "Control evidence readiness",
  },
  {
    name: "Bank Fee Analyzer",
    idealFor: "Finance teams monitoring cash service costs",
    value: "Finds recurring bank fee patterns and highlights unusual cost growth.",
    problem: "Bank fees drift upward because they are reviewed too infrequently and without pattern analysis.",
    trigger: "Run monthly after bank statements are loaded.",
    inputFocus: "bank statements, fee categories, and prior period comparisons",
    workflowFocus: "summarize fee movement and isolate unusual changes",
    artifact: "bank fee analysis",
    automation: "Alert treasury when fee categories move outside thresholds.",
    kpi: "Unexpected bank fee variance",
  },
  {
    name: "Covenant Watchlist Builder",
    idealFor: "Teams monitoring debt or liquidity covenants",
    value: "Tracks covenant-related metrics and warns when headroom tightens.",
    problem: "Covenant monitoring becomes stressful when finance lacks an early warning view.",
    trigger: "Run on each reporting cycle or after major balance changes.",
    inputFocus: "covenant terms, current metrics, and forecast scenarios",
    workflowFocus: "compare current and projected performance to covenant thresholds",
    artifact: "covenant watchlist",
    automation: "Notify finance leaders when covenant headroom compresses materially.",
    kpi: "Lead time before covenant risk breaches",
  },
  {
    name: "Treasury Calendar Coordinator",
    idealFor: "Teams managing recurring treasury obligations",
    value: "Keeps treasury deadlines, bank actions, and control tasks visible in one calendar view.",
    problem: "Treasury deadlines slip when obligations live in separate trackers and inboxes.",
    trigger: "Run daily on treasury calendars and scheduled payment events.",
    inputFocus: "cash review cadence, bank actions, and recurring treasury tasks",
    workflowFocus: "organize upcoming treasury work and identify conflicts or late items",
    artifact: "treasury task calendar",
    automation: "Send reminders before critical treasury deadlines.",
    kpi: "Treasury tasks completed on time",
  },
  {
    name: "Segregation-of-Duties Checker",
    idealFor: "Finance teams enforcing control discipline",
    value: "Flags finance workflow steps where approvals and actions violate duty separation rules.",
    problem: "SoD risk is difficult to see unless someone compares workflow behavior to policy carefully.",
    trigger: "Run on payment, journal, or vendor setup workflows.",
    inputFocus: "user actions, approval chain, and control matrix",
    workflowFocus: "compare actual workflow actors to segregation-of-duties policy",
    artifact: "SoD exception report",
    automation: "Escalate high-risk SoD exceptions to control owners.",
    kpi: "Open SoD exceptions",
  },
  {
    name: "Liquidity Scenario Builder",
    idealFor: "Finance leaders planning near-term cash scenarios",
    value: "Builds quick liquidity scenarios from likely inflow and outflow changes.",
    problem: "Cash scenario planning is slow when each model has to be rebuilt manually.",
    trigger: "Run during weekly finance reviews or when conditions change materially.",
    inputFocus: "cash baseline, large inflows or outflows, and timing assumptions",
    workflowFocus: "compare scenario paths and package the likely liquidity effect",
    artifact: "liquidity scenario model",
    automation: "Refresh scenarios after major expected cash events change.",
    kpi: "Finance scenario turnaround time",
  },
]);

const FPANDA_AND_REPORTING = createCategorySkills("FP&A & Reporting", [
  {
    name: "Variance Narrative Builder",
    idealFor: "Finance teams preparing monthly reviews",
    value: "Turns raw variance into a clear business narrative with likely drivers and actions.",
    problem: "Variance reviews take too long because teams explain numbers from scratch every cycle.",
    trigger: "Run when actuals and plan are refreshed.",
    inputFocus: "budget versus actuals, trend lines, and driver inputs",
    workflowFocus: "identify meaningful variance and summarize the business explanation",
    artifact: "variance narrative",
    automation: "Draft the first variance commentary before monthly reviews.",
    kpi: "Time spent preparing variance commentary",
  },
  {
    name: "Forecast Risk Summarizer",
    idealFor: "FP&A leaders updating rolling forecasts",
    value: "Highlights the forecast lines most at risk and why.",
    problem: "Forecast updates get bogged down because risk is spread across too many assumptions and files.",
    trigger: "Run on each forecast refresh cycle.",
    inputFocus: "current forecast, recent actuals, and driver changes",
    workflowFocus: "rank forecast lines by risk and explain the main drivers",
    artifact: "forecast risk brief",
    automation: "Alert finance leads when forecast risk shifts materially.",
    kpi: "Forecast accuracy improvement",
  },
  {
    name: "Budget Change Impact Mapper",
    idealFor: "Teams evaluating budget changes during the year",
    value: "Shows where a proposed budget change will impact other plans or targets.",
    problem: "Budget changes ripple across teams, but the downstream impact is not summarized fast enough.",
    trigger: "Run when budget changes or reforecast requests are proposed.",
    inputFocus: "budget request, current plan, and linked operating drivers",
    workflowFocus: "map the downstream impact of the requested budget change",
    artifact: "budget impact brief",
    automation: "Route material budget changes into decision review with context attached.",
    kpi: "Budget change review cycle time",
  },
  {
    name: "Board Pack Brief Writer",
    idealFor: "Finance teams prepping board reporting",
    value: "Creates a concise finance briefing for board or leadership decks.",
    problem: "Board materials take too long because the narrative has to be rebuilt around the latest numbers.",
    trigger: "Run during board and executive reporting cycles.",
    inputFocus: "KPI trends, actuals, forecast, and notable risks",
    workflowFocus: "compress the finance story into a decision-ready executive summary",
    artifact: "board finance brief",
    automation: "Draft updated board commentary when the reporting pack is refreshed.",
    kpi: "Board reporting preparation time",
  },
  {
    name: "Driver-based Forecast Assistant",
    idealFor: "Teams forecasting with operational drivers",
    value: "Connects changes in operating drivers to likely forecast movement.",
    problem: "Forecasts drift because operating changes are not tied back to finance assumptions cleanly.",
    trigger: "Run when operational driver inputs change materially.",
    inputFocus: "driver inputs, historical conversion, and current forecast",
    workflowFocus: "translate operating driver movement into forecast implications",
    artifact: "driver-based forecast update",
    automation: "Update finance review notes after driver changes occur.",
    kpi: "Forecast responsiveness to driver changes",
  },
  {
    name: "Scenario Planning Packager",
    idealFor: "Finance teams evaluating upside and downside scenarios",
    value: "Packages scenarios into a format leaders can compare quickly.",
    problem: "Scenario planning is hard to consume when each version lives in a separate model without narrative.",
    trigger: "Run when finance builds or updates scenario cases.",
    inputFocus: "base case, upside, downside, and key assumptions",
    workflowFocus: "summarize scenario differences and the assumptions driving them",
    artifact: "scenario comparison pack",
    automation: "Generate an updated scenario summary whenever cases change.",
    kpi: "Scenario review turnaround time",
  },
  {
    name: "Department Spend Trend Analyzer",
    idealFor: "Finance business partners monitoring spending patterns",
    value: "Highlights unusual department spend growth and where follow-up is needed.",
    problem: "Department spend drift is noticed late because trends are not reviewed systematically.",
    trigger: "Run monthly after spend data refreshes.",
    inputFocus: "department actuals, budget, and historical trend",
    workflowFocus: "identify meaningful spend pattern changes and likely drivers",
    artifact: "spend trend brief",
    automation: "Alert budget owners when spend trends move outside plan.",
    kpi: "Time to identify unplanned spend drift",
  },
  {
    name: "KPI Commentary Generator",
    idealFor: "Teams delivering routine finance or ops KPI packs",
    value: "Writes first-draft KPI commentary grounded in trend and variance data.",
    problem: "KPI reporting still consumes analysts because every commentary cycle starts from zero.",
    trigger: "Run when KPI packs are refreshed.",
    inputFocus: "metric trend, target variance, and prior commentary",
    workflowFocus: "summarize what changed, why it matters, and what should be watched next",
    artifact: "KPI commentary draft",
    automation: "Draft commentary for reporting packs before review meetings.",
    kpi: "Reporting pack preparation time",
  },
]);

const ACCOUNTING_FINANCE_SKILL_BASES = [
  ...RECEIVABLES_AND_BILLING,
  ...PAYABLES_AND_APPROVALS,
  ...CLOSE_AND_RECONCILIATION,
  ...CASH_TREASURY_AND_CONTROLS,
  ...FPANDA_AND_REPORTING,
] as const satisfies ReadonlyArray<AccountingFinanceSkillBase>;

function buildAccountingFinanceSkill(
  skill: AccountingFinanceSkillBase,
  id: number,
): FunctionSkillIdea<AccountingFinanceSkillCategory> {
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
        `Convert the findings into a ${skill.artifact}.`,
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

export const ACCOUNTING_FINANCE_SKILL_CATALOG: ReadonlyArray<
  FunctionSkillIdea<AccountingFinanceSkillCategory>
> = ACCOUNTING_FINANCE_SKILL_BASES.map((skill, index) =>
  buildAccountingFinanceSkill(skill, index + 1),
);

export const ACCOUNTING_FINANCE_SKILL_CATEGORIES: ReadonlyArray<AccountingFinanceSkillCategory> =
  Array.from(new Set(ACCOUNTING_FINANCE_SKILL_CATALOG.map((skill) => skill.category))).toSorted(
    (left, right) => left.localeCompare(right),
  );

export const ACCOUNTING_FINANCE_SKILL_TOTAL = ACCOUNTING_FINANCE_SKILL_CATALOG.length;
