export type Module = {
  id: string;
  title: string;
  summary: string;
  lessons: number;
  projects: number;
};

export type Track = {
  id: string;
  title: string;
  description: string;
  modules: Module[];
};

function modules(prefix: string, data: Array<Omit<Module, "id">>): Module[] {
  return data.map((module, index) => ({
    id: `${prefix}-m${index + 1}`,
    ...module,
  }));
}

export const tracks: Track[] = [
  {
    id: "html",
    title: "HTML",
    description:
      "Craft semantic documents, accessible landmarks, forms, and tables that give every page structure.",
    modules: modules("html", [
      {
        title: "Semantic structure",
        summary: "Landmarks, headings, lists, and copy that screen readers love.",
        lessons: 18,
        projects: 2,
      },
      {
        title: "Forms & inputs",
        summary: "Labels, validation, and advanced controls for real data entry.",
        lessons: 12,
        projects: 2,
      },
      {
        title: "Tables & data",
        summary: "Accessible tables, figures, and micro layouts for structured info.",
        lessons: 9,
        projects: 1,
      },
      {
        title: "Media & embeds",
        summary: "Images, video, and external embeds with fallbacks and captions.",
        lessons: 7,
        projects: 1,
      },
    ]),
  },
  {
    id: "css",
    title: "CSS",
    description:
      "Master cascade, layout systems, responsive design, and modern UI patterns with clean utility layers.",
    modules: modules("css", [
      {
        title: "Layout systems",
        summary: "Flexbox, grid, and responsive strategies.",
        lessons: 20,
        projects: 3,
      },
      {
        title: "Design tokens",
        summary: "Variables, theming, and utility layers.",
        lessons: 14,
        projects: 2,
      },
      {
        title: "Animation & polish",
        summary: "Transitions, keyframes, and high-fidelity UI states.",
        lessons: 11,
        projects: 1,
      },
    ]),
  },
  {
    id: "js",
    title: "JavaScript",
    description:
      "Fluency with the language, the DOM, async flow, and modular patterns across the stack.",
    modules: modules("js", [
      {
        title: "Language foundations",
        summary: "Syntax, data structures, and functions.",
        lessons: 22,
        projects: 2,
      },
      {
        title: "DOM & events",
        summary: "Manipulate the browser, handle input, and render state.",
        lessons: 18,
        projects: 2,
      },
      {
        title: "Async & APIs",
        summary: "Promises, fetch, and data-driven UI.",
        lessons: 14,
        projects: 2,
      },
      {
        title: "Architecture",
        summary: "Modules, bundlers, and testing fundamentals.",
        lessons: 10,
        projects: 1,
      },
    ]),
  },
  {
    id: "tailwind",
    title: "Tailwind",
    description:
      "Move fast with utility-first styling, design tokens, and component systems.",
    modules: modules("tailwind", [
      {
        title: "Utility mindset",
        summary: "Compose interfaces with small classes.",
        lessons: 12,
        projects: 2,
      },
      {
        title: "Design systems",
        summary: "Tokens, theming, and multi-brand styling.",
        lessons: 8,
        projects: 1,
      },
      {
        title: "Components",
        summary: "Reusable UI primitives, responsive patterns, and dark mode.",
        lessons: 9,
        projects: 1,
      },
    ]),
  },
  {
    id: "git",
    title: "Git & CLI",
    description: "Version control discipline and automation on the command line.",
    modules: modules("git", [
      {
        title: "Everyday Git",
        summary: "Commits, branches, and pull requests.",
        lessons: 10,
        projects: 1,
      },
      {
        title: "Collaboration",
        summary: "Rebase, bisect, and clean history.",
        lessons: 8,
        projects: 1,
      },
      {
        title: "CLI automation",
        summary: "Shell, scripts, and dotfiles that speed you up.",
        lessons: 9,
        projects: 1,
      },
    ]),
  },
  {
    id: "react",
    title: "React",
    description: "Component-driven thinking, hooks, and modern state patterns.",
    modules: modules("react", [
      {
        title: "Components",
        summary: "JSX, props, and composability.",
        lessons: 14,
        projects: 2,
      },
      {
        title: "Hooks",
        summary: "State, effects, memoization.",
        lessons: 12,
        projects: 2,
      },
      {
        title: "Architecture",
        summary: "Routing, data fetching, and testing.",
        lessons: 9,
        projects: 1,
      },
    ]),
  },
  {
    id: "next",
    title: "Next.js",
    description:
      "App Router layouts, server components, streaming data, and deployment-ready flows.",
    modules: modules("next", [
      {
        title: "Routing & layouts",
        summary: "App Router, nested UI, and shared state.",
        lessons: 11,
        projects: 1,
      },
      {
        title: "Server components",
        summary: "Data fetching, streaming, and caching.",
        lessons: 10,
        projects: 1,
      },
      {
        title: "Deploy & monitor",
        summary: "Vercel, envs, and observability.",
        lessons: 8,
        projects: 1,
      },
    ]),
  },
  {
    id: "node",
    title: "Node.js",
    description:
      "From scripts to services: build APIs, workers, and backend tooling on the V8 runtime.",
    modules: modules("node", [
      {
        title: "Runtime basics",
        summary: "Modules, npm, and tooling.",
        lessons: 12,
        projects: 1,
      },
      {
        title: "APIs",
        summary: "Express, routing, and persistence.",
        lessons: 15,
        projects: 2,
      },
      {
        title: "Workers",
        summary: "Queues, schedulers, and automation scripts.",
        lessons: 9,
        projects: 1,
      },
    ]),
  },
];
