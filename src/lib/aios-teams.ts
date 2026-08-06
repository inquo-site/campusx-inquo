export type AiTeam = {
  slug: string;
  name: string;
  category: "Engineering" | "Design" | "Quality" | "Growth" | "Operations" | "Intelligence";
  tagline: string;
  agents: string[];
  capabilities: string[];
  monthly: number;
  yearly: number;
  popular?: boolean;
};

/** All pricing in INR. Yearly ≈ 20% off (10 months). */
export const AI_TEAMS: AiTeam[] = [
  {
    slug: "software-engineering",
    name: "AI Software Engineering Team",
    category: "Engineering",
    tagline: "Ships apps, APIs and infrastructure end to end.",
    agents: ["Frontend Engineer", "Backend Engineer", "Full Stack Engineer", "Mobile Engineer", "API Engineer", "Database Engineer", "DevOps Engineer", "Cloud Engineer"],
    capabilities: ["Build applications", "Create APIs", "Database architecture", "Authentication", "AI integration", "Backend systems", "Deployment", "Performance optimization"],
    monthly: 3999,
    yearly: 38400,
  },
  {
    slug: "design",
    name: "UI/UX Design Team",
    category: "Design",
    tagline: "Turns product intent into interfaces people love.",
    agents: ["UI Designer", "UX Researcher", "Product Designer", "Graphic Designer", "Motion Designer", "Design System Architect"],
    capabilities: ["Wireframes", "UI design", "UX optimization", "Responsive design", "Component libraries", "Animations", "Design systems", "Figma export"],
    monthly: 2399,
    yearly: 22999,
  },
  {
    slug: "qa",
    name: "QA & Testing Team",
    category: "Quality",
    tagline: "Nothing ships until it survives this team.",
    agents: ["QA Engineer", "Automation Tester", "Performance Tester", "Security Tester"],
    capabilities: ["Unit testing", "Integration testing", "Performance testing", "Security testing", "Automation", "Bug reports"],
    monthly: 1999,
    yearly: 19199,
  },
  {
    slug: "bug-resolution",
    name: "Bug Resolution Team",
    category: "Quality",
    tagline: "Finds root causes, not symptoms.",
    agents: ["Error Analyzer", "Debugging Specialist", "Root Cause Expert"],
    capabilities: ["Detect bugs", "Fix bugs", "Error analysis", "Root cause detection", "Regression prevention", "Log analysis"],
    monthly: 1249,
    yearly: 11999,
  },
  {
    slug: "code-review",
    name: "Code Review Team",
    category: "Quality",
    tagline: "Senior-level review on every change.",
    agents: ["Senior Software Reviewer", "Security Reviewer", "Architecture Reviewer"],
    capabilities: ["Code review", "Performance review", "Architecture review", "Security review", "Best practices", "Refactoring suggestions"],
    monthly: 1249,
    yearly: 11999,
  },
  {
    slug: "research",
    name: "AI Research Team",
    category: "Intelligence",
    tagline: "Reads the docs so your teams don't guess.",
    agents: ["Technology Researcher", "Documentation Researcher", "Framework Analyst", "AI Reasoning Specialist"],
    capabilities: ["Documentation search", "Framework comparison", "Market research", "AI reasoning", "Best practices", "Competitor analysis"],
    monthly: 1599,
    yearly: 15349,
  },
  {
    slug: "documentation",
    name: "Documentation Team",
    category: "Operations",
    tagline: "Every deliverable arrives documented.",
    agents: ["Technical Writer", "README Writer", "API Documentation Writer"],
    capabilities: ["README", "Documentation", "User guides", "API docs", "Architecture documents", "Changelogs"],
    monthly: 749,
    yearly: 7199,
  },
  {
    slug: "product-strategy",
    name: "Product Strategy Team",
    category: "Intelligence",
    tagline: "Decides what to build before anyone builds it.",
    agents: ["Product Manager", "Business Analyst", "Market Analyst"],
    capabilities: ["Product roadmap", "Feature prioritization", "Business analysis", "Product planning", "User journey"],
    monthly: 1599,
    yearly: 15349,
  },
  {
    slug: "marketing",
    name: "Marketing Team",
    category: "Growth",
    tagline: "Distribution engine for whatever you ship.",
    agents: ["SEO Expert", "Content Writer", "Copywriter", "Social Media Strategist"],
    capabilities: ["SEO", "Blog writing", "Landing pages", "Email campaigns", "Ads", "Marketing strategy"],
    monthly: 1999,
    yearly: 19199,
  },
  {
    slug: "sales",
    name: "Sales Team",
    category: "Growth",
    tagline: "Pipeline, proposals and follow-ups on autopilot.",
    agents: ["Sales Representative", "CRM Manager", "Proposal Writer"],
    capabilities: ["Lead generation", "CRM", "Proposal creation", "Follow ups", "Sales outreach"],
    monthly: 1999,
    yearly: 19199,
  },
  {
    slug: "customer-success",
    name: "Customer Success Team",
    category: "Growth",
    tagline: "Answers your users while you sleep.",
    agents: ["Support Specialist", "Knowledge Base Manager", "AI Chat Assistant"],
    capabilities: ["Customer support", "FAQ", "Tickets", "Documentation", "Live AI chat"],
    monthly: 1249,
    yearly: 11999,
  },
  {
    slug: "data-analytics",
    name: "Data Analytics Team",
    category: "Intelligence",
    tagline: "Turns raw tables into decisions.",
    agents: ["SQL Analyst", "BI Analyst", "Dashboard Engineer"],
    capabilities: ["Dashboards", "Reports", "Forecasting", "KPIs", "SQL analysis", "Data visualization"],
    monthly: 2399,
    yearly: 22999,
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity Team",
    category: "Quality",
    tagline: "Audits, threats and compliance, continuously.",
    agents: ["Security Analyst", "Threat Hunter", "Compliance Specialist"],
    capabilities: ["Vulnerability scan", "Security audit", "Threat detection", "Compliance", "Security reports"],
    monthly: 3249,
    yearly: 31199,
  },
  {
    slug: "devops-cloud",
    name: "DevOps & Cloud Team",
    category: "Engineering",
    tagline: "Pipelines, clusters and uptime.",
    agents: ["Cloud Engineer", "Kubernetes Engineer", "CI/CD Engineer"],
    capabilities: ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "Monitoring", "CI/CD"],
    monthly: 2899,
    yearly: 27899,
  },
  {
    slug: "legal-compliance",
    name: "Legal & Compliance Team",
    category: "Operations",
    tagline: "Policies and risk coverage for shipping fast.",
    agents: ["Policy Writer", "Compliance Analyst", "Risk Assessor"],
    capabilities: ["Privacy policies", "Terms of service", "GDPR guidance", "Compliance documentation", "Risk assessment"],
    monthly: 2399,
    yearly: 22999,
  },
  {
    slug: "finance-business",
    name: "Finance & Business Team",
    category: "Operations",
    tagline: "Numbers, models and runway clarity.",
    agents: ["Financial Analyst", "Budget Planner", "Revenue Strategist"],
    capabilities: ["Financial forecasting", "Budget planning", "Revenue analytics", "KPI reports", "Business models"],
    monthly: 1999,
    yearly: 19199,
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

export function findTeam(slug: string) {
  if (slug === BUNDLE.slug) return { slug: BUNDLE.slug, name: BUNDLE.name, monthly: BUNDLE.monthly, yearly: BUNDLE.yearly };
  const t = AI_TEAMS.find((x) => x.slug === slug);
  return t ? { slug: t.slug, name: t.name, monthly: t.monthly, yearly: t.yearly } : null;
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
