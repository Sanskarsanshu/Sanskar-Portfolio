import type { Project } from "@/lib/projects";
import { PROJECTS } from "@/lib/projects";

// The types of output a command can return
export type CommandOutput = 
  | string // Simple text
  | { type: "system"; message: string } // System messages (like clears, errors)
  | { type: "action"; action: "open_project" | "open_url" | "change_dir"; payload: string } // Navigation actions
  | { type: "component"; component: React.ReactNode } // Rich JSX output
  | { type: "multi"; outputs: CommandOutput[] }; // Multiple outputs

export interface Command {
  name: string;
  description: string;
  execute: (args: string[]) => CommandOutput | Promise<CommandOutput>;
}

// Ensure exact profile links are used
const LINKS = {
  github: "https://github.com/Sanskarsanshu",
  linkedin: "https://www.linkedin.com/in/sanskar-19b21a2ba/",
  email: "mailto:iamsanskar92@gmail.com",
  resume: "/cv_en.pdf"
};

export const COMMANDS: Record<string, Command> = {
  whoami: {
    name: "whoami",
    description: "identity",
    execute: () => "sanskar\nFull-Stack Developer | Web Applications & Systems",
  },
  about: {
    name: "about",
    description: "about Sanskar",
    execute: () => 
      "I am a Full-Stack Developer specializing in architecting and deploying scalable web applications.\n" +
      "I build full-stack systems, AI-powered applications, and reliable web products from architecture to deployment.",
  },
  ls: {
    name: "ls",
    description: "list available sections",
    execute: (args) => {
      if (args[0] === "projects") return COMMANDS.projects.execute([]);
      return "projects/\nskills/\njourney/\nachievements/\nresume/\ncontact/";
    }
  },
  cd: {
    name: "cd",
    description: "change directory",
    execute: (args) => {
      const target = args[0] || "~";
      if (target === "~" || target === "/") return { type: "action", action: "change_dir", payload: "~" };
      const section = target.replace(/^\//, "");
      const valid = ["projects", "skills", "journey", "achievements", "resume", "contact"].includes(section);
      if (valid) return { type: "action", action: "change_dir", payload: `/${section}` };
      return { type: "system", message: `cd: ${target}: No such file or directory` };
    }
  },
  open: {
    name: "open",
    description: "open a link or file",
    execute: (args) => {
      const target = args[0]?.toLowerCase();
      if (!target) return { type: "system", message: "Usage: open <github|linkedin|resume|email>" };
      
      const cmd = COMMANDS[target];
      if (cmd && ["github", "linkedin", "resume", "email"].includes(target)) {
        return cmd.execute([]);
      }
      
      return { type: "system", message: `open: ${target}: No such file, link, or directory` };
    }
  },
  projects: {
    name: "projects",
    description: "list projects",
    execute: () => ({
      type: "multi",
      outputs: [
        { type: "action", action: "change_dir", payload: "/projects" },
        PROJECTS.map(p => `${p.num}  ${p.name}`).join("\n") + "\n\nType 'open <project-name>' to view details"
      ]
    })
  },
  "open": {
    name: "open",
    description: "open project or file (e.g. open verisync)",
    execute: (args) => {
      if (args.length === 0) return { type: "system", message: "Usage: open <project_name|resume>\nAvailable: verisync, feedme, career-os, resume" };
      
      const target = args[0].toLowerCase();
      
      if (target === "verisync") return { type: "action", action: "open_project", payload: "project1" };
      if (target === "feedme") return { type: "action", action: "open_project", payload: "project2" };
      if (target === "career-os") return { type: "action", action: "open_project", payload: "project3" };
      if (target === "resume") return { type: "action", action: "open_url", payload: LINKS.resume };
      
      return { type: "system", message: `No project or file found matching '${target}'` };
    }
  },
  skills: {
    name: "skills",
    description: "view technical stack",
    execute: () => ({
      type: "multi",
      outputs: [
        { type: "action", action: "change_dir", payload: "/skills" },
`FRONTEND
React
Next.js
TypeScript
JavaScript
HTML5
CSS3

BACKEND
Node.js
Express.js
FastAPI
Flask
REST APIs

DATABASES
PostgreSQL
MySQL
MongoDB
Redis

TOOLS
Git
GitHub
Docker
Kubernetes
Linux
CI/CD
Postman
Vercel
Railway

LANGUAGES
Python
C++
C`
      ]
    })
  },
  stack: {
    name: "stack",
    description: "alias for skills",
    execute: () => COMMANDS.skills.execute([])
  },
  journey: {
    name: "journey",
    description: "engineering journey",
    execute: () => ({
      type: "multi",
      outputs: [
        { type: "action", action: "change_dir", payload: "/journey" },
`2023 — 2027
IIIT Dharwad
B.Tech — Electronics & Communication Engineering
Minor — Cyber Security

2025 — 2026
WorldQuant BRAIN
Quantitative Research Consultant — Gold Level

2025
Wall Street Algo Trading Challenge
1st Place

2025
YUKTI Chip Design Challenge
1st Place

2025
Vidyut Vega Hackathon
3rd Place`
      ]
    })
  },
  experience: {
    name: "experience",
    description: "alias for journey",
    execute: () => COMMANDS.journey.execute([])
  },
  achievements: {
    name: "achievements",
    description: "achievements",
    execute: () => ({
      type: "multi",
      outputs: [
        { type: "action", action: "change_dir", payload: "/achievements" },
`01 — Wall Street Algo Trading Challenge 2025
     1st Place

02 — YUKTI Chip Design Challenge 2025
     1st Place

03 — Vidyut Vega Hackathon 2025
     3rd Place

04 — LeetCode
     300+ problems solved`
      ]
    })
  },
  resume: {
    name: "resume",
    description: "open resume",
    execute: () => ({ type: "action", action: "open_url", payload: LINKS.resume })
  },
  cat: {
    name: "cat",
    description: "print file contents (e.g. cat resume.txt)",
    execute: (args) => {
      if (args[0] === "resume.txt") {
        return "RESUME SUMMARY\n" +
               "Sanskar — Full-Stack Developer\n\n" +
               "EXPERIENCE\n" +
               "- WorldQuant BRAIN: Quantitative Research Consultant\n\n" +
               "PROJECTS\n" +
               "- VeriSync (Production Attendance System)\n" +
               "- FeedMe (Multi-Restaurant SaaS)\n" +
               "- AI Career Outreach OS (Distributed SaaS)\n\n" +
               "Type 'resume' to open full PDF.";
      }
      return { type: "system", message: `cat: ${args[0] || ''}: No such file or directory` };
    }
  },
  contact: {
    name: "contact",
    description: "contact information",
    execute: () => ({
      type: "multi",
      outputs: [
        { type: "action", action: "change_dir", payload: "/contact" },
`EMAIL
iamsanskar92@gmail.com

GITHUB
github.com/Sanskarsanshu

LINKEDIN
linkedin.com/in/sanskar-19b21a2ba/

LEETCODE
TODO — profile URL not provided yet`
      ]
    })
  },
  github: {
    name: "github",
    description: "open GitHub",
    execute: () => ({ type: "action", action: "open_url", payload: LINKS.github })
  },
  linkedin: {
    name: "linkedin",
    description: "open LinkedIn",
    execute: () => ({ type: "action", action: "open_url", payload: LINKS.linkedin })
  },
  email: {
    name: "email",
    description: "open Email client",
    execute: () => ({ type: "action", action: "open_url", payload: LINKS.email })
  },
  help: {
    name: "help",
    description: "show commands",
    execute: () => 
`AVAILABLE COMMANDS

whoami          identity
about           about Sanskar

ls              list available sections
projects        list projects
skills          view technical stack
journey         engineering journey
achievements    achievements

open <project>  open project (e.g., open verisync)
resume          open resume
cat resume.txt  resume summary

contact         contact information
github          open GitHub
linkedin        open LinkedIn

clear           clear terminal
history         command history
help            show commands
exit            return to portfolio`
  },
  
  // Easter Eggs
  sudo: {
    name: "sudo",
    description: "execute command as superuser",
    execute: (args) => {
      if (args.join(" ") === "hire sanskar") {
        return "[sudo] password for recruiter:\n\nNice try.\n\nYou can just contact me.";
      }
      return { type: "system", message: "sanskar is not in the sudoers file. This incident will be reported." };
    }
  },
  coffee: {
    name: "coffee",
    description: "brew coffee",
    execute: () => "Error 418: I'm a teapot."
  }
};

// Autocomplete dictionary
export const AUTOCOMPLETE_TERMS = [
  ...Object.keys(COMMANDS),
  "verisync",
  "feedme",
  "career-os",
  "resume.txt"
];
