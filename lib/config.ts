// Centralized portfolio configuration & telemetry metadata
export const SITE_CONFIG = {
  name: "Sanskar",
  title: "Sanskar — Full Stack Developer",
  role: "Full Stack Developer | Web Applications & Systems",
  tagline:
    "I build full-stack systems, AI-powered applications, and reliable web products from architecture to deployment.",
  currentFocus: [
    "Full-Stack Web Applications",
    "Systems & API Engineering",
  ],
  // Configured status - explicitly labeled as configured portfolio status, not inferred
  statusLabel: "CODING",
  systemStatus: "OPERATIONAL",
  timezone: "Asia/Kolkata",
  timezoneCode: "IST",
  utcOffset: "UTC+5:30",
  githubUsername: "Sanskarsanshu",
  githubUrl: "https://github.com/Sanskarsanshu",
  email: "iamsanskar92@gmail.com",
  linkedinUrl: "https://www.linkedin.com/in/sanskar-19b21a2ba/",
  leetcodeUrl: "https://leetcode.com", // update when live
  resumeUrl: "/cv_en.pdf",
  deployment: {
    runtime: "Next.js 16 (Webpack Standalone)",
    environment: process.env.NODE_ENV || "development",
    commitHash: "e0cc15e",
  },
} as const;
