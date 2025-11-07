export type QuizItem = {
  q: string;
  choices: string[];
  answer: number; // index in choices
};

export type MicroConcept = {
  id: string;       // e.g., "html-foundations"
  nodeId: string;   // links to Tower node, e.g., "html-t1"
  trackId: string;  // e.g., "html"
  trackTitle: string;
  title: string;
  lesson: string;   // short learn text
  quiz: QuizItem[];
};

export const concepts: MicroConcept[] = [
  {
    id: "html-foundations",
    nodeId: "html-t1",
    trackId: "html",
    trackTitle: "HTML",
    title: "Semantic structure",
    lesson: "HTML gives meaning to content. Prefer semantic tags (<header>, <main>, <section>, <article>, <nav>, <footer>) over generic <div> when they match the content purpose.",
    quiz: [
      { q: "Which element best wraps the primary page content?",
        choices: ["<div>", "<main>", "<section>", "<article>"], answer: 1 },
      { q: "A group of site-wide links goes in…",
        choices: ["<nav>", "<footer>", "<aside>", "<header>"], answer: 0 },
    ],
  },
  {
    id: "css-foundations",
    nodeId: "css-t1",
    trackId: "css",
    trackTitle: "CSS",
    title: "Cascade & specificity",
    lesson: "The cascade resolves conflicts using specificity and source order. Utility-first (Tailwind) keeps specificity low and predictable by composing classes in markup.",
    quiz: [
      { q: "Which has higher specificity?", choices: [".card .title", "#title", "h1.title", ".title"], answer: 1 },
      { q: "Utility-first CSS (like Tailwind) helps by…",
        choices: ["increasing specificity", "avoiding CSS entirely", "keeping styles composable with low-specificity classes", "forcing inline styles"], answer: 2 },
    ],
  },
  {
    id: "js-foundations",
    nodeId: "js-t1",
    trackId: "js",
    trackTitle: "JavaScript",
    title: "Values & references",
    lesson: "Primitives (string, number, boolean, null, undefined, symbol, bigint) copy by value; objects/arrays/functions copy by reference.",
    quiz: [
      { q: "Arrays in JS are…", choices: ["primitives", "by-value", "by-reference objects", "immutable"], answer: 2 },
      { q: "Which copies by value?", choices: ["{}", "[]", "function(){}", "42"], answer: 3 },
    ],
  },
  {
    id: "tailwind-foundations",
    nodeId: "tailwind-t1",
    trackId: "tailwind",
    trackTitle: "Tailwind",
    title: "Utility mindset",
    lesson: "Compose small utility classes in your markup. Reach for CSS files only when necessary (components, complex states) to keep velocity high (TFX).",
    quiz: [
      { q: "Prefer CSS files when…",
        choices: ["simple spacing & color", "one-off layout tweaks", "component with complex state/styles reused widely", "never"], answer: 2 },
      { q: "Tailwind utilities are applied…", choices: ["in .css files", "inline as class names", "only via @apply", "not in React"], answer: 1 },
    ],
  },
  {
    id: "git-foundations",
    nodeId: "git-t1",
    trackId: "git",
    trackTitle: "Git & CLI",
    title: "Commit small & often",
    lesson: "Small commits with clear messages make history readable. Use branches for features, PRs for review, and tags/releases for milestones.",
    quiz: [
      { q: "Good commit messages are…",
        choices: ["vague", "long & meandering", "concise & imperative", "emoji-only"], answer: 2 },
      { q: "Stable milestones are best marked with…",
        choices: ["branches", "releases/tags", "merge commits", "stash"], answer: 1 },
    ],
  },
  {
    id: "react-foundations",
    nodeId: "react-t1",
    trackId: "react",
    trackTitle: "React",
    title: "State → UI",
    lesson: "React renders UI from state. Keep components pure when possible; lift state up; use hooks for side effects and data fetching.",
    quiz: [
      { q: "UI should be derived from…", choices: ["DOM mutations", "global vars", "state", "timers"], answer: 2 },
      { q: "Side effects belong in…", choices: ["useEffect", "render body", "className", "CSS"], answer: 0 },
    ],
  },
  {
    id: "next-foundations",
    nodeId: "next-t1",
    trackId: "next",
    trackTitle: "Next.js",
    title: "App Router basics",
    lesson: "The App Router uses nested layouts, server components by default, and client components with 'use client'. Keep data fetching on the server when possible.",
    quiz: [
      { q: "Server components are…", choices: ["default", "opt-in only", "deprecated", "client-only"], answer: 0 },
      { q: "Mark a component as client with…", choices: ["'client'", "'use client'", "// client", "<Client/>"], answer: 1 },
    ],
  },
  {
    id: "node-foundations",
    nodeId: "node-t1",
    trackId: "node",
    trackTitle: "Node.js",
    title: "Modules & runtime",
    lesson: "Node runs JS outside the browser. Prefer ESM imports, use npm scripts, and learn async patterns (promises/async-await).",
    quiz: [
      { q: "Modern import style is…", choices: ["require()", "import … from …", "eval()", "XMLHttpRequest"], answer: 1 },
      { q: "Async flow is best handled with…", choices: ["callbacks only", "promises/async-await", "busy-wait loops", "setInterval"], answer: 1 },
    ],
  },
];
