export type Lesson = {
  id: string;
  title: string;
  summary: string;
  type?: "project" | "lesson";
};

export type Section = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type LearningPath = {
  id: string;
  title: string;
  overview: string;
  description: string;
  sections: Section[];
};

export type MicroConcept = {
  id: string;
  nodeId: string;
  trackId: string;
  trackTitle: string;
  title: string;
  lesson: string;
};

export const htmlCssPath: LearningPath = {
  id: "html-css-foundations",
  title: "HTML & CSS Foundations",
  overview:
    "Start with beginner-friendly lessons that combine semantic HTML and expressive CSS. Each checklist mirrors the Odin Project structure — complete them in order to unlock bigger projects.",
  description:
    "This merged path guides you through structuring documents, styling them, and shipping polished layouts. Every section contains quick lessons plus a project when you're ready to apply the skills.",
  sections: [
    {
      id: "html-basics",
      title: "Beginner HTML Concepts",
      lessons: [
        {
          id: "intro",
          title: "Introduction",
          summary: "Understand HTML anatomy, required tags, and how browsers parse documents.",
        },
        {
          id: "emmet",
          title: "Emmet & productivity",
          summary: "Use shorthand expansions to scaffold markup in seconds.",
        },
        {
          id: "headings-lists",
          title: "Headings, lists, & text",
          summary: "Craft accessible outlines with headings, paragraphs, ordered/unordered lists.",
        },
        {
          id: "links-media",
          title: "Links & media",
          summary: "Add navigation, images, audio/video, and alt text best practices.",
        },
        {
          id: "tables",
          title: "Tables",
          summary: "Display tabular data with <table>, <thead>, <tbody>, and scoped headers.",
        },
      ],
    },
    {
      id: "css-basics",
      title: "Beginner CSS Concepts",
      lessons: [
        {
          id: "defaults",
          title: "Default styles",
          summary: "Learn the browser defaults, reset styles, and the cascade.",
        },
        {
          id: "units",
          title: "CSS units",
          summary: "px vs rem vs %, viewport units, and when to use each.",
        },
        {
          id: "text",
          title: "Typography",
          summary: "Font families, weights, line-height, letter-spacing, and variables.",
        },
        {
          id: "selectors",
          title: "Selectors & specificity",
          summary: "Master combinators, pseudo-classes, and how specificity resolves conflicts.",
        },
        {
          id: "positioning",
          title: "Positioning",
          summary: "Normal flow, inline vs block, absolute/fixed positioning, and stacking.",
        },
      ],
    },
    {
      id: "forms",
      title: "Forms",
      lessons: [
        {
          id: "basics",
          title: "Form basics",
          summary: "Structure forms with labels, name attributes, and submit mechanisms.",
        },
        {
          id: "validation",
          title: "Form validation",
          summary: "Built-in validation attributes, constraint API, and UX tips.",
        },
        {
          id: "signup-project",
          title: "Project: Sign-up form",
          summary: "Build a polished signup form with validation, hints, and error states.",
          type: "project",
        },
      ],
    },
    {
      id: "layout",
      title: "Layout & Grid",
      lessons: [
        {
          id: "flexbox",
          title: "Flexbox essentials",
          summary: "Axes, grow/shrink, alignment, and responsive stacks.",
        },
        {
          id: "grid",
          title: "CSS Grid introduction",
          summary: "Define grid tracks, place items, and build admin-style dashboards.",
        },
        {
          id: "dashboard-project",
          title: "Project: Admin dashboard",
          summary: "Apply grid & flex to recreate a multi-panel dashboard layout.",
          type: "project",
        },
      ],
    },
    {
      id: "advanced-css",
      title: "Intermediate CSS Concepts",
      lessons: [
        {
          id: "functions",
          title: "CSS functions",
          summary: "calc(), clamp(), color-mix(), and building fluid systems.",
        },
        {
          id: "custom-props",
          title: "Custom properties",
          summary: "Design tokens, theming, and dynamic styling.",
        },
        {
          id: "frameworks",
          title: "Frameworks & preprocessors",
          summary: "Sass, PostCSS, Tailwind, and how they integrate with builds.",
        },
        {
          id: "compat",
          title: "Browser compatibility",
          summary: "Use @supports, fallbacks, and testing strategies for legacy browsers.",
        },
      ],
    },
  ],
};

export const concepts: MicroConcept[] = htmlCssPath.sections.flatMap((section) =>
  section.lessons.map((lesson) => ({
    id: `${section.id}-${lesson.id}`,
    nodeId: `${section.id}-${lesson.id}`,
    trackId: section.id,
    trackTitle: section.title,
    title: lesson.title,
    lesson: lesson.summary,
  }))
);
