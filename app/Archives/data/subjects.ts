export type Lesson = { id: string; title: string; summary: string; teachable?: boolean };
export type Subject = { id: string; title: string; trackId: string; trackTitle: string; lessons: Lesson[] };

export const subjects: Subject[] = [
  {
    id: "html", title: "HTML", trackId: "html", trackTitle: "HTML",
    lessons: [
      { id: "html-001", title: "Semantic tags", summary: "header, nav, main, section, article, aside, footer" },
      { id: "html-002", title: "Forms basics", summary: "label, input, textarea, select, button, accessibility" },
      { id: "html-003", title: "Media elements", summary: "<img>, <picture>, <video>, <audio>, responsive sources" },
    ]
  },
  {
    id: "css", title: "CSS", trackId: "css", trackTitle: "CSS",
    lessons: [
      { id: "css-001", title: "Cascade & specificity", summary: "origin, importance, specificity, order" },
      { id: "css-002", title: "Flexbox essentials", summary: "axis, wrap, gap, justify, align, order" },
      { id: "css-003", title: "Grid basics", summary: "tracks, areas, repeat, minmax, auto-flow" },
    ]
  },
  {
    id: "js", title: "JavaScript", trackId: "js", trackTitle: "JavaScript",
    lessons: [
      { id: "js-001", title: "Scope & closures", summary: "lexical scope, closure examples" },
      { id: "js-002", title: "Promises & async/await", summary: "thenables, async flow, error handling" },
      { id: "js-003", title: "Array methods", summary: "map, filter, reduce, find, some, every" },
    ]
  },
  {
    id: "tailwind", title: "Tailwind", trackId: "tailwind", trackTitle: "Tailwind",
    lessons: [
      { id: "tw-001", title: "Utility-first mental model", summary: "compose classes, design tokens" },
      { id: "tw-002", title: "Responsive variants", summary: "sm:, md:, lg:, xl:, 2xl:" },
      { id: "tw-003", title: "State & arbitrary values", summary: "hover:, focus:, [attr], aspect, arbitrary sizes" },
    ]
  },
  {
    id: "git", title: "Git & CLI", trackId: "git", trackTitle: "Git & CLI",
    lessons: [
      { id: "git-001", title: "Commit hygiene", summary: "atomic commits, messages, amend, rebase -i" },
      { id: "git-002", title: "Branch flow", summary: "feature branches, PRs, squash vs merge" },
      { id: "git-003", title: "CLI fundamentals", summary: "ls, cd, grep, pipes, redirection" },
    ]
  },
  {
    id: "react", title: "React", trackId: "react", trackTitle: "React",
    lessons: [
      { id: "react-001", title: "Hooks basics", summary: "useState, useEffect, deps, cleanup" },
      { id: "react-002", title: "Memoization", summary: "useMemo, useCallback, when to use" },
      { id: "react-003", title: "Server components (Next)", summary: "RSC vs Client, boundaries" },
    ]
  },
  {
    id: "next", title: "Next.js", trackId: "next", trackTitle: "Next.js",
    lessons: [
      { id: "next-001", title: "App Router", summary: "server-first, layouts, nested routes" },
      { id: "next-002", title: "Data fetching", summary: "fetch cache, revalidate, streaming" },
      { id: "next-003", title: "Static assets & images", summary: "public/, next/image basics" },
    ]
  },
  {
    id: "node", title: "Node.js", trackId: "node", trackTitle: "Node.js",
    lessons: [
      { id: "node-001", title: "Modules (ESM)", summary: "import/export, top-level await" },
      { id: "node-002", title: "FS & streams", summary: "fs/promises, readable/writable streams" },
      { id: "node-003", title: "Process & env", summary: "process.env, argv, exit codes" },
    ]
  },
];
