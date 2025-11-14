export type LabCategory = 'HTML' | 'CSS' | 'JS' | 'Other';

export interface LabProject {
  id: string;
  slug: string;
  title: string;
  category: LabCategory;
  tags: string[];
  summary?: string;
  path: string;        // e.g. /labs/<slug>/index.html (served from /public)
  dateAdded: string;   // ISO date string
  views: number;
  coverId?: string;    // id in IndexedDB
}
