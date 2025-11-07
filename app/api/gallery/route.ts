import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import type { Dirent } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMG_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".avif",
]);
const VID_EXTS = new Set([".mp4", ".webm", ".mov", ".mkv", ".avi"]);

type ManifestItem = {
  id: string;
  type: "image" | "video";
  src: string;
  preview?: string[];
  addedAt: string;
};

function hashId(p: string) {
  let h = 0,
    i = 0;
  while (i < p.length) {
    h = ((h << 5) - h + p.charCodeAt(i++)) | 0;
  }
  return Math.abs(h).toString(36);
}

async function statSafe(filePath: string) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

async function collectMedia(
  rootDir: string,
  prefix: string,
  type: "image" | "video",
  extensions: Set<string>
) {
  const items: ManifestItem[] = [];
  const stack: Array<{ dir: string; rel: string }> = [
    { dir: rootDir, rel: prefix },
  ];

  while (stack.length) {
    const { dir, rel } = stack.pop()!;
    let entries: Dirent[] = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const absolute = path.join(dir, entry.name);
      const relative = path
        .posix.join(rel, entry.name)
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

      if (entry.isDirectory()) {
        stack.push({ dir: absolute, rel: path.posix.join(rel, entry.name) });
        continue;
      }

      if (!entry.isFile()) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (!extensions.has(ext)) continue;

      const stats = await statSafe(absolute);
      const addedAt =
        stats?.mtime instanceof Date
          ? stats.mtime.toISOString()
          : new Date(0).toISOString();

      items.push({
        id: hashId(relative),
        type,
        src: relative,
        addedAt,
      });
    }
  }

  return items;
}

export async function GET() {
  const publicDir = path.join(process.cwd(), "public");
  const imageDir = path.join(publicDir, "media", "images");
  const videoDir = path.join(publicDir, "media", "videos");

  const [images, videos] = await Promise.all([
    collectMedia(imageDir, "media/images", "image", IMG_EXTS),
    collectMedia(videoDir, "media/videos", "video", VID_EXTS),
  ]);

  const items = [...images, ...videos].sort((a, b) =>
    a.addedAt < b.addedAt ? 1 : -1
  );

  return NextResponse.json({ items });
}
