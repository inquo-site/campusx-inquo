export type AiAgent = {
  name: string;
  role: string;
  abilities: string[];
};

export type AiTeam = {
  slug: string;
  name: string;
  category: "Engineering" | "Design" | "Quality" | "Growth" | "Operations" | "Intelligence";
  tagline: string;
  agents: AiAgent[];
  capabilities: string[];
  monthly: number;
  yearly: number;
};

const ag = (name: string, role: string, ...abilities: string[]): AiAgent => ({ name, role, abilities });

/** All pricing in INR. Yearly ≈ 20% off (10 months). */
export const AI_TEAMS: AiTeam[] = [
  {
    slug: "software-engineering",
    name: "AI Software Engineering Team",
    category: "Engineering",
    tagline: "Ships apps, APIs and infrastructure end to end.",
    monthly: 3999,
    yearly: 38400,
    capabilities: ["Build applications", "Create APIs", "Database architecture", "Authentication", "AI integration", "Backend systems", "Deployment", "Performance optimization"],
    agents: [
      ag("Frontend Engineer", "Owns the interface layer", "Builds React screens from design specs", "Wires state, routing and data fetching", "Fixes layout, responsiveness and a11y issues", "Optimises bundle size and render performance"),
      ag("Backend Engineer", "Owns server logic", "Designs server functions and business rules", "Handles queues, jobs and webhooks", "Writes validation and error handling", "Instruments logs and metrics"),
      ag("Full Stack Engineer", "Ships features end to end", "Takes a ticket from schema to UI", "Connects frontend to backend contracts", "Handles migrations alongside feature code", "Unblocks cross-layer bugs"),
      ag("Mobile Engineer", "Owns mobile experience", "Builds responsive and PWA behaviour", "Handles touch, offline and install flows", "Tunes mobile performance budgets", "Tests across device sizes"),
      ag("API Engineer", "Owns integration surface", "Designs REST endpoints and payload contracts", "Writes auth, rate limits and versioning", "Documents every route with examples", "Builds third-party integrations"),
      ag("Database Engineer", "Owns the data layer", "Designs schema, indexes and relations", "Writes migrations and grants", "Authors RLS policies and access rules", "Tunes slow queries"),
      ag("DevOps Engineer", "Owns delivery pipeline", "Sets up CI/CD and environments", "Automates builds, tests and rollbacks", "Manages secrets and config", "Monitors deploy health"),
      ag("Cloud Engineer", "Owns runtime infrastructure", "Provisions and scales infrastructure", "Configures CDN, caching and storage", "Plans cost and capacity", "Sets uptime alerting"),
    ],
  },
  {
    slug: "design",
    name: "UI/UX Design Team",
    category: "Design",
    tagline: "Turns product intent into interfaces people love.",
    monthly: 2399,
    yearly: 22999,
    capabilities: ["Wireframes", "UI design", "UX optimization", "Responsive design", "Component libraries", "Animations", "Design systems", "Figma export"],
    agents: [
      ag("UI Designer", "Crafts the visual surface", "Designs screens, states and empty views", "Sets colour, type and spacing scales", "Builds hover, focus and disabled states", "Audits contrast and visual hierarchy"),
      ag("UX Researcher", "Understands the user", "Maps user journeys and drop-off points", "Writes usability test scripts", "Turns feedback into design changes", "Prioritises friction by impact"),
      ag("Product Designer", "Bridges product and design", "Translates requirements into flows", "Designs onboarding and edge cases", "Balances scope against effort", "Writes design rationale for engineers"),
      ag("Graphic Designer", "Owns brand assets", "Creates covers, OG images and icons", "Keeps brand consistency across surfaces", "Designs social and launch creatives", "Prepares export-ready assets"),
      ag("Motion Designer", "Owns movement", "Defines easing, duration and choreography", "Designs scroll and page transitions", "Adds micro-interactions to key actions", "Keeps motion accessible and reduced-motion safe"),
      ag("Design System Architect", "Owns consistency at scale", "Defines semantic design tokens", "Builds reusable component variants", "Documents usage rules", "Prevents one-off styling drift"),
    ],
  },
  {
    slug: "qa",
    name: "QA & Testing Team",
    category: "Quality",
    tagline: "Nothing ships until it survives this team.",
    monthly: 1999,
    yearly: 19199,
    capabilities: ["Unit testing", "Integration testing", "Performance testing", "Security testing", "Automation", "Bug reports"],
    agents: [
      ag("QA Engineer", "Owns release quality", "Writes test plans per feature", "Runs functional and regression passes", "Files reproducible bug reports", "Signs off before deploy"),
      ag("Automation Tester", "Owns repeatable coverage", "Writes unit and integration suites", "Builds end-to-end user flows", "Wires tests into CI", "Keeps flaky tests under control"),
      ag("Performance Tester", "Owns speed under load", "Runs load and stress scenarios", "Profiles slow paths and queries", "Tracks Core Web Vitals", "Sets performance budgets"),
      ag("Security Tester", "Breaks it before others do", "Tests auth and access boundaries", "Probes injection and XSS surfaces", "Reviews RLS and permission gaps", "Reports severity-ranked findings"),
    ],
  },
  {
    slug: "bug-resolution",
    name: "Bug Resolution Team",
    category: "Quality",
    tagline: "Finds root causes, not symptoms.",
    monthly: 1249,
    yearly: 11999,
    capabilities: ["Detect bugs", "Fix bugs", "Error analysis", "Root cause detection", "Regression prevention", "Log analysis"],
    agents: [
      ag("Error Analyzer", "Triages incoming failures", "Groups errors by signature", "Ranks impact by user reach", "Detects new regressions after deploy", "Routes issues to the right team"),
      ag("Debugging Specialist", "Reproduces and fixes", "Builds minimal reproductions", "Traces stack to exact line", "Ships the smallest safe fix", "Verifies against the original report"),
      ag("Root Cause Expert", "Stops repeat failures", "Runs five-whys on incidents", "Identifies systemic causes", "Proposes guardrails and tests", "Writes the post-mortem"),
    ],
  },
  {
    slug: "code-review",
    name: "Code Review Team",
    category: "Quality",
    tagline: "Senior-level review on every change.",
    monthly: 1249,
    yearly: 11999,
    capabilities: ["Code review", "Performance review", "Architecture review", "Security review", "Best practices", "Refactoring suggestions"],
    agents: [
      ag("Senior Software Reviewer", "Guards code quality", "Reviews readability and structure", "Flags duplication and dead code", "Suggests concrete refactors", "Enforces project conventions"),
      ag("Security Reviewer", "Guards the attack surface", "Reviews auth and secret handling", "Checks input validation paths", "Flags unsafe dependencies", "Verifies policy coverage"),
      ag("Architecture Reviewer", "Guards long-term shape", "Reviews module boundaries", "Checks scalability of the approach", "Prevents accidental coupling", "Approves or blocks big changes"),
    ],
  },
  {
    slug: "research",
    name: "AI Research Team",
    category: "Intelligence",
    tagline: "Reads the docs so your teams don't guess.",
    monthly: 1599,
    yearly: 15349,
    capabilities: ["Documentation search", "Framework comparison", "Market research", "AI reasoning", "Best practices", "Competitor analysis"],
    agents: [
      ag("Technology Researcher", "Scouts the options", "Compares libraries and trade-offs", "Checks maintenance and community health", "Prototypes risky unknowns", "Recommends with evidence"),
      ag("Documentation Researcher", "Finds the truth fast", "Pulls exact API references", "Extracts version-specific caveats", "Summarises migration guides", "Cites every source"),
      ag("Framework Analyst", "Benchmarks approaches", "Runs comparison matrices", "Measures DX and performance cost", "Predicts lock-in risk", "Advises on adoption timing"),
      ag("AI Reasoning Specialist", "Designs the thinking layer", "Writes prompts and tool schemas", "Chooses models per task and cost", "Builds evaluation checks", "Reduces hallucination risk"),
    ],
  },
  {
    slug: "documentation",
    name: "Documentation Team",
    category: "Operations",
    tagline: "Every deliverable arrives documented.",
    monthly: 749,
    yearly: 7199,
    capabilities: ["README", "Documentation", "User guides", "API docs", "Architecture documents", "Changelogs"],
    agents: [
      ag("Technical Writer", "Explains the system", "Writes architecture and setup docs", "Keeps docs in sync with code", "Creates diagrams and glossaries", "Reviews clarity for new joiners"),
      ag("README Writer", "Owns first impressions", "Writes install and quickstart steps", "Documents env vars and scripts", "Adds troubleshooting sections", "Keeps badges and links current"),
      ag("API Documentation Writer", "Documents the contract", "Describes every endpoint and field", "Adds request and response examples", "Documents error codes", "Publishes versioned references"),
    ],
  },
  {
    slug: "product-strategy",
    name: "Product Strategy Team",
    category: "Intelligence",
    tagline: "Decides what to build before anyone builds it.",
    monthly: 1599,
    yearly: 15349,
    capabilities: ["Product roadmap", "Feature prioritization", "Business analysis", "Product planning", "User journey"],
    agents: [
      ag("Product Manager", "Owns the what and when", "Writes specs with acceptance criteria", "Prioritises the backlog by value", "Cuts scope to hit dates", "Runs launch checklists"),
      ag("Business Analyst", "Owns the numbers behind decisions", "Models cost and benefit per feature", "Maps process and requirement gaps", "Defines success metrics", "Validates assumptions with data"),
      ag("Market Analyst", "Owns outside context", "Tracks competitor releases", "Sizes segments and demand", "Spots positioning gaps", "Recommends differentiation"),
    ],
  },
  {
    slug: "marketing",
    name: "Marketing Team",
    category: "Growth",
    tagline: "Distribution engine for whatever you ship.",
    monthly: 1999,
    yearly: 19199,
    capabilities: ["SEO", "Blog writing", "Landing pages", "Email campaigns", "Ads", "Marketing strategy"],
    agents: [
      ag("SEO Expert", "Owns organic reach", "Researches keywords and intent", "Fixes titles, meta and schema", "Plans internal linking", "Tracks rankings and fixes decay"),
      ag("Content Writer", "Owns the long form", "Writes researched blog articles", "Structures posts for scanning", "Humanises AI drafts", "Repurposes content across channels"),
      ag("Copywriter", "Owns the short form", "Writes headlines and CTAs", "Sharpens landing page messaging", "A/B tests variations", "Keeps brand voice consistent"),
      ag("Social Media Strategist", "Owns the feed", "Plans content calendars", "Writes platform-native posts", "Designs launch threads", "Reports engagement trends"),
    ],
  },
  {
    slug: "sales",
    name: "Sales Team",
    category: "Growth",
    tagline: "Pipeline, proposals and follow-ups on autopilot.",
    monthly: 1999,
    yearly: 19199,
    capabilities: ["Lead generation", "CRM", "Proposal creation", "Follow ups", "Sales outreach"],
    agents: [
      ag("Sales Representative", "Owns outreach", "Builds targeted prospect lists", "Writes personalised cold sequences", "Handles objections with scripts", "Books and preps calls"),
      ag("CRM Manager", "Owns pipeline hygiene", "Keeps deal stages accurate", "Automates follow-up reminders", "Segments contacts by intent", "Reports conversion by stage"),
      ag("Proposal Writer", "Owns the close document", "Drafts scoped proposals", "Builds pricing options", "Writes SOWs and terms summaries", "Tailors decks per client"),
    ],
  },
  {
    slug: "customer-success",
    name: "Customer Success Team",
    category: "Growth",
    tagline: "Answers your users while you sleep.",
    monthly: 1249,
    yearly: 11999,
    capabilities: ["Customer support", "FAQ", "Tickets", "Documentation", "Live AI chat"],
    agents: [
      ag("Support Specialist", "Owns replies", "Answers tickets with context", "Escalates real bugs to engineering", "Tracks response and resolution time", "Follows up until closed"),
      ag("Knowledge Base Manager", "Owns self-serve answers", "Writes and updates help articles", "Turns repeat tickets into docs", "Organises search-friendly categories", "Measures deflection rate"),
      ag("AI Chat Assistant", "Owns instant help", "Answers common questions live", "Guides users through flows", "Collects structured feedback", "Hands off to a human cleanly"),
    ],
  },
  {
    slug: "data-analytics",
    name: "Data Analytics Team",
    category: "Intelligence",
    tagline: "Turns raw tables into decisions.",
    monthly: 2399,
    yearly: 22999,
    capabilities: ["Dashboards", "Reports", "Forecasting", "KPIs", "SQL analysis", "Data visualization"],
    agents: [
      ag("SQL Analyst", "Owns the queries", "Writes analytical SQL over your tables", "Builds reusable views", "Validates data quality", "Explains anomalies"),
      ag("BI Analyst", "Owns the story in the data", "Defines KPIs and cohorts", "Runs retention and funnel analysis", "Forecasts growth scenarios", "Writes the weekly insight digest"),
      ag("Dashboard Engineer", "Owns the visuals", "Builds live dashboards", "Designs charts for fast reading", "Adds alerts on threshold breaches", "Keeps dashboards performant"),
    ],
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity Team",
    category: "Quality",
    tagline: "Audits, threats and compliance, continuously.",
    monthly: 3249,
    yearly: 31199,
    capabilities: ["Vulnerability scan", "Security audit", "Threat detection", "Compliance", "Security reports"],
    agents: [
      ag("Security Analyst", "Owns the audit", "Scans dependencies and code paths", "Reviews access control policies", "Ranks findings by severity", "Tracks fixes to closure"),
      ag("Threat Hunter", "Owns detection", "Watches for abnormal traffic patterns", "Investigates suspicious sessions", "Builds detection rules", "Runs incident response drills"),
      ag("Compliance Specialist", "Owns the paperwork that matters", "Maps controls to GDPR and SOC2", "Prepares evidence and checklists", "Reviews data retention practices", "Flags policy gaps early"),
    ],
  },
  {
    slug: "devops-cloud",
    name: "DevOps & Cloud Team",
    category: "Engineering",
    tagline: "Pipelines, clusters and uptime.",
    monthly: 2899,
    yearly: 27899,
    capabilities: ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "Monitoring", "CI/CD"],
    agents: [
      ag("Cloud Engineer", "Owns the platform", "Designs environment topology", "Automates provisioning", "Optimises spend", "Plans disaster recovery"),
      ag("Kubernetes Engineer", "Owns orchestration", "Writes manifests and Helm charts", "Configures autoscaling", "Sets resource limits and probes", "Handles zero-downtime rollouts"),
      ag("CI/CD Engineer", "Owns the pipeline", "Builds test-gated deployment flows", "Adds preview environments", "Automates rollback on failure", "Cuts build times"),
    ],
  },
  {
    slug: "legal-compliance",
    name: "Legal & Compliance Team",
    category: "Operations",
    tagline: "Policies and risk coverage for shipping fast.",
    monthly: 2399,
    yearly: 22999,
    capabilities: ["Privacy policies", "Terms of service", "GDPR guidance", "Compliance documentation", "Risk assessment"],
    agents: [
      ag("Policy Writer", "Owns public policies", "Drafts privacy policy and terms", "Writes refund and usage policies", "Keeps wording plain and readable", "Updates on feature changes"),
      ag("Compliance Analyst", "Owns the checklist", "Maps obligations to your product", "Documents data flows", "Prepares consent language", "Reviews vendor terms"),
      ag("Risk Assessor", "Owns the what-ifs", "Scores operational and legal risk", "Recommends mitigations", "Reviews contracts for exposure", "Maintains the risk register"),
    ],
  },
  {
    slug: "finance-business",
    name: "Finance & Business Team",
    category: "Operations",
    tagline: "Numbers, models and runway clarity.",
    monthly: 1999,
    yearly: 19199,
    capabilities: ["Financial forecasting", "Budget planning", "Revenue analytics", "KPI reports", "Business models"],
    agents: [
      ag("Financial Analyst", "Owns the model", "Builds revenue and cost projections", "Tracks burn and runway", "Runs scenario analysis", "Explains variance monthly"),
      ag("Budget Planner", "Owns the spend", "Allocates budget per team", "Flags overruns early", "Prioritises spend by ROI", "Maintains the cost dashboard"),
      ag("Revenue Strategist", "Owns monetisation", "Designs pricing and packaging", "Models upgrade and churn impact", "Finds expansion revenue paths", "Tests discount strategy"),
    ],
  },
];

export const BUNDLE = {
  slug: "company-bundle",
  name: "AI Company Bundle",
  tagline: "The complete AI organization — CEO, coordinator and every team.",
  monthly: 11999,
  yearly: 114999,
  includes: [
    "AI CEO",
    "Team Coordinator",
    "Every AI team",
    "Unlimited projects",
    "Unlimited agents",
    "Unlimited memory",
    "Shared knowledge base",
    "GitHub integration",
    "MCP support",
    "LangGraph workflows",
    "Workflow automation",
    "Human approval mode",
    "Autonomous mode",
    "Priority execution",
    "Premium AI models",
    "API access",
    "Team collaboration",
    "Project analytics",
    "Enterprise dashboard",
  ],
};

export const ENTERPRISE_FEATURES = [
  "Unlimited AI teams",
  "Unlimited AI agents",
  "Dedicated infrastructure",
  "Private cloud",
  "On-premise deployment",
  "SSO",
  "Audit logs",
  "Role based access control",
  "Team management",
  "Enterprise security",
  "SLA",
  "Priority support",
  "Custom AI teams",
  "White label platform",
  "Custom integrations",
];

export const TEAM_CATEGORIES = [
  "All",
  "Engineering",
  "Design",
  "Quality",
  "Growth",
  "Operations",
  "Intelligence",
] as const;

export const TASK_LIFECYCLE = [
  "Pending",
  "Assigned",
  "Planning",
  "In Progress",
  "Waiting Review",
  "Revision Required",
  "QA Testing",
  "Approved",
  "Completed",
  "Archived",
];

export const MEMORY_LAYERS = [
  "User memory",
  "Project memory",
  "Organization memory",
  "Code memory",
  "Design memory",
  "Documentation memory",
  "Research memory",
  "Business memory",
  "Decision history",
  "Knowledge graph",
  "Long-term memory",
  "Working memory",
];

export const TOTAL_AGENTS = AI_TEAMS.reduce((n, t) => n + t.agents.length, 0);

export function findTeam(slug: string) {
  if (slug === BUNDLE.slug) return { slug: BUNDLE.slug, name: BUNDLE.name, monthly: BUNDLE.monthly, yearly: BUNDLE.yearly };
  const t = AI_TEAMS.find((x) => x.slug === slug);
  return t ? { slug: t.slug, name: t.name, monthly: t.monthly, yearly: t.yearly } : null;
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
