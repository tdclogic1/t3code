export type SmeBuildComplexity = "low" | "medium" | "high";

export interface SmeAppSpec {
  readonly problem: string;
  readonly targetUsers: ReadonlyArray<string>;
  readonly mvpFeatures: ReadonlyArray<string>;
  readonly coreEntities: ReadonlyArray<string>;
  readonly integrations: ReadonlyArray<string>;
  readonly automationOpportunities: ReadonlyArray<string>;
  readonly kpis: ReadonlyArray<string>;
  readonly complexity: SmeBuildComplexity;
  readonly estimatedBuildWeeks: number;
  readonly pricingModel: string;
  readonly launchMotion: string;
}

export interface SmeAppIdea {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly category: string;
  readonly idealFor: string;
  readonly value: string;
  readonly spec: SmeAppSpec;
}

interface SmeAppBaseIdea {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly idealFor: string;
  readonly value: string;
}

interface CategoryTemplate {
  readonly targetUsers: ReadonlyArray<string>;
  readonly mvpFeatures: ReadonlyArray<string>;
  readonly coreEntities: ReadonlyArray<string>;
  readonly integrations: ReadonlyArray<string>;
  readonly automationOpportunities: ReadonlyArray<string>;
  readonly kpis: ReadonlyArray<string>;
  readonly complexity: SmeBuildComplexity;
  readonly estimatedBuildWeeks: number;
  readonly pricingModel: string;
  readonly launchMotion: string;
}

const CATEGORY_TEMPLATES: Record<string, CategoryTemplate> = {
  Analytics: {
    targetUsers: ["COO", "Operations analyst", "Branch manager"],
    mvpFeatures: [
      "KPI dashboard with branch-level filters",
      "Trend lines with daily and weekly views",
      "Threshold alert configuration",
      "Scheduled report exports",
    ],
    coreEntities: ["KPI definition", "Metric value", "Branch", "Alert rule"],
    integrations: ["Google Sheets", "QuickBooks", "POS export CSV"],
    automationOpportunities: ["Anomaly alerts", "Auto-generated weekly summaries"],
    kpis: ["Dashboard adoption", "Alert response time", "Metric freshness"],
    complexity: "medium",
    estimatedBuildWeeks: 7,
    pricingModel: "Per location plus analytics add-on",
    launchMotion: "Pilot with one branch and expand after KPI baseline is trusted.",
  },
  Commerce: {
    targetUsers: ["Ecommerce manager", "Operations lead", "Customer support lead"],
    mvpFeatures: [
      "Unified order timeline",
      "Returns and claim workflows",
      "Customer self-service portal",
      "Role-based access controls",
    ],
    coreEntities: ["Order", "Customer", "Shipment", "Return request"],
    integrations: ["Shopify", "WooCommerce", "Stripe"],
    automationOpportunities: ["Order status notifications", "Auto-routing returns by reason code"],
    kpis: ["Order processing time", "Return resolution SLA", "Self-service usage"],
    complexity: "medium",
    estimatedBuildWeeks: 8,
    pricingModel: "Base platform fee plus order volume tier",
    launchMotion: "Target companies with multi-channel order pain and support backlog.",
  },
  Compliance: {
    targetUsers: ["Compliance manager", "HR lead", "Operations director"],
    mvpFeatures: [
      "Policy and checklist library",
      "Task ownership and due dates",
      "Evidence attachment trails",
      "Audit-ready reporting",
    ],
    coreEntities: ["Policy", "Control task", "Evidence item", "Acknowledgement"],
    integrations: ["Google Workspace", "Microsoft 365", "Slack"],
    automationOpportunities: ["Recurring control schedules", "Overdue escalation reminders"],
    kpis: ["Control completion rate", "Overdue task count", "Audit preparation time"],
    complexity: "medium",
    estimatedBuildWeeks: 7,
    pricingModel: "Per admin seat plus compliance module fee",
    launchMotion: "Lead with high-risk workflows where compliance misses are expensive.",
  },
  Construction: {
    targetUsers: ["Project manager", "Site supervisor", "Operations coordinator"],
    mvpFeatures: [
      "Daily site report submission",
      "Crew and weather logging",
      "Issue and blocker tracking",
      "Photo and note attachments",
    ],
    coreEntities: ["Site", "Daily report", "Crew entry", "Blocker"],
    integrations: ["Google Drive", "Procore CSV exports"],
    automationOpportunities: ["Daily report reminders", "Automatic blocker escalation"],
    kpis: ["Daily report completion", "Blocker resolution time", "Schedule variance"],
    complexity: "medium",
    estimatedBuildWeeks: 8,
    pricingModel: "Per active project",
    launchMotion: "Start with one site to replace paper reports and prove consistency gains.",
  },
  "Customer Operations": {
    targetUsers: ["Front desk manager", "Service lead", "Owner operator"],
    mvpFeatures: [
      "Online scheduling and availability windows",
      "Reminder and cancellation workflows",
      "Customer history timeline",
      "Waitlist management",
    ],
    coreEntities: ["Appointment", "Customer", "Staff member", "Reminder"],
    integrations: ["Google Calendar", "Outlook Calendar", "Twilio"],
    automationOpportunities: ["No-show prevention reminders", "Auto-fill slots from waitlist"],
    kpis: ["No-show rate", "Booking conversion", "Utilization rate"],
    complexity: "low",
    estimatedBuildWeeks: 6,
    pricingModel: "Per location with optional SMS usage billing",
    launchMotion: "Offer as a quick-win replacement for manual calendar workflows.",
  },
  "Customer Support": {
    targetUsers: ["Support manager", "CSM", "Implementation specialist"],
    mvpFeatures: [
      "Ticket queue and SLA tracking",
      "Onboarding task templates",
      "Renewal risk views",
      "Customer communication log",
    ],
    coreEntities: ["Ticket", "Account", "Onboarding step", "Renewal"],
    integrations: ["Gmail", "HubSpot", "Slack"],
    automationOpportunities: ["SLA breach alerts", "Onboarding milestone nudges"],
    kpis: ["First response time", "Ticket resolution time", "Onboarding completion rate"],
    complexity: "medium",
    estimatedBuildWeeks: 7,
    pricingModel: "Per support agent plus account volume tier",
    launchMotion: "Bundle with onboarding and renewal playbooks for account teams.",
  },
  "Field Service": {
    targetUsers: ["Dispatch coordinator", "Field technician", "Service manager"],
    mvpFeatures: [
      "Job intake and dispatch board",
      "Technician scheduling by skill",
      "Work order status tracking",
      "Mobile completion checklists",
    ],
    coreEntities: ["Work order", "Technician", "Asset", "Service window"],
    integrations: ["Google Maps", "Twilio", "QuickBooks"],
    automationOpportunities: ["Route-aware assignment suggestions", "Service completion notifications"],
    kpis: ["First-time fix rate", "Travel time per job", "Jobs completed per day"],
    complexity: "high",
    estimatedBuildWeeks: 10,
    pricingModel: "Per technician seat",
    launchMotion: "Target service teams with dispatch bottlenecks and high overtime costs.",
  },
  Finance: {
    targetUsers: ["Finance manager", "Bookkeeper", "Owner operator"],
    mvpFeatures: [
      "Invoice and payment tracking",
      "Cash flow forecast views",
      "Approval workflows",
      "Collections reminders",
    ],
    coreEntities: ["Invoice", "Payment", "Expense", "Forecast period"],
    integrations: ["QuickBooks", "Xero", "Stripe"],
    automationOpportunities: ["Past-due reminders", "Spend alerts", "Recurring billing runs"],
    kpis: ["Days sales outstanding", "Collection rate", "Forecast accuracy"],
    complexity: "medium",
    estimatedBuildWeeks: 8,
    pricingModel: "Per company plus finance automation add-on",
    launchMotion: "Start with receivables and approvals to deliver immediate cash impact.",
  },
  "Healthcare SME": {
    targetUsers: ["Clinic admin", "Front desk lead", "Practice manager"],
    mvpFeatures: [
      "Digital intake forms",
      "Appointment preparation checklist",
      "Insurance and document capture",
      "Visit readiness dashboard",
    ],
    coreEntities: ["Patient", "Intake form", "Appointment", "Document"],
    integrations: ["Google Workspace", "DocuSign"],
    automationOpportunities: ["Pre-visit reminders", "Missing form alerts"],
    kpis: ["Intake completion rate", "Wait time", "Front desk processing time"],
    complexity: "medium",
    estimatedBuildWeeks: 7,
    pricingModel: "Per provider location",
    launchMotion: "Begin with non-clinical workflows to reduce rollout friction.",
  },
  Hospitality: {
    targetUsers: ["Venue manager", "Host lead", "Operations lead"],
    mvpFeatures: [
      "Reservation and event planner",
      "Staff and capacity coordination",
      "Customer preference profile",
      "Daily operations dashboard",
    ],
    coreEntities: ["Reservation", "Event", "Table or room", "Shift"],
    integrations: ["Toast", "Square", "Google Calendar"],
    automationOpportunities: ["Reservation reminders", "Capacity alerts"],
    kpis: ["Seat occupancy", "Average wait time", "Repeat customer rate"],
    complexity: "medium",
    estimatedBuildWeeks: 8,
    pricingModel: "Per venue plus event volume",
    launchMotion: "Sell on reduced no-shows and smoother peak-hour operations.",
  },
  Inventory: {
    targetUsers: ["Inventory manager", "Procurement lead", "Store manager"],
    mvpFeatures: [
      "Real-time stock ledger",
      "Reorder point alerts",
      "Supplier lead-time tracking",
      "Purchase recommendation list",
    ],
    coreEntities: ["SKU", "Stock movement", "Supplier", "Reorder rule"],
    integrations: ["Shopify", "Cin7 CSV exports", "QuickBooks"],
    automationOpportunities: ["Auto-generated purchase drafts", "Low-stock alerts"],
    kpis: ["Stockout rate", "Inventory turns", "Carrying cost"],
    complexity: "medium",
    estimatedBuildWeeks: 8,
    pricingModel: "Per warehouse or store",
    launchMotion: "Target inventory-heavy SMEs that still reorder manually.",
  },
  Logistics: {
    targetUsers: ["Logistics coordinator", "Dispatcher", "Driver lead"],
    mvpFeatures: [
      "Route planning board",
      "Delivery and handoff proof capture",
      "Fleet maintenance logs",
      "Driver shift visibility",
    ],
    coreEntities: ["Route", "Stop", "Vehicle", "Delivery proof"],
    integrations: ["Google Maps", "Twilio", "Fleet telematics CSV"],
    automationOpportunities: ["Route optimization suggestions", "Late delivery alerts"],
    kpis: ["On-time delivery rate", "Cost per route", "Average stops per trip"],
    complexity: "high",
    estimatedBuildWeeks: 10,
    pricingModel: "Per vehicle or active route",
    launchMotion: "Lead with fuel and route efficiency savings.",
  },
  Marketing: {
    targetUsers: ["Marketing manager", "Growth lead", "Agency account lead"],
    mvpFeatures: [
      "Campaign brief workflows",
      "Content planning calendar",
      "Approval routing",
      "Channel performance summary",
    ],
    coreEntities: ["Campaign", "Content item", "Approval", "Audience segment"],
    integrations: ["Meta Ads CSV", "Google Ads", "Mailchimp"],
    automationOpportunities: ["Review requests after fulfillment", "Content reminder scheduling"],
    kpis: ["Campaign cycle time", "Lead conversion rate", "Review acquisition rate"],
    complexity: "low",
    estimatedBuildWeeks: 6,
    pricingModel: "Per brand workspace",
    launchMotion: "Position as campaign execution control center for lean teams.",
  },
  Nonprofit: {
    targetUsers: ["Development manager", "Fundraising coordinator", "Executive director"],
    mvpFeatures: [
      "Donor and donation timeline",
      "Campaign segmentation",
      "Outreach scheduling",
      "Impact reporting",
    ],
    coreEntities: ["Donor", "Donation", "Campaign", "Outreach activity"],
    integrations: ["Stripe", "Mailchimp", "Google Sheets"],
    automationOpportunities: ["Thank-you messaging", "Lapsed donor re-engagement prompts"],
    kpis: ["Donor retention", "Campaign conversion", "Average gift size"],
    complexity: "low",
    estimatedBuildWeeks: 6,
    pricingModel: "Nonprofit tier with annual pricing",
    launchMotion: "Start with recurring donor retention and campaign visibility.",
  },
  Operations: {
    targetUsers: ["Operations manager", "Facilities lead", "Team supervisor"],
    mvpFeatures: [
      "Asset assignment tracker",
      "Condition and return logging",
      "Issue reporting and escalation",
      "Utilization dashboards",
    ],
    coreEntities: ["Asset", "Assignment", "Condition report", "Issue"],
    integrations: ["Google Workspace", "Slack"],
    automationOpportunities: ["Due-back reminders", "Missing asset alerts"],
    kpis: ["Asset utilization", "Loss rate", "Average checkout duration"],
    complexity: "low",
    estimatedBuildWeeks: 6,
    pricingModel: "Per managed asset pack",
    launchMotion: "Pilot with one high-value asset class before full rollout.",
  },
  Procurement: {
    targetUsers: ["Procurement manager", "Finance approver", "Operations lead"],
    mvpFeatures: [
      "Purchase request and approval flow",
      "Supplier score and performance tracking",
      "PO lifecycle timeline",
      "Budget guardrails",
    ],
    coreEntities: ["Purchase request", "PO", "Supplier", "Budget rule"],
    integrations: ["NetSuite CSV", "QuickBooks", "Email"],
    automationOpportunities: ["Auto-routing approvals", "Budget breach warnings"],
    kpis: ["Approval turnaround time", "On-time supplier delivery", "Spend variance"],
    complexity: "medium",
    estimatedBuildWeeks: 8,
    pricingModel: "Per approver seat plus spend tier",
    launchMotion: "Lead with procurement controls for businesses scaling spend.",
  },
  "Real Estate": {
    targetUsers: ["Broker owner", "Agent lead", "Inside sales agent"],
    mvpFeatures: [
      "Inbound lead scoring",
      "Routing rules by territory",
      "Follow-up cadences",
      "Deal pipeline snapshots",
    ],
    coreEntities: ["Lead", "Agent", "Property preference", "Follow-up task"],
    integrations: ["CRM CSV", "Twilio", "Gmail"],
    automationOpportunities: ["Lead assignment suggestions", "Follow-up reminders"],
    kpis: ["Lead response time", "Lead-to-showing rate", "Lead-to-close rate"],
    complexity: "low",
    estimatedBuildWeeks: 6,
    pricingModel: "Per active agent",
    launchMotion: "Position as response-time accelerator for inbound leads.",
  },
  Sales: {
    targetUsers: ["Sales manager", "Account executive", "Business owner"],
    mvpFeatures: [
      "Pipeline stages and next actions",
      "Quote and proposal templates",
      "Deal activity timeline",
      "Forecast rollups",
    ],
    coreEntities: ["Lead", "Opportunity", "Quote", "Activity"],
    integrations: ["HubSpot", "Pipedrive", "Gmail"],
    automationOpportunities: ["Follow-up nudges", "Stage aging alerts"],
    kpis: ["Win rate", "Sales cycle length", "Pipeline coverage"],
    complexity: "low",
    estimatedBuildWeeks: 6,
    pricingModel: "Per sales seat",
    launchMotion: "Pitch as lightweight CRM for teams that outgrew spreadsheets.",
  },
  Sustainability: {
    targetUsers: ["Operations director", "Facilities manager", "ESG coordinator"],
    mvpFeatures: [
      "Utility and emissions input workflows",
      "Baseline and target tracking",
      "Reduction initiative tracking",
      "Executive summary exports",
    ],
    coreEntities: ["Meter reading", "Emission factor", "Reduction initiative", "Reporting period"],
    integrations: ["Utility bill CSV", "Google Sheets"],
    automationOpportunities: ["Outlier detection", "Target deviation alerts"],
    kpis: ["Energy consumption per period", "Emissions trend", "Reduction project completion"],
    complexity: "medium",
    estimatedBuildWeeks: 7,
    pricingModel: "Per reporting location",
    launchMotion: "Start with simple baseline reporting, then add initiative tracking.",
  },
  Workforce: {
    targetUsers: ["HR manager", "Team lead", "Operations manager"],
    mvpFeatures: [
      "Scheduling and availability management",
      "Time-off requests and approvals",
      "Training and hiring workflows",
      "Workforce compliance reminders",
    ],
    coreEntities: ["Employee", "Shift", "Leave request", "Training module"],
    integrations: ["Google Calendar", "Slack", "Payroll CSV"],
    automationOpportunities: ["Shift gap alerts", "Training deadline reminders"],
    kpis: ["Schedule coverage", "Time-to-hire", "Training completion"],
    complexity: "medium",
    estimatedBuildWeeks: 7,
    pricingModel: "Per employee seat with admin tier",
    launchMotion: "Start with one workforce workflow and expand into HR operations stack.",
  },
};

const DEFAULT_TEMPLATE: CategoryTemplate = {
  targetUsers: ["Operations manager", "Owner operator"],
  mvpFeatures: [
    "Operational workflow board",
    "Automated reminders and notifications",
    "Role-based task ownership",
    "Performance dashboard",
  ],
  coreEntities: ["Task", "Workflow item", "Team member", "Status event"],
  integrations: ["Google Workspace", "Slack"],
  automationOpportunities: ["Reminder cadences", "SLA breach notifications"],
  kpis: ["Cycle time", "Task completion rate", "Operational backlog"],
  complexity: "medium",
  estimatedBuildWeeks: 7,
  pricingModel: "Per company workspace",
  launchMotion: "Launch as an operational workflow replacement for manual tracking.",
};

const BASE_IDEAS: ReadonlyArray<SmeAppBaseIdea> = [
  {
    id: 1,
    name: "Smart Appointment Booking",
    category: "Customer Operations",
    idealFor: "Clinics, salons, consultants",
    value: "Cuts no-shows with reminders and auto-rescheduling.",
  },
  {
    id: 2,
    name: "Quotes and Invoices Hub",
    category: "Finance",
    idealFor: "Services and agencies",
    value: "Moves prospects to paid clients with faster quote-to-cash flow.",
  },
  {
    id: 3,
    name: "Inventory Reorder Assistant",
    category: "Inventory",
    idealFor: "Retail and wholesale",
    value: "Prevents stockouts with reorder points and supplier lead times.",
  },
  {
    id: 4,
    name: "Shift Scheduler",
    category: "Workforce",
    idealFor: "Restaurants and retail teams",
    value: "Reduces scheduling gaps with availability-aware rosters.",
  },
  {
    id: 5,
    name: "Payroll Prep Workspace",
    category: "Workforce",
    idealFor: "Teams with hourly workers",
    value: "Collects approved hours and exceptions before payroll day.",
  },
  {
    id: 6,
    name: "Loyalty Points Manager",
    category: "Sales",
    idealFor: "Local stores and cafes",
    value: "Drives repeat purchases with points and tier rewards.",
  },
  {
    id: 7,
    name: "Lead Pipeline CRM Lite",
    category: "Sales",
    idealFor: "SME sales teams",
    value: "Tracks deals, owner actions, and close probability in one board.",
  },
  {
    id: 8,
    name: "Estimate-to-Job Tracker",
    category: "Field Service",
    idealFor: "Contractors and installers",
    value: "Turns accepted estimates into scheduled jobs instantly.",
  },
  {
    id: 9,
    name: "Technician Dispatch Board",
    category: "Field Service",
    idealFor: "Repair and maintenance companies",
    value: "Assigns jobs by skill, distance, and availability.",
  },
  {
    id: 10,
    name: "Preventive Maintenance Planner",
    category: "Field Service",
    idealFor: "Equipment-dependent businesses",
    value: "Reduces breakdowns with recurring service plans.",
  },
  {
    id: 11,
    name: "Purchase Order Tracker",
    category: "Procurement",
    idealFor: "SMEs with multiple suppliers",
    value: "Monitors PO status from approval to delivery.",
  },
  {
    id: 12,
    name: "Supplier Scorecard",
    category: "Procurement",
    idealFor: "Operations managers",
    value: "Ranks vendors by quality, cost, and on-time delivery.",
  },
  {
    id: 13,
    name: "Cash Flow Forecast Studio",
    category: "Finance",
    idealFor: "Owner-operators",
    value: "Shows weekly runway based on receivables and obligations.",
  },
  {
    id: 14,
    name: "Expense Approval Workflow",
    category: "Finance",
    idealFor: "Growing teams",
    value: "Controls spend through role-based approvals and audit history.",
  },
  {
    id: 15,
    name: "Accounts Receivable Follow-up",
    category: "Finance",
    idealFor: "B2B businesses",
    value: "Automates reminder cadences to improve collection rates.",
  },
  {
    id: 16,
    name: "Subscription Billing Manager",
    category: "Finance",
    idealFor: "SaaS and service retainers",
    value: "Handles recurring invoices, renewals, and failed payments.",
  },
  {
    id: 17,
    name: "Order Consolidation Hub",
    category: "Commerce",
    idealFor: "Omnichannel sellers",
    value: "Unifies marketplace and website orders into one queue.",
  },
  {
    id: 18,
    name: "Returns and Warranty Portal",
    category: "Commerce",
    idealFor: "Product businesses",
    value: "Speeds claim handling with guided return workflows.",
  },
  {
    id: 19,
    name: "Social Content Planner",
    category: "Marketing",
    idealFor: "SME marketing teams",
    value: "Plans posts, approvals, and publishing cadence.",
  },
  {
    id: 20,
    name: "Campaign Brief Builder",
    category: "Marketing",
    idealFor: "Agencies and in-house marketers",
    value: "Standardizes campaign inputs before design and launch.",
  },
  {
    id: 21,
    name: "Review Request Automation",
    category: "Marketing",
    idealFor: "Local service businesses",
    value: "Increases review volume with post-service prompts.",
  },
  {
    id: 22,
    name: "Referral Program Console",
    category: "Marketing",
    idealFor: "SMEs with repeat clients",
    value: "Tracks referrals, rewards, and conversion outcomes.",
  },
  {
    id: 23,
    name: "Help Desk Ticket Portal",
    category: "Customer Support",
    idealFor: "Support teams",
    value: "Routes and prioritizes customer issues with SLA rules.",
  },
  {
    id: 24,
    name: "Client Onboarding Checklist",
    category: "Customer Support",
    idealFor: "Professional services",
    value: "Improves activation with guided setup milestones.",
  },
  {
    id: 25,
    name: "Contract Renewal Tracker",
    category: "Customer Support",
    idealFor: "B2B account teams",
    value: "Prevents missed renewals with risk and timeline alerts.",
  },
  {
    id: 26,
    name: "Staff Training Micro-LMS",
    category: "Workforce",
    idealFor: "Distributed teams",
    value: "Delivers short mandatory training with completion proof.",
  },
  {
    id: 27,
    name: "Hiring Pipeline Tracker",
    category: "Workforce",
    idealFor: "SMEs hiring regularly",
    value: "Organizes candidates, interviews, and feedback loops.",
  },
  {
    id: 28,
    name: "Time-Off and Leave Manager",
    category: "Workforce",
    idealFor: "Teams with PTO policies",
    value: "Balances coverage while keeping leave approvals transparent.",
  },
  {
    id: 29,
    name: "Compliance Checklist Engine",
    category: "Compliance",
    idealFor: "Regulated SMEs",
    value: "Schedules recurring checks with owner accountability.",
  },
  {
    id: 30,
    name: "Safety Incident Logger",
    category: "Compliance",
    idealFor: "Field and site operations",
    value: "Captures incidents quickly with corrective-action tracking.",
  },
  {
    id: 31,
    name: "Audit Evidence Repository",
    category: "Compliance",
    idealFor: "ISO and policy audits",
    value: "Stores controls evidence with version history.",
  },
  {
    id: 32,
    name: "Document E-Sign Workflow",
    category: "Compliance",
    idealFor: "Admin and legal teams",
    value: "Moves agreements to signature with status visibility.",
  },
  {
    id: 33,
    name: "Asset Checkout Manager",
    category: "Operations",
    idealFor: "Teams sharing equipment",
    value: "Tracks who has what, when it is due, and condition notes.",
  },
  {
    id: 34,
    name: "Fleet Logbook Digitizer",
    category: "Logistics",
    idealFor: "SMEs with vehicles",
    value: "Centralizes mileage, fuel, and maintenance records.",
  },
  {
    id: 35,
    name: "Route Planning Assistant",
    category: "Logistics",
    idealFor: "Local delivery teams",
    value: "Optimizes route order to reduce travel time and fuel.",
  },
  {
    id: 36,
    name: "Delivery Proof Capture",
    category: "Logistics",
    idealFor: "Last-mile operations",
    value: "Collects signatures/photos for dispute-free handoffs.",
  },
  {
    id: 37,
    name: "Table Reservation Manager",
    category: "Hospitality",
    idealFor: "Restaurants",
    value: "Balances seating demand and waitlist turnover.",
  },
  {
    id: 38,
    name: "Catering Operations Planner",
    category: "Hospitality",
    idealFor: "Food service businesses",
    value: "Coordinates menus, staffing, and event timelines.",
  },
  {
    id: 39,
    name: "Salon POS and Booking",
    category: "Hospitality",
    idealFor: "Beauty businesses",
    value: "Links appointments, payments, and client history.",
  },
  {
    id: 40,
    name: "Patient Intake Assistant",
    category: "Healthcare SME",
    idealFor: "Small clinics",
    value: "Pre-collects forms and reduces front-desk bottlenecks.",
  },
  {
    id: 41,
    name: "Construction Daily Report App",
    category: "Construction",
    idealFor: "General contractors",
    value: "Captures labor, weather, and blockers by site day.",
  },
  {
    id: 42,
    name: "Real Estate Lead Qualifier",
    category: "Real Estate",
    idealFor: "Broker teams",
    value: "Scores inbound leads and routes by urgency.",
  },
  {
    id: 43,
    name: "Donor CRM for Nonprofits",
    category: "Nonprofit",
    idealFor: "Small organizations",
    value: "Tracks donations, outreach, and campaign response.",
  },
  {
    id: 44,
    name: "Wholesale Price List Portal",
    category: "Commerce",
    idealFor: "B2B sellers",
    value: "Publishes customer-tier pricing with self-serve access.",
  },
  {
    id: 45,
    name: "B2B Customer Self-Service Portal",
    category: "Commerce",
    idealFor: "Manufacturers and distributors",
    value: "Lets customers view orders, invoices, and support cases.",
  },
  {
    id: 46,
    name: "Multi-Location KPI Dashboard",
    category: "Analytics",
    idealFor: "SMEs with multiple branches",
    value: "Compares site performance with drill-down trend views.",
  },
  {
    id: 47,
    name: "KPI Alerting Bot",
    category: "Analytics",
    idealFor: "Ops and finance leads",
    value: "Sends threshold alerts when metrics drift from targets.",
  },
  {
    id: 48,
    name: "Procurement Budget Guardrail",
    category: "Procurement",
    idealFor: "Cost-conscious teams",
    value: "Flags purchases that exceed monthly spend limits.",
  },
  {
    id: 49,
    name: "Energy and Carbon Tracker",
    category: "Sustainability",
    idealFor: "SMEs with ESG goals",
    value: "Monitors utility usage and emissions baselines.",
  },
  {
    id: 50,
    name: "Policy Acknowledgement Tracker",
    category: "Compliance",
    idealFor: "All SME teams",
    value: "Verifies staff acknowledgement for critical policies.",
  },
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function firstTwoLabels(value: string): ReadonlyArray<string> {
  return value
    .replace(/[.]/g, "")
    .split(" and ")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .slice(0, 2);
}

function createSpec(idea: SmeAppBaseIdea): SmeAppSpec {
  const template = CATEGORY_TEMPLATES[idea.category] ?? DEFAULT_TEMPLATE;
  const outcomeFragments = firstTwoLabels(idea.value);
  const contextualFeature =
    outcomeFragments.length > 0
      ? `Outcome tracking for ${outcomeFragments.join(" and ")}`
      : "Outcome tracking dashboard";

  return {
    problem: `${idea.idealFor} teams typically run ${idea.name.toLowerCase()} through manual tools, which creates delays, data gaps, and inconsistent execution.`,
    targetUsers: template.targetUsers,
    mvpFeatures: [contextualFeature, ...template.mvpFeatures].slice(0, 5),
    coreEntities: template.coreEntities,
    integrations: template.integrations,
    automationOpportunities: [
      ...template.automationOpportunities,
      "Role-based daily digests for pending actions",
    ],
    kpis: [...template.kpis, "Time saved per workflow"],
    complexity: template.complexity,
    estimatedBuildWeeks: template.estimatedBuildWeeks,
    pricingModel: template.pricingModel,
    launchMotion: template.launchMotion,
  };
}

export const SME_APP_CATALOG: ReadonlyArray<SmeAppIdea> = BASE_IDEAS.map((idea) => ({
  id: idea.id,
  name: idea.name,
  category: idea.category,
  idealFor: idea.idealFor,
  value: idea.value,
  slug: toSlug(idea.name),
  spec: createSpec(idea),
}));
