export type Lesson = {
  id: string;
  title: string;
  summary: string;
  level: "beginner" | "intermediate" | "advanced";
  type?: "project" | "lesson";
  body: string;
};

export type Section = {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
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
    "Start from zero: learn how to structure pages with HTML, style them with CSS, and build layouts that feel like GAIA screens.",
  description:
    "This path assumes you know nothing. Each lesson gives you an explanation, concrete examples, and a tiny task to try in the CodeBin. Work from top to bottom: beginner HTML, then forms, then beginner CSS, then layout and intermediate CSS.",
  sections: [
    {
      id: "html-basics",
      title: "Beginner HTML Concepts",
      level: "beginner",
      lessons: [
        {
          id: "intro",
          title: "What is HTML?",
          summary:
            "Understand what HTML is, how a document is structured, and why tags matter.",
          level: "beginner",
          type: "lesson",
          body: `HTML is the language the browser uses to understand the structure of a page. It does not care about colors or fonts; it cares about *meaning*: what is a heading, what is a paragraph, what is a list, what is an image.

Every document has the same basic skeleton: a DOCTYPE, an <html> element, a <head> with metadata, and a <body> with everything you actually see. If that skeleton is missing or broken, the browser will guess, and different browsers may guess differently.

In this lesson you learn to read that skeleton like a map. When you open any GAIA page, you should be able to imagine the underlying HTML tree: a root, then big sections, then smaller pieces inside each section.

▶ Try in CodeBin:
- Create a brand new index.html with <!DOCTYPE html>, <html>, <head>, and <body>.
- Inside <head>, add <title>My First GAIA Page</title>.
- Inside <body>, add a single <p> that says: "Hello from my first structured page".`,
        },
        {
          id: "headings-lists",
          title: "Headings & text",
          summary:
            "Use headings, paragraphs, and lists to create a clear document outline.",
          level: "beginner",
          type: "lesson",
          body: `Headings (h1–h6) create an outline for your page, just like titles and subtitles in a book. Screen readers and search engines use that outline to understand what sections exist and how they relate.

A good rule: one <h1> per page, then <h2> for big sections (Dashboard, Health, Wealth), and <h3> for subsections if needed. Paragraphs (<p>) hold normal text. Lists (<ul>, <ol>, <li>) hold groups of related items, such as navigation links or todo items.

When you think of GAIA, imagine each major page has a single h1 at the top, then sections with h2 headings like "Today’s focus", "Health snapshot", or "Gallery".

▶ Try in CodeBin:
- Under your existing <p>, add an <h1> with the title of the page.
- Add an <h2> called "Sections" and below it an unordered list (<ul>) with 3 <li> items: Dashboard, Gallery, Wealth.
- Add another <h2> called "Notes" and one or two paragraphs (<p>) beneath it.`,
        },
        {
          id: "links-media",
          title: "Links & images",
          summary:
            "Create navigation links and embed images with correct alt text.",
          level: "beginner",
          type: "lesson",
          body: `Links (<a>) connect one page to another. Good link text describes where you are going: "Go to Dashboard" is better than "Click here". Use the href attribute to point to a URL or another HTML file.

Images (<img>) embed pictures into your page. The src attribute points to the image file. The alt attribute describes the image for users who cannot see it (screen readers) or for when the image fails to load.

In GAIA you might have links to /dashboard or /gallery, and images that represent your avatar, the GAIA logo, or screenshots of your trackers.

▶ Try in CodeBin:
- Under your "Sections" list, add a <nav> that contains three <a> links: Dashboard, Gallery, and Wealth. For now, use "#" as the href.
- Add an <img> with src="https://via.placeholder.com/200" and alt="Temporary placeholder image".
- Refresh the preview and confirm that the link text and image appear correctly.`,
        },
        {
          id: "tables",
          title: "Tables for data",
          summary:
            "Display tabular data with table, thead, tbody, tr, th, and td.",
          level: "beginner",
          type: "lesson",
          body: `Tables are for data that naturally forms rows and columns: for example, a monthly interest table in Wealth, or a log of insulin doses in Health. They are *not* for general layout.

A basic table uses <table> as the wrapper, <thead> for header rows, <tbody> for data rows, <tr> for table rows, <th> for header cells, and <td> for normal cells. Screen readers rely on <th> to understand what each column means.

In GAIA you might have a table with columns like "Month", "Deposit", "Interest", "Total". Each row represents one month of your plan.

▶ Try in CodeBin:
- Under your existing content, add a <table> with a <thead> that has a single row (<tr>) with three headers (<th>): Month, Saved, Notes.
- Add a <tbody> with two rows. Each row should have matching <td> cells, such as "January", "5000 EGP", "Started my plan".
- Inspect the preview and confirm that the data lines up in columns.`,
        },
        {
          id: "semantics",
          title: "Semantic layout",
          summary:
            "Use main, nav, section, and footer to structure a full page.",
          level: "beginner",
          type: "lesson",
          body: `Semantic elements are special tags that describe the *role* of a region: <main> for primary content, <nav> for navigation, <header> and <footer> for the top and bottom, <section> for grouped content, and <article> for a self-contained piece.

Using these instead of many anonymous <div> elements makes your markup easier to read and more accessible. Screen readers can jump directly to landmarks like main or nav.

Think of a GAIA page as: header with logo and search, nav for main links, main for the core content, maybe aside for secondary info, and footer for legal or version info.

▶ Try in CodeBin:
- Wrap your main content in a <main> element.
- Wrap your navigation links in a <nav>.
- Add a <header> above everything with a simple title, and a <footer> at the bottom that says "Built with GAIA".`,
        },
      ],
    },
    {
      id: "forms",
      title: "HTML Forms",
      level: "beginner",
      lessons: [
        {
          id: "form-basics",
          title: "Form structure",
          summary:
            "Build a basic form with labels, inputs, and a submit button.",
          level: "beginner",
          type: "lesson",
          body: `Forms are how users send data to your app. Even if GAIA later uses JavaScript or APIs, the foundation is the same: a <form> element containing labeled inputs and a submit button.

Every input should have a <label>. You link them with the for attribute on the label and the id on the input. The name attribute on the input is what identifies the field when data is submitted.

In GAIA you might use forms for adding tasks, logging health readings, or saving wealth plan settings.

▶ Try in CodeBin:
- Create a new <section> titled "Quick task".
- Inside it, add a <form>.
- Add a label+input pair for "Task title" (type="text") and another for "Due date" (type="date").
- Add a <button type="submit">Add task</button> and see how it looks in the preview.`,
        },
        {
          id: "form-input-types",
          title: "Input types",
          summary:
            "Use email, number, password, date, and others to get better data.",
          level: "beginner",
          type: "lesson",
          body: `The type attribute on <input> tells the browser what kind of data you expect. Different types show different keyboards on mobile and give you built-in validation for free.

Common types: text (default), email, password, number, date, checkbox, radio. Using the right type improves user experience and makes validation easier.

In GAIA, your forms might include numbers (for money, weight, insulin units), dates (for logs), and passwords (for ELEUTHIA or future auth screens).

▶ Try in CodeBin:
- Extend your previous form: add an input type="number" for "Amount saved" and another type="email" for "Contact email".
- Notice how the browser behaves differently for numbers and emails (especially on mobile, if you test later).`,
        },
        {
          id: "form-validation",
          title: "Form validation basics",
          summary:
            "Use required, min, max, and pattern for simple validation without JavaScript.",
          level: "beginner",
          type: "lesson",
          body: `HTML gives you built-in validation via attributes like required, min, max, minlength, maxlength, and pattern. When the user submits the form, the browser checks these constraints and blocks submission if they are not met.

This is not a replacement for server-side validation, but it is an excellent first line of defense and improves user feedback.

▶ Try in CodeBin:
- Mark your "Task title" and "Amount saved" inputs as required.
- Set a minimum of 0 for "Amount saved" using min="0".
- Try submitting the form with empty fields and see how the browser highlights the problems.`,
        },
      ],
    },
    {
      id: "css-basics",
      title: "Beginner CSS Concepts",
      level: "beginner",
      lessons: [
        {
          id: "css-attach",
          title: "Connecting CSS",
          summary:
            "Attach an external stylesheet and understand the cascade.",
          level: "beginner",
          type: "lesson",
          body: `CSS controls how your HTML looks: colors, spacing, fonts, borders, layouts. To use it, you either embed <style> inside the document or, more commonly, link an external stylesheet with <link rel="stylesheet" href="/styles.css">.

The cascade decides which rules win when multiple styles apply. Rules later in the file override earlier ones if they have the same specificity. Understanding this avoids a lot of "why isn't my style working?" moments.

▶ Try in CodeBin:
- Ensure your <head> includes a <link> to /styles.css.
- In /styles.css, set a base font-family for the body, and give h1 a different color from h2.
- Experiment by adding two conflicting rules for h1 and see which one wins based on order.`,
        },
        {
          id: "css-text",
          title: "Text & colors",
          summary:
            "Set font sizes, line-height, and color palette for a simple page.",
          level: "beginner",
          type: "lesson",
          body: `Readable text is more important than fancy visuals. You control readability with font-size, line-height, and contrast between text and background colors.

A good pattern: define a body font-size (like 16px), line-height around 1.5–1.7, and use a limited palette of colors for headings, accents, and backgrounds. Avoid very low contrast (light gray on white, etc.).

▶ Try in CodeBin:
- In styles.css, set body { font-size: 16px; line-height: 1.6; color: #0f172a; }.
- Make h1 larger and bolder, and h2 slightly smaller.
- Change the background color of the whole page to a very light gray and adjust text colors to keep good contrast.`,
        },
        {
          id: "css-box-model",
          title: "Box model & spacing",
          summary:
            "Use margin, padding, and border-box to control how elements occupy space.",
          level: "beginner",
          type: "lesson",
          body: `Every element in CSS is a box with content, padding, border, and margin. Understanding this "box model" is the foundation of layout.

By default, width and height apply to the content box only, and padding/border are added on top. Setting box-sizing: border-box; makes width and height include padding and border, which is often easier to reason about.

▶ Try in CodeBin:
- In styles.css, add * { box-sizing: border-box; } at the top.
- Wrap your form in a container div and give that container padding, a border, and margin-top.
- Observe how margin creates space outside the box, while padding creates space inside.`,
        },
      ],
    },
    {
      id: "layout",
      title: "Layout & Grid",
      level: "intermediate",
      lessons: [
        {
          id: "flexbox",
          title: "Flexbox basics",
          summary:
            "Lay out navigation bars and card rows with flexbox.",
          level: "intermediate",
          type: "lesson",
          body: `Flexbox is a layout mode that makes it easy to line up items in a row or column and control alignment and spacing. You apply display: flex to a container, then use justify-content, align-items, and gap to arrange children.

GAIA uses flexbox in many places: navigation bars, horizontal lists of cards, button groups.

▶ Try in CodeBin:
- Create a new <section> called "Quick links" with a container div.
- Inside, place three <a> elements: Dashboard, Health, Wealth.
- In styles.css, make the container display: flex, add a gap between items, and center them horizontally.`,
        },
        {
          id: "grid",
          title: "CSS Grid overview",
          summary:
            "Create a simple dashboard layout with two columns.",
          level: "intermediate",
          type: "lesson",
          body: `CSS Grid is a two-dimensional layout system: it can control rows and columns at the same time. You define grid-template-columns and grid-gap (or gap) to create a grid, then place child elements automatically or explicitly.

GAIA dashboards (Wealth, Health, Timeline) are good candidates for grid: panels that line up in a regular pattern.

▶ Try in CodeBin:
- Add a <section> called "Dashboard panels" with four child <div> elements representing cards.
- Give the section display: grid and grid-template-columns: repeat(2, minmax(0, 1fr)); and a gap.
- Style the cards with padding, border, and background color so they look like panels.`,
        },
        {
          id: "layout-project",
          title: "Mini dashboard project",
          summary:
            "Combine HTML structure and CSS layout into a small GAIA-style screen.",
          level: "intermediate",
          type: "project",
          body: `This project ties everything together: semantic HTML, text styling, spacing, and layout.

You will recreate a mini dashboard with:
- A header containing a title and a short tagline.
- A navigation bar with a few links.
- A main area with at least four cards arranged in a grid.
- A small footer at the bottom.

▶ Try in CodeBin:
- Start from a clean index.html and styles.css.
- Build the structure first with semantic elements (header, nav, main, section, footer).
- Then gradually add CSS until it feels like a tiny GAIA dashboard.`,
        },
      ],
    },
    {
      id: "css-intermediate",
      title: "Intermediate CSS Concepts",
      level: "intermediate",
      lessons: [
        {
          id: "responsive",
          title: "Responsive basics",
          summary:
            "Use media queries to make layouts adapt to smaller screens.",
          level: "intermediate",
          type: "lesson",
          body: `Responsive design means your layout adapts to different screen sizes. Media queries let you change styles when the viewport width crosses certain thresholds.

For example, you might use a single-column layout on phones and a two-column layout on larger screens. GAIA will eventually need this to look good on both desktop and mobile.

▶ Try in CodeBin:
- Take your dashboard grid and add a media query that switches to one column when the width is below 640px.
- Test by resizing the preview frame and watching the layout change.`,
        },
        {
          id: "custom-properties",
          title: "CSS variables",
          summary:
            "Create simple design tokens for colors and spacing.",
          level: "intermediate",
          type: "lesson",
          body: `Custom properties (CSS variables) let you name common values so you can reuse and change them easily. You define them with --token-name and use them with var(--token-name).

For GAIA, this is the first step toward a design system: one place for primary color, background, radius, spacing, etc.

▶ Try in CodeBin:
- In :root, define variables like --color-bg, --color-accent, and --radius-card.
- Use those variables for your body background, card background, and card border-radius.
- Change the values in one place and see the entire page update.`,
        },
        {
          id: "transitions",
          title: "Transitions & polish",
          summary:
            "Add small hover transitions without overwhelming the user.",
          level: "intermediate",
          type: "lesson",
          body: `Transitions let you animate property changes smoothly over time. Simple hover effects on buttons and cards can make the UI feel more responsive and alive.

The key is subtlety: small changes in background-color, transform, or box-shadow, with short durations (150–250ms), are usually enough.

▶ Try in CodeBin:
- Add a hover state for your cards that slightly changes background color and adds a shadow.
- Use transition: all 180ms ease-out; to make the change smooth.
- Keep it gentle; imagine how it would feel to look at this dashboard every day.`,
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
