export type NewsItem = { id: string; date: string; title: string; tags?: string[]; body: string };

export const items: NewsItem[] = [
  { id: "w12", date: "2026-04-05", title: "Classic add-ons land", tags: ["classic","phase5"], body: "Site Map, Dev Directory, What’s New, Announcements, Last Updated, Download Center, and ELEUTHIA-gated locks are now available." },
  { id: "w11", date: "2026-04-03", title: "Timelines update", tags: ["timeline","health","wealth"], body: "Timeline goes vertical; Health/Wealth bars get exponential heights." },
  { id: "w10", date: "2026-04-02", title: "Dashboard polish", tags: ["dashboard"], body: "Active + Entry sections restyled and wired to live data." },
];
