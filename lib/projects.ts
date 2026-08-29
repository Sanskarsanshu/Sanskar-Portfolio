import type { HeroCarouselItem } from "@/components/ui/hero-carousel";

export type ProjectDetail = {
  num: string;
  name: string;
  stack: string[];
  desc: string;
  details: string;
  url?: string;
  github?: string;
  /** Carousel slides for the project modal. Each item needs at least image + title. */
  media: HeroCarouselItem[];
  highlights?: string[];
  badge?: string;
  /** Accent hue used in the hero carousel backdrop when no media is set. */
  accent?: string;
  /** Optional logo or animation URL for the very first intro slide. */
  logo?: string;
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
    accent: "#205c8c",
    logo: "/projects/verisync/first.png",
    media: [
      {
        id: "vs-1",
        title: "Dashboard\nOverview",
        image: "/projects/verisync/mainpage.png",
        credit: "VERISYNC · ADMIN PORTAL",
        meta: ["150+ STUDENTS", "25+ SUBJECTS"],
        accent: "#205c8c",
      },
      {
        id: "vs-2",
        title: "QR Code\nAttendance",
        image: "/projects/verisync/page2.png",
        credit: "VERISYNC · LIVE SESSION",
        meta: ["DYNAMIC QR", "OTP + FACE ID"],
        accent: "#1a4a72",
      },
      {
        id: "vs-3",
        title: "Analytics\n& Reports",
        image: "",
        credit: "VERISYNC · ANALYTICS",
        meta: ["SUB-200MS API", "REAL-TIME"],
        accent: "#163d5e",
      },
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
    accent: "#7c3515",
    logo: "/projects/feedme/first.png",
    media: [
      {
        id: "fm-1",
        title: "Customer\nOrdering",
        image: "/projects/feedme/mainpage.png",
        credit: "FEEDME · CUSTOMER VIEW",
        meta: ["MULTI-ROLE", "REAL-TIME"],
        accent: "#7c3515",
      },
      {
        id: "fm-2",
        title: "Restaurant\nDashboard",
        image: "/projects/feedme/page2.png",
        credit: "FEEDME · OWNER PORTAL",
        meta: ["WEBSOCKETS", "LIVE ORDERS"],
        accent: "#612a10",
      },
      {
        id: "fm-3",
        title: "Delivery\nTracking",
        image: "",
        credit: "FEEDME · DELIVERY",
        meta: ["4 ROLES", "WEBHOOKS"],
        accent: "#4d2010",
      },
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
    accent: "#1a3a1a",
    logo: "/projects/ai-career/first.png",
    media: [
      {
        id: "ai-1",
        title: "Resume\nAnalyzer",
        image: "/projects/ai-career/mainpage.png",
        credit: "AI OS · LLM ENGINE",
        meta: ["ATS SCORING", "LLM MATCH"],
        accent: "#1a3a1a",
      },
      {
        id: "ai-2",
        title: "Outreach\nPipeline",
        image: "/projects/ai-career/page2.png",
        credit: "AI OS · EMAIL ENGINE",
        meta: ["CELERY", "AWS SES"],
        accent: "#152e15",
      },
      {
        id: "ai-3",
        title: "Multi-tenant\nSaaS",
        image: "",
        credit: "AI OS · ARCHITECTURE",
        meta: ["MICROSERVICES", "REDIS"],
        accent: "#102210",
      },
    ],
    highlights: ["fastapi", "python", "postgresql", "redis"],
    align: "left",
    section: "project3",
  },
];
