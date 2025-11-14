export type LessonLevel = "beginner" | "intermediate" | "advanced";
export type Lesson = {
  id: string;
  title: string;
  summary: string;
  level: LessonLevel;
  type?: "project" | "lesson";
  body: string;
};
export type Section = {
  id: string;
  title: string;
  level: LessonLevel;
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
/**
 * HTML & CSS curriculum (compact). Bodies are left empty to keep this file
 * syntactically simple — the Academy UI can populate lesson bodies.
 */
const sections: Section[] = [
  {
  id: "html-css-m1",
  title: "HTML Foundations",
  level: "beginner",
  lessons: [
  { id: "html-css-m1-l1", title: "HTML, CSS & JavaScript overview", summary: "How HTML, CSS, and JavaScript work together to build a page.", level: "beginner", type: "lesson", body: "" },
  { id: "html-css-m1-l2", title: "Elements and tags", summary: "Understanding elements, tags, and how they form a DOM tree.", level: "beginner", type: "lesson", body: "" },
  { id: "html-css-m1-l3", title: "HTML boilerplate & document structure", summary: "The minimum HTML needed for a valid document, and how it is structured.", level: "beginner", type: "lesson", body: "" },
  ],
  },
  {
  id: "html-css-m2",
  title: "Semantic HTML & Accessibility Basics",
  level: "beginner",
  lessons: [
  { id: "html-css-m2-l1", title: "Introduction to web accessibility", summary: "Why accessibility matters and who benefits from it.", level: "beginner", type: "lesson", body: "" },
  ],
  },
];
export const htmlCssPath: LearningPath = {
  id: "foundations-html-css",
  title: "Foundations: HTML & CSS",
  overview:
  "A step-by-step path through semantic HTML and modern CSS, from the very basics up to responsive design and animations.",
  description:
  "Use this path as your personal HTML & CSS curriculum inside Apollo. Each lesson card links to a detailed explanation and a live playground. You can edit titles and bodies from the Academy UI and add extra sections for anything you want to track.",
  sections,
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
export type LessonLevel = "beginner" | "intermediate" | "advanced";

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  level: LessonLevel;
  type?: "project" | "lesson";
  body: string;
};

export type Section = {
  id: string;
  title: string;
  level: LessonLevel;
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

/**
 * HTML & CSS curriculum (compact). Bodies are left empty to keep this file
 * syntactically simple — the Academy UI can populate lesson bodies.
 */

const sections: Section[] = [
  {
    id: "html-css-m1",
    title: "HTML Foundations",
    level: "beginner",
    lessons: [
      { id: "html-css-m1-l1", title: "HTML, CSS & JavaScript overview", summary: "How HTML, CSS, and JavaScript work together to build a page.", level: "beginner", type: "lesson", body: "" },
      { id: "html-css-m1-l2", title: "Elements and tags", summary: "Understanding elements, tags, and how they form a DOM tree.", level: "beginner", type: "lesson", body: "" },
      { id: "html-css-m1-l3", title: "HTML boilerplate & document structure", summary: "The minimum HTML needed for a valid document, and how it is structured.", level: "beginner", type: "lesson", body: "" },
    ],
  },
  {
    id: "html-css-m2",
    title: "Semantic HTML & Accessibility Basics",
    level: "beginner",
    lessons: [
      { id: "html-css-m2-l1", title: "Introduction to web accessibility", summary: "Why accessibility matters and who benefits from it.", level: "beginner", type: "lesson", body: "" },
    ],
  },
];
Example (structure + style + behaviour):

<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Mini page</title>
    <style>body{font-family:system-ui;padding:1rem} .hidden{display:none}</style>
  </head>
  <body>
    <h1>Hello</h1>
    <p id="msg">Count: 0</p>
    <button id="inc">Increase</button>
    <script>
      let n = 0; document.getElementById('inc').onclick = () => {
        n++; document.getElementById('msg').textContent = 'Count: ' + n;
      };
    </script>
  </body>
</html>

▶ Try in CodeBin:
- Paste the example above into CodeBin and press Run.
- Change the CSS rule to use a different font-size and observe the result.
- Modify the button handler to decrease the count instead of increasing it.

Further reading:
- MDN: https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics
- The Odin Project: https://www.theodinproject.com/paths/foundations/courses/foundations
`,
      },
      {
        id: "html-css-m1-l2",
        title: "Elements and tags",
        summary: "Understanding elements, tags, and how they form a DOM tree.",
        level: "beginner",
        type: "lesson",
        body: `HTML is expressed with elements. An element has a start tag, content (which may include other elements) and an end tag. Elements nest to form the DOM (Document Object Model).

Example:

<article>
  <h2>My title</h2>
  <p>This is a <strong>paragraph</strong> with an <a href="#">inline link</a>.</p>
  <ul>
    <li>First</li>
    <li>Second</li>
  </ul>
</article>

Key ideas:
- Tags: the textual markers (e.g. '<p>', '<h1>') that define elements.
- Elements: the nodes in the document tree, each providing semantic meaning.
- Attributes: extra information on elements (e.g. 'href', 'src', 'alt').

▶ Try in CodeBin:
- Create a nested list and then wrap it in a `<nav>` element to represent navigation.
- Inspect the generated DOM in DevTools and find the `<strong>` element.

Further reading:
- MDN: https://developer.mozilla.org/en-US/docs/Web/HTML/Element
- The Odin Project (HTML module): https://www.theodinproject.com/paths/foundations/courses/foundations/lessons/intro-to-html
      },
      {
        id: "html-css-m1-l3",
        title: "HTML boilerplate & document structure",
        summary: "The minimum HTML needed for a valid document, and how it is structured.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m1-l4",
        title: "Inspecting markup with DevTools",
        summary: "Using browser DevTools to inspect and debug your HTML.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m1-l5",
        title: "Document head & metadata",
        summary: "The purpose of the <head>, meta tags, and how browsers use them.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m1-l6",
        title: "Attributes & global defaults",
        summary: "Common attributes, global attributes, and how defaults work.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m1-l7",
        title: "Productivity with Emmet and snippets",
        summary: "Speeding up HTML authoring using Emmet and editor snippets.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m1-l8",
        title: "Project: Recipe page",
        summary: "Build a simple recipe page using headings, paragraphs, and lists.",
        level: "beginner",
        type: "project",
        body: "",
      },
    ],
  },
  {
    id: "html-css-m2",
    title: "Semantic HTML & Accessibility Basics",
    level: "beginner",
    lessons: [
      {
        id: "html-css-m2-l1",
        title: "Introduction to web accessibility",
        summary: "Why accessibility matters and who benefits from it.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m2-l2",
        title: "Semantic HTML: using the right elements",
        summary: "Choosing elements that describe their content, not their appearance.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m2-l3",
        title: "Landmarks & meaningful page structure",
        summary: "Using header, main, nav, aside, and footer to shape your layout.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m2-l4",
        title: "ARIA fundamentals in plain language",
        summary: "Where ARIA can help, and when to avoid it.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m2-l5",
        title: "Keyboard navigation & focus order",
        summary: "Ensuring your site can be used without a mouse.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m2-l6",
        title: "Accessible images & alt text",
        summary: "Writing useful alt text and handling decorative images.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m2-l7",
        title: "WCAG in practice",
        summary: "A practical, non-scary introduction to WCAG AA guidelines.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m2-l8",
        title: "Project: Accessibility audit",
        summary: "Audit an existing page and make specific accessibility improvements.",
        level: "beginner",
        type: "project",
        body: "",
      },
    ],
  },
  {
    id: "html-css-m3",
    title: "Text, Lists & Navigation",
    level: "beginner",
    lessons: [
      
      {
        id: "html-css-m3-l1",
        title: "Headings and paragraphs in depth",
        summary: "Organising content with a sensible heading hierarchy.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m3-l2",
        title: "Inline vs block-level elements",
        summary: "How inline and block elements behave and when to use each.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m3-l3",
        title: "Lists for content and navigation",
        summary: "Using ordered and unordered lists for content and menus.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m3-l4",
        title: "Links and basic navigation",
        summary: "Creating accessible nav bars and in-page links.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m3-l5",
        title: "Project: Multi-section article page",
        summary: "Build an article page with multiple sections and navigation.",
        level: "beginner",
        type: "project",
        body: "",
      },
    ],
  },
  {
    id: "html-css-m4",
    title: "Links, Media & Embeds",
    level: "beginner",
    lessons: [
      {
        id: "html-css-m4-l1",
        title: "Images, figure, and figcaption",
        summary: "Using semantic containers for images and captions.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m4-l2",
        title: "Video & audio basics",
        summary: "Embedding media with the video and audio elements.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m4-l3",
        title: "Responsive images with srcset",
        summary: "Serving different images to different devices.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m4-l4",
        title: "iframes and embedded content",
        summary: "Embedding maps, players, and external widgets safely.",
        level: "beginner",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m4-l5",
        title: "Project: Media-rich homepage",
        summary: "Build a small homepage showcasing media and content.",
        level: "beginner",
        type: "project",
        body: "",
      },
    ],
  },
  {
    id: "html-css-m5",
    title: "CSS Basics",
    level: "intermediate",
    lessons: [
      {
        id: "html-css-m5-l1",
        title: "What CSS is and how it’s applied",
        summary: "Linking style sheets and understanding how CSS is loaded.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m5-l2",
        title: "Selectors, declarations, and specificity",
        summary: "How selectors match elements and which rules win.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m5-l3",
        title: "Colors, units, and basic typography",
        summary: "Working with px, rem, em, and setting a type scale.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m5-l4",
        title: "Cascade and inheritance",
        summary: "How CSS cascades and which properties inherit.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m5-l5",
        title: "Organising simple style sheets",
        summary: "Structuring small projects to stay readable.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m5-l6",
        title: "Project: Style the recipe page",
        summary: "Add consistent styling to your earlier HTML project.",
        level: "intermediate",
        type: "project",
        body: "",
      },
    ],
  },
  {
    id: "html-css-m6",
    title: "Box Model & Layout Essentials",
    level: "intermediate",
    lessons: [
      {
    body: `Attributes add extra data to elements. Some are specific (e.g. src on <img>), while others are global and apply to any element.

  Common patterns:
  - 'id' — unique identifier for an element; useful for JavaScript and CSS targeting.
  - 'class' — one or more space-separated tokens applied for styling and selection.
  - 'data-*' — custom data attributes for storing application data without affecting semantics.
  - 'role' / 'aria-*' — accessibility attributes that communicate intent to assistive tech.

  Example:

  <button id="save" class="btn primary" data-step="1">Save</button>

  Global defaults and inheritance:
  - Some properties inherit from parents (e.g. color, font-family) while others do not (e.g. margin).
  - Use CSS ':root' or on body to set global design tokens (font-size, colours).

  ▶ Try in CodeBin:
  - Add data-test="x" to an element and read it in the console: 'document.querySelector("[data-test]").dataset.test'.
  - Try changing a parent font-size and observe inherited text sizes.

  Further reading:
  - MDN attributes overview: https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
        title: "The box model in practice",
        summary: "Content, padding, border, margin, and box-sizing.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m6-l2",
        title: "Display: block, inline, inline-block",
        summary: "How different display values affect layout.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m6-l3",
        title: "Spacing patterns and margin collapsing",
        summary: "Building consistent spacing systems and avoiding surprises.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m6-l4",
        title: "Project: Simple card layout",
        summary: "Create a small layout of reusable content cards.",
        level: "intermediate",
        type: "project",
        body: "",
      },
    ],
  },
  {
    id: "html-css-m7",
    title: "Flexbox Layout",
    level: "intermediate",
    lessons: [
      {
    body: `Emmet is a shorthand syntax supported by many editors that expands into full HTML/CSS. It saves keystrokes for common patterns.

  Examples:
  - 'html:5' → expands to a full HTML5 boilerplate.
  - 'ul>li*5' → creates a `<ul>` with five `<li>` children.
  - 'header>nav>ul>li*3>a' → helpful for quick nav scaffolding.

  Tips:
  - Learn the basic abbreviations you use often (html, div, a, img, ul/li).
  - Combine with editor snippets to prefill classes or attributes your project uses.

  ▶ Try in CodeBin:
  - In an editor supporting Emmet (VS Code, for example), type 'html:5' and expand it.
  - Create a nav using 'nav>ul>li*4>a' and edit the links.

  Further reading:
  - Emmet docs: https://emmet.io/
        title: "Flexbox: main axis and cross axis",
        summary: "Understanding how flex containers arrange their children.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m7-l2",
        title: "Direction, wrapping, and flow",
        summary: "flex-direction, flex-wrap, and row vs column layouts.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m7-l3",
        title: "Justify-content & align-items",
        summary: "Controlling alignment on the main and cross axes.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m7-l4",
        title: "Gap, alignment, and distribution",
        summary: "Spacing and distributing items with modern flexbox features.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m7-l5",
        title: "Project: Responsive flexbox layout",
        summary: "Build a responsive navigation and hero layout with flexbox.",
        level: "intermediate",
        type: "project",
        body: "",
      },
    ],
  },
  {
    id: "html-css-m8",
    title: "CSS Grid",
    level: "intermediate",
    lessons: [
      {
    body: `Project brief — Recipe page

  Create a simple recipe page that includes:
  - A page title and a short description.
  - An ingredients list (use <ul> or <ol>).
  - Preparation steps as an ordered list.
  - At least one image with proper alt text.

  Stretch goals:
  - Add a two-column layout using CSS (ingredients on the left, steps on the right).
  - Add a link to a printable view (simple CSS print stylesheet).

  ▶ Try in CodeBin:
  - Build the page in /index.html with a separate /styles.css file and run the preview.
  - Share the finished page by exporting ZIP or copying the HTML into the playground.

  Further reading & examples:
  - MDN HTML basics: https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics
  - The Odin Project example exercises: https://www.theodinproject.com/paths/foundations/courses/foundations
        title: "Introduction to CSS Grid",
        summary: "Defining rows and columns with CSS Grid.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m8-l2",
        title: "Placing grid items",
        summary: "Explicit vs implicit placement and spanning tracks.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m8-l3",
        title: "Combining Flexbox and Grid",
        summary: "Using flexbox inside grid cells for complex layouts.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m8-l4",
        title: "Project: Admin dashboard layout",
        summary: "Build a simple dashboard interface using Grid and Flexbox.",
        level: "intermediate",
        type: "project",
        body: "",
      },
    ],
  },
  {
    id: "html-css-m9",
    title: "Forms & UI Elements",
    level: "intermediate",
    lessons: [
      {
        id: "html-css-m9-l1",
        title: "Form basics: inputs, labels, groupings",
        summary: "Creating accessible forms with proper labels and structure.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m9-l2",
        title: "Form semantics and validation UX",
        summary: "HTML validation, error messages, and user-friendly forms.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m9-l3",
        title: "Styling form controls",
        summary: "Designing inputs, buttons, and custom controls.",
        level: "intermediate",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m9-l4",
        title: "Project: Sign-up form",
        summary: "Build and style a realistic sign-up or login form.",
        level: "intermediate",
        type: "project",
        body: "",
      },
    ],
  },
  {
    id: "html-css-m10",
    title: "Responsive Design",
    level: "advanced",
    lessons: [
      {
        id: "html-css-m10-l1",
        title: "Intro to responsive design",
        summary: "Why responsive design matters and what it means.",
        level: "advanced",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m10-l2",
        title: "Natural responsiveness & fluid layouts",
        summary: "Making layouts that adapt without media queries.",
        level: "advanced",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m10-l3",
        title: "Media queries & breakpoints",
        summary: "Targeting different screen sizes with media queries.",
        level: "advanced",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m10-l4",
        title: "Project: Responsive portfolio",
        summary: "Build a small portfolio that looks good on multiple devices.",
        level: "advanced",
        type: "project",
        body: "",
      },
    ],
  },
  {
    id: "html-css-m11",
    title: "CSS Architecture & Reuse",
    level: "advanced",
    lessons: [
      {
        id: "html-css-m11-l1",
        title: "Utility-first vs component styles",
        summary: "Different ways to structure your CSS for reuse.",
        level: "advanced",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m11-l2",
        title: "Custom properties (CSS variables)",
        summary: "Using CSS variables for themes and design tokens.",
        level: "advanced",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m11-l3",
        title: "Naming conventions and structure",
        summary: "Keeping your styles understandable over time.",
        level: "advanced",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m11-l4",
        title: "Project: Mini design system audit",
        summary: "Review and refine styles in a small project.",
        level: "advanced",
        type: "project",
        body: "",
      },
    ],
  },
  {
    id: "html-css-m12",
    title: "Transitions & Animations",
    level: "advanced",
    lessons: [
      {
        id: "html-css-m12-l1",
        title: "CSS transitions",
        summary: "Adding smooth changes when properties update.",
        level: "advanced",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m12-l2",
        title: "Transforms: scale, rotate, translate",
        summary: "Using transform to move and scale elements.",
        level: "advanced",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m12-l3",
        title: "Keyframes & multi-step animations",
        summary: "Creating more complex motion with @keyframes.",
        level: "advanced",
        type: "lesson",
        body: "",
      },
      {
        id: "html-css-m12-l4",
        title: "Project: Animated hero section",
        summary: "Design and animate a simple hero for a homepage.",
        level: "advanced",
        type: "project",
        body: "",
      },
    ],
  },
];

export const htmlCssPath: LearningPath = {
  id: "foundations-html-css",
  title: "Foundations: HTML & CSS",
  overview:
    "A step-by-step path through semantic HTML and modern CSS, from the very basics up to responsive design and animations.",
  description:
    "Use this path as your personal HTML & CSS curriculum inside Apollo. Each lesson card links to a detailed explanation and a live playground. You can edit titles and bodies from the Academy UI and add extra sections for anything you want to track.",
  sections,
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
