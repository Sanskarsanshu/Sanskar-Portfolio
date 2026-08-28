export type ProjectDetail = {
  num: string;
  name: string;
  stack: string[];
  desc: string;
  details: string;
  url?: string;
  github?: string;
  media: string[];
  highlights?: string[];
  badge?: string;
};

export type Project = ProjectDetail & {
  align: "left" | "right";
  section: string;
};

export const PROJECTS: Project[] = [
  {
    num: "01",
    name: "VeriSync",
    stack: [
      "TypeScript",
      "React",
      "Vite",
      "NestJS",
      "Prisma",
      "PostgreSQL",
      "Tailwind CSS",
    ],
    desc: "Production attendance management system handling 150+ concurrent students.",
    details:
      "A comprehensive role-based portal for admins, teachers, and students deployed at a college. Supports 25+ subjects with real-time analytics. Implemented dynamic QR codes, OTPs, and facial recognition for secure check-ins. Optimized for high concurrency, achieving sub-200ms API response times. Includes correction-request workflows and received strong stakeholder validation.",
    badge: "Production",
    media: [
      // TODO: Add screenshots to public/projects/verisync/
    ],
    highlights: ["typescript", "react", "postgresql"],
    align: "left",
    section: "project1",
  },
  {
    num: "02",
    name: "FeedMe",
    stack: ["React", "Node.js", "Express.js", "MySQL", "WebSockets"],
    desc: "Multi-role SaaS architecture for restaurant ordering and delivery.",
    details:
      "A robust multi-restaurant ordering platform built with real-time state synchronization. It features distinct role-based interfaces for Customers, Restaurant Owners, Staff, and Delivery Partners. Implemented the complete order-state workflow, restaurant onboarding, menu management, secure checkout, and WebSockets for real-time order status updates.",
    badge: "In Development",
    media: [
      // TODO: Add screenshots to public/projects/feedme/
    ],
    highlights: ["react", "nodedotjs"],
    align: "right",
    section: "project2",
  },
  {
    num: "03",
    name: "AI Career Outreach OS",
    stack: [
      "FastAPI",
      "React",
      "PostgreSQL",
      "OpenAI API",
      "LangChain",
      "Celery",
      "Redis",
      "AWS SES",
    ],
    desc: "Distributed SaaS for LLM-based resume analysis and career outreach.",
    details:
      "Architected a multi-tenant SaaS platform featuring an asynchronous email processing pipeline decoupled from the request lifecycle. The system uses Celery workers and Redis for throttling, bounce protection, and domain verification independently of the API. Built a stateless FastAPI microservice for AI resume scoring (ATS) and LLM job matching, scaling horizontally for high throughput.",
    media: [
      // TODO: Add screenshots to public/projects/outreach/
    ],
    highlights: ["fastapi", "python", "postgresql", "redis"],
    align: "left",
    section: "project3",
  },
];
