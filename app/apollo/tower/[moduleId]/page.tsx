import { redirect } from "next/navigation";

type PageProps = {
  params: { moduleId: string };
};

const normalize = (value?: string) =>
  decodeURIComponent(value ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

export default function LegacyTowerModuleRedirect({ params }: PageProps) {
  const slug = normalize(params.moduleId);
  if (!slug) {
    redirect("/apollo");
  }
  redirect(`/apollo/tower/topics/${encodeURIComponent(slug)}`);
}
