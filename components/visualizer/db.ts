import Dexie, { type EntityTable } from "dexie";
import type { Tree, TreeNode, TreeEdge } from "./types";

export class VisualizerDatabase extends Dexie {
  trees!: EntityTable<Tree, "id">;
  nodes!: EntityTable<TreeNode, "id">;
  edges!: EntityTable<TreeEdge, "id">;

  constructor() {
    super("DecisionTreeVisualizerDB");
    this.version(1).stores({
      trees: "id, title, updatedAt",
      nodes: "id, treeId, parentId, type, [treeId+parentId]",
      edges: "id, treeId, source, target, [treeId+source], [treeId+target]",
    });
  }
}

export const db = new VisualizerDatabase();

export async function seedMockData(): Promise<void> {
  if (typeof indexedDB === "undefined") return;

  const existingTree = await db.trees.get("job-search");
  if (existingTree) return;

  const now = Date.now();

  await db.trees.put({
    id: "job-search",
    title: "Job Search",
    description:
      "Progression of an unemployed fullstack software engineer landing a job.",
    createdAt: now,
    updatedAt: now,
  });

  const nodes: TreeNode[] = [
    {
      id: "root",
      treeId: "job-search",
      parentId: null,
      type: "TreeNode",
      data: {
        label: "Unemployed & Stressed",
        description:
          "Starting point: Currently unemployed fullstack software engineer feeling the pressure of the job hunt.",
        category: "status",
        status: "completed",
        tags: ["start", "status"],
      },
    },
    {
      id: "health",
      treeId: "job-search",
      parentId: "root",
      type: "TreeNode",
      data: {
        label: "Maintain Physical & Mental Health",
        description:
          "Establish a daily routine: exercise, proper sleep, meditation, and healthy boundaries to stay positive and avoid burnout.",
        category: "mindset",
        status: "completed",
        tags: ["health", "wellness"],
      },
    },
    {
      id: "prep",
      treeId: "job-search",
      parentId: "root",
      type: "TreeNode",
      data: {
        label: "Audit & Update Application Materials",
        description:
          "Revamp resume, GitHub profile, LinkedIn, and personal portfolio website to highlight fullstack and modern AI achievements.",
        category: "preparation",
        status: "completed",
        tags: ["resume", "portfolio"],
      },
    },
    {
      id: "skills",
      treeId: "job-search",
      parentId: "root",
      type: "TreeNode",
      data: {
        label: "Stay Up-to-Date on Tech & AI",
        description:
          "Continuously learn and build with the latest tech stack: TypeScript, Next.js App Router, React 19, and modern AI/LLM tools.",
        category: "skills",
        status: "completed",
        tags: ["upskill", "ai"],
      },
    },
    {
      id: "routine",
      treeId: "job-search",
      parentId: "health",
      type: "TreeNode",
      data: {
        label: "Daily Structure & Mindfulness",
        description:
          "Treat the job search like a structured job with set hours, regular walks, breaks, and community support.",
        category: "mindset",
        status: "completed",
        tags: ["routine", "habits"],
      },
    },
    {
      id: "resume",
      treeId: "job-search",
      parentId: "prep",
      type: "TreeNode",
      data: {
        label: "Create ATS-Friendly Resume",
        description:
          'Tailor bullet points with quantifiable metrics (e.g., "Reduced latency by 40%", "Integrated LLM pipelines").',
        category: "preparation",
        status: "completed",
        tags: ["resume", "ats"],
      },
    },
    {
      id: "portfolio",
      treeId: "job-search",
      parentId: "prep",
      type: "TreeNode",
      data: {
        label: "Showcase Fullstack AI Projects",
        description:
          "Deploy live fullstack applications demonstrating frontend UX, backend scalability, and AI integrations.",
        category: "preparation",
        status: "completed",
        tags: ["projects", "fullstack"],
      },
    },
    {
      id: "opensource",
      treeId: "job-search",
      parentId: "skills",
      type: "TreeNode",
      data: {
        label: "Contribute to Open-Source Repos",
        description:
          "Contribute code, bug fixes, and documentation to popular OSS repos to build credibility and network with maintainers.",
        category: "skills",
        status: "completed",
        tags: ["oss", "github"],
      },
    },
    {
      id: "ai-tools",
      treeId: "job-search",
      parentId: "skills",
      type: "TreeNode",
      data: {
        label: "Master AI-Assisted Dev Workflows",
        description:
          "Adopt Cursor, GitHub Copilot, and Claude to accelerate coding speed and demonstrate modern AI engineering productivity.",
        category: "skills",
        status: "completed",
        tags: ["copilot", "cursor"],
      },
    },
    {
      id: "search",
      treeId: "job-search",
      parentId: "routine",
      type: "TreeNode",
      data: {
        label: "Find Job Listings & Opportunities",
        description:
          "Source fullstack roles across LinkedIn, Wellfound, HackerNews Who Is Hiring, tech job boards, and company career pages.",
        category: "search",
        status: "in-progress",
        tags: ["sourcing", "job-boards"],
      },
    },
    {
      id: "dec-referral",
      treeId: "job-search",
      parentId: "search",
      type: "TreeNode",
      data: {
        label: "Do you have a connection or referral?",
        description:
          "Check LinkedIn and developer communities to see if you know anyone at the target company.",
        category: "search",
        status: "in-progress",
        tags: ["networking", "referrals"],
      },
    },
    {
      id: "referral-outreach",
      treeId: "job-search",
      parentId: "dec-referral",
      type: "TreeNode",
      data: {
        label: "Request Warm Referral",
        description:
          "Reach out to contacts with a polite, concise message explaining your fit and asking for an internal referral.",
        category: "outreach",
        status: "in-progress",
        tags: ["referral", "networking"],
      },
    },
    {
      id: "cold-outreach",
      treeId: "job-search",
      parentId: "dec-referral",
      type: "TreeNode",
      data: {
        label: "Targeted Cold Outreach & Follow-ups",
        description:
          "Send personalized messages to engineering managers and recruiters on LinkedIn or email after submitting your application.",
        category: "outreach",
        status: "in-progress",
        tags: ["cold-email", "recruiter"],
      },
    },
    {
      id: "apply",
      treeId: "job-search",
      parentId: "referral-outreach",
      type: "TreeNode",
      data: {
        label: "Submit Tailored Application",
        description:
          "Submit resume and customized cover letter/note emphasizing relevant fullstack and AI capabilities.",
        category: "outreach",
        status: "in-progress",
        tags: ["application", "submit"],
      },
    },
    {
      id: "follow-up",
      treeId: "job-search",
      parentId: "apply",
      type: "TreeNode",
      data: {
        label: "Send Timely Follow-ups",
        description:
          "Follow up politely after 5-7 business days if no initial response is received.",
        category: "outreach",
        status: "in-progress",
        tags: ["follow-up", "email"],
      },
    },
    {
      id: "dec-interview",
      treeId: "job-search",
      parentId: "follow-up",
      type: "TreeNode",
      data: {
        label: "Did you get selected for an interview?",
        description: "Evaluate application response from the recruitment team.",
        category: "interview",
        status: "in-progress",
        tags: ["screening", "decision"],
      },
    },
    {
      id: "rejection-loop",
      treeId: "job-search",
      parentId: "dec-interview",
      type: "TreeNode",
      data: {
        label: "Request Feedback & Iterate",
        description:
          "Stay positive, analyze any feedback, refine resume/outreach approach, and loop back to finding listings.",
        category: "mindset",
        status: "completed",
        tags: ["resilience", "iterate"],
      },
    },
    {
      id: "interview-prep",
      treeId: "job-search",
      parentId: "dec-interview",
      type: "TreeNode",
      data: {
        label: "Prepare for Technical & Behavioral Interviews",
        description:
          "Practice fullstack system design, live coding/algorithms, AI architecture discussions, and STAR behavioral stories.",
        category: "interview",
        status: "in-progress",
        tags: ["system-design", "algorithms"],
      },
    },
    {
      id: "tech-screen",
      treeId: "job-search",
      parentId: "interview-prep",
      type: "TreeNode",
      data: {
        label: "Ace the Fullstack & System Design Rounds",
        description:
          "Demonstrate deep technical competence in frontend architecture, backend APIs, database design, and clear communication.",
        category: "interview",
        status: "pending",
        tags: ["coding", "architecture"],
      },
    },
    {
      id: "dec-offer",
      treeId: "job-search",
      parentId: "tech-screen",
      type: "TreeNode",
      data: {
        label: "Did you receive a job offer?",
        description: "Post-interview evaluation and offer decision.",
        category: "interview",
        status: "pending",
        tags: ["offer", "decision"],
      },
    },
    {
      id: "post-interview-review",
      treeId: "job-search",
      parentId: "dec-offer",
      type: "TreeNode",
      data: {
        label: "Review Performance & Maintain Resilience",
        description:
          "Keep spirits high, document technical questions asked, identify areas for improvement, and continue active pipeline.",
        category: "mindset",
        status: "pending",
        tags: ["resilience", "learning"],
      },
    },
    {
      id: "negotiate",
      treeId: "job-search",
      parentId: "dec-offer",
      type: "TreeNode",
      data: {
        label: "Evaluate & Negotiate Offer",
        description:
          "Analyze compensation package (base, equity, benefits, remote flexibility) and professionally negotiate terms.",
        category: "outcome",
        status: "pending",
        tags: ["negotiation", "compensation"],
      },
    },
    {
      id: "employed",
      treeId: "job-search",
      parentId: "negotiate",
      type: "TreeNode",
      data: {
        label: "Employed & Not Stressed 🎉",
        description:
          "Goal accomplished! Landed a rewarding Fullstack Software Engineer role, achieved financial stability, and regained peace of mind.",
        category: "outcome",
        status: "pending",
        tags: ["employed", "goal-met", "success"],
      },
    },
  ];

  const edges: TreeEdge[] = [
    {
      id: "edge-root-health",
      treeId: "job-search",
      source: "root",
      target: "health",
      label: "Pillar 1",
      type: "TreeEdge",
    },
    {
      id: "edge-root-prep",
      treeId: "job-search",
      source: "root",
      target: "prep",
      label: "Pillar 2",
      type: "TreeEdge",
    },
    {
      id: "edge-root-skills",
      treeId: "job-search",
      source: "root",
      target: "skills",
      label: "Pillar 3",
      type: "TreeEdge",
    },
    {
      id: "edge-health-routine",
      treeId: "job-search",
      source: "health",
      target: "routine",
      type: "TreeEdge",
    },
    {
      id: "edge-prep-resume",
      treeId: "job-search",
      source: "prep",
      target: "resume",
      type: "TreeEdge",
    },
    {
      id: "edge-prep-portfolio",
      treeId: "job-search",
      source: "prep",
      target: "portfolio",
      type: "TreeEdge",
    },
    {
      id: "edge-skills-opensource",
      treeId: "job-search",
      source: "skills",
      target: "opensource",
      type: "TreeEdge",
    },
    {
      id: "edge-skills-aitools",
      treeId: "job-search",
      source: "skills",
      target: "ai-tools",
      type: "TreeEdge",
    },
    {
      id: "edge-routine-search",
      treeId: "job-search",
      source: "routine",
      target: "search",
      type: "TreeEdge",
    },
    {
      id: "edge-resume-search",
      treeId: "job-search",
      source: "resume",
      target: "search",
      type: "TreeEdge",
    },
    {
      id: "edge-portfolio-search",
      treeId: "job-search",
      source: "portfolio",
      target: "search",
      type: "TreeEdge",
    },
    {
      id: "edge-opensource-search",
      treeId: "job-search",
      source: "opensource",
      target: "search",
      type: "TreeEdge",
    },
    {
      id: "edge-aitools-search",
      treeId: "job-search",
      source: "ai-tools",
      target: "search",
      type: "TreeEdge",
    },
    {
      id: "edge-search-decreferral",
      treeId: "job-search",
      source: "search",
      target: "dec-referral",
      type: "TreeEdge",
    },
    {
      id: "edge-decreferral-referral",
      treeId: "job-search",
      source: "dec-referral",
      target: "referral-outreach",
      label: "Yes",
      type: "TreeEdge",
    },
    {
      id: "edge-decreferral-cold",
      treeId: "job-search",
      source: "dec-referral",
      target: "cold-outreach",
      label: "No",
      type: "TreeEdge",
    },
    {
      id: "edge-referral-apply",
      treeId: "job-search",
      source: "referral-outreach",
      target: "apply",
      type: "TreeEdge",
    },
    {
      id: "edge-cold-apply",
      treeId: "job-search",
      source: "cold-outreach",
      target: "apply",
      type: "TreeEdge",
    },
    {
      id: "edge-apply-followup",
      treeId: "job-search",
      source: "apply",
      target: "follow-up",
      type: "TreeEdge",
    },
    {
      id: "edge-followup-decinterview",
      treeId: "job-search",
      source: "follow-up",
      target: "dec-interview",
      type: "TreeEdge",
    },
    {
      id: "edge-decinterview-rejection",
      treeId: "job-search",
      source: "dec-interview",
      target: "rejection-loop",
      label: "No",
      type: "TreeEdge",
    },
    {
      id: "edge-rejection-search",
      treeId: "job-search",
      source: "rejection-loop",
      target: "search",
      label: "Iterate & Retry",
      type: "TreeEdge",
      animated: true,
    },
    {
      id: "edge-decinterview-prep",
      treeId: "job-search",
      source: "dec-interview",
      target: "interview-prep",
      label: "Yes",
      type: "TreeEdge",
    },
    {
      id: "edge-prep-techscreen",
      treeId: "job-search",
      source: "interview-prep",
      target: "tech-screen",
      type: "TreeEdge",
    },
    {
      id: "edge-techscreen-decoffer",
      treeId: "job-search",
      source: "tech-screen",
      target: "dec-offer",
      type: "TreeEdge",
    },
    {
      id: "edge-decoffer-postreview",
      treeId: "job-search",
      source: "dec-offer",
      target: "post-interview-review",
      label: "No",
      type: "TreeEdge",
    },
    {
      id: "edge-postreview-search",
      treeId: "job-search",
      source: "post-interview-review",
      target: "search",
      label: "Refine Pipeline",
      type: "TreeEdge",
      animated: true,
    },
    {
      id: "edge-decoffer-negotiate",
      treeId: "job-search",
      source: "dec-offer",
      target: "negotiate",
      label: "Yes",
      type: "TreeEdge",
    },
    {
      id: "edge-negotiate-employed",
      treeId: "job-search",
      source: "negotiate",
      target: "employed",
      label: "Success!",
      type: "TreeEdge",
    },
  ];

  await db.nodes.bulkPut(nodes);
  await db.edges.bulkPut(edges);
}

export async function ensureMockData(): Promise<void> {
  if (typeof indexedDB === "undefined") return;

  try {
    const count = await db.trees.count();
    if (count === 0) {
      await seedMockData();
    } else {
      const jobTree = await db.trees.get("job-search");
      if (!jobTree) {
        await seedMockData();
      }
    }
  } catch (err) {
    console.error("Error ensuring mock data:", err);
  }
}

db.on("populate", () => {
  void seedMockData();
});
