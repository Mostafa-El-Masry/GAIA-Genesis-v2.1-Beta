import { lessonsByModuleId } from "../../data/lessons";
import { tracks } from "../../data/tracks";
import TopicShell from "./TopicShell";
import { notFound } from "next/navigation";

type Params = {
  params: Promise<{
    slug?: string;
  }>;
};

const normalize = (value?: string) =>
  (value ?? "")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

function findModule(slug: string) {
  const normalizedSlug = normalize(slug);
  for (const track of tracks) {
    for (const module of track.modules) {
      if (normalize(module.id) === normalizedSlug) {
        return { module, track };
      }
    }
  }
  return null;
}

export default async function TopicPage({ params }: Params) {
  const resolvedParams = await params;
  const slug = normalize(resolvedParams.slug);
  if (!slug) {
    notFound();
  }
  const match = findModule(slug);
  if (!match) {
    notFound();
  }

  const lessons = lessonsByModuleId[match.module.id] ?? [];

  return (
    <div className="min-h-screen gaia-surface-soft">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <TopicShell
          topicId={match.module.id}
          moduleTitle={match.module.title}
          trackTitle={match.track.title}
          lessons={lessons}
        />
      </div>
    </div>
  );
}
