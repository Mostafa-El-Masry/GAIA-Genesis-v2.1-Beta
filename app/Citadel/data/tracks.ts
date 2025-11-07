export type Node = {
  id: string;
  tier: 1 | 2 | 3 | 4 | 5;
  title: string;
};

export type Track = {
  id: string;
  title: string;
  nodes: Node[];
};

function makeNodes(prefix: string): Node[] {
  return [
    { id: `${prefix}-t1`, tier: 1, title: "Foundations" },
    { id: `${prefix}-t2`, tier: 2, title: "Core Patterns" },
    { id: `${prefix}-t3`, tier: 3, title: "Applied Skills" },
    { id: `${prefix}-t4`, tier: 4, title: "Projects" },
    { id: `${prefix}-t5`, tier: 5, title: "Mastery" },
  ];
}

export const tracks: Track[] = [
  { id: "html", title: "HTML", nodes: makeNodes("html") },
  { id: "css", title: "CSS", nodes: makeNodes("css") },
  { id: "js", title: "JavaScript", nodes: makeNodes("js") },
  { id: "tailwind", title: "Tailwind", nodes: makeNodes("tailwind") },
  { id: "git", title: "Git & CLI", nodes: makeNodes("git") },
  { id: "react", title: "React", nodes: makeNodes("react") },
  { id: "next", title: "Next.js", nodes: makeNodes("next") },
  { id: "node", title: "Node.js", nodes: makeNodes("node") },
];
