// Minimal i18n layer: a single dictionary keyed by dot-path, with each leaf
// carrying both the ES and EN copy. Consumers read via `useLanguage().t()`
// which resolves the path for the active language. Keeping it flat and
// co-located (rather than adding a dependency like next-intl) keeps the
// project tiny and makes the strings easy to audit.
export type Lang = "es" | "en";

export const LANGUAGES: Lang[] = ["es", "en"];
export const DEFAULT_LANG: Lang = "es";

export const DICT = {
  picker: {
    season: "Season",
  },
  seasons: {
    spring: "Spring",
    summer: "Summer",
    autumn: "Autumn",
    winter: "Winter",
  },
  nav: {
    aria: "Sections",
    home: "Home",
    stack: "Stack",
    experience: "Journey",
    project: "Project",
    contact: "Contact",
  },
  header: {
    availability: "Open to opportunities",
  },
  hero: {
    greeting: "Hi, I am",
    roleLine: "Full Stack Developer | Web Applications & Systems",
    tagline: "I build full-stack systems, AI-powered applications, and reliable web products from architecture to deployment.",
    cv: "View Resume",
    hire: "Contact me",
    scroll: "Scroll to explore",
    keysHint: "· hover over the keys",
  },
  stack: {
    title: "Tech Stack",
    hint: "(hint: hover over a key)",
    hintMobile: "The tools I build with.",
  },
  experience: {
    title: "Engineering Journey",
    subtitle: "My professional journey, projects, and achievements.",
  },
  projects: {
    kicker: "project",
    viewMore: "View more",
    openSite: "Visit site",
    viewCode: "View code",
    close: "Close",
    stackLabel: "Stack",
    overview: "Overview",
  },
  contact: {
    kicker: "contact",
    title: "Let's build something.",
    body: "Have a project, opportunity, or idea worth building? The keyboard is ready for the first message.",
    copyEmail: "Copy email",
    openMail: "Email Me",
    github: "GitHub",
    linkedin: "LinkedIn",
    leetcode: "LeetCode",
    emailToast: "Email copied",
    footer: "© 2026 Sanskar. All rights reserved.",
  },
  keyboard: {
    taglines: {
      javascript: "Where it all started. Still here, still in charge.",
      typescript: "Type-safe systems. Same JS, with a seatbelt.",
      python: "Reads like English, scales like a rocket.",
      cplusplus: "High performance, close to the metal.",
      html5: "The structural bones of the web.",
      css: "The aesthetic layer of the web.",
      react: "Component-driven user interfaces.",
      nextdotjs: "Production-grade React: routing, SSR, edge.",
      nodedotjs: "Asynchronous JavaScript on the server.",
      fastapi: "High-performance Python APIs.",
      postgresql: "The boring database that always works.",
      redis: "In-memory speed and message brokering.",
      docker: "Containerized environments. Same everywhere.",
      linux: "The backbone of modern deployment.",
      git: "History and a time machine for your code.",
    },
  },
} as const;

type Node = string | { [key: string]: Node };

export function translate(path: string): string {
  const parts = path.split(".");
  let ref: Node = DICT as unknown as Node;
  for (const p of parts) {
    if (typeof ref === "string") return path;
    ref = (ref as { [key: string]: Node })[p];
    if (ref === undefined) return path;
  }
  if (typeof ref === "string") return ref;
  return path;
}

