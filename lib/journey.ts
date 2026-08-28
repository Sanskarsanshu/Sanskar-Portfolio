export type JourneyItem = {
  role: string;
  organization: string;
  period: string;
  location?: string;
  summary: string;
  bullets: string[];
  stack: string[];
};

export const JOURNEY: JourneyItem[] = [
  {
    role: "Quantitative Research Consultant — Gold Level",
    organization: "WorldQuant BRAIN",
    period: "Oct 2025 — Jun 2026",
    location: "Remote",
    summary:
      "Earned Gold Level recognition (top tier among thousands of global participants) for consistent performance across alpha development, evaluation, and submission cycles.",
    bullets: [
      "Designed and back-tested 600+ quantitative alpha strategies using statistical time-series analysis, Python simulation, and optimization mathematics in WorldQuant's global research platform.",
      "Applied risk-adjusted strategy evaluation including Sharpe ratio analysis and drawdown controls to iteratively improve signal quality and reduce noise across multi-year historical datasets.",
    ],
    stack: ["Python", "Data Science", "Time-Series Analysis", "Optimization"],
  },
  {
    role: "B.Tech in Electronics & Communication Engineering",
    organization: "IIIT Dharwad",
    period: "2023 — 2027",
    location: "Dharwad, Karnataka",
    summary:
      "Undergraduate studies with a Minor in Cyber Security. CGPA: 7.79/10.",
    bullets: [
      "CS Electives: Data Structures & Algorithms, Computer Networks, Operating Systems, Database Management Systems.",
      "Coursework: TCP/IP & Socket Programming, Process Scheduling & Memory Management, OOP, Algorithm Design.",
    ],
    stack: ["C++", "C", "Java", "DSA", "System Design"],
  },
];

export type Achievement = {
  title: string;
  organization: string;
  position: string;
  description: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    title: "Wall Street Algo Trading Challenge 2025",
    organization: "The Wall Street Club & Algo-Analytics",
    position: "1st Place",
    description: "Top-ranked quantitative strategy among all submissions.",
  },
  {
    title: "YUKTI — Chip Design Challenge 2025",
    organization: "YUKTI",
    position: "1st Place",
    description:
      "Designed complete ASIC flow (RTL to GDSII) in Verilog with DRC/LVS-compliant layouts verified through full physical verification suite.",
  },
  {
    title: "Vidyut Vega Hackathon 2025",
    organization: "Vidyut Vega",
    position: "3rd Place",
    description:
      "Optimized a deep learning model for real-time inference on resource-constrained edge hardware using quantization and pruning techniques.",
  },
];
