"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GalleryItem } from "./types";
import { PhotoGlyph, VideoGlyph } from "./icons";
import { getViews } from "./prefs";
import { formatDuration, formatViews } from "./metrics";
import { getDisplayName } from "./utils";
import { getProxiedImageUrl } from "./imageUrl";

function pickRandom<T extends GalleryItem>(
  arr: T[],
  type: "image" | "video"
): T | null {
  const list = arr.filter((x) => x.type === type);
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function FeaturedTile({
  item,
  type,
  views,
  onClick,
  onRename,
  onEditTags,
  manualTags,
  titleOverride,
}: {
  item: GalleryItem | null;
  type: "image" | "video";
  views: number;
  onClick: (id: string) => void;
  onRename?: (id: string, title: string | null) => void;
  onEditTags?: (id: string, tags: string[]) => void;
  manualTags?: string[];
  titleOverride?: string | null;
}) {
  if (!item) return null;

  const isVideo = type === "video";
  const placeholder = "/media/video-placeholder.jpg";
  const previewList = useMemo(() => {
    if (!isVideo || !Array.isArray(item.preview)) return [];
    return item.preview
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean);
  }, [isVideo, item.preview]);
  const [frame, setFrame] = useState(0);
  const [previewFailed, setPreviewFailed] = useState(false);
  const hasPreview =
    isVideo && previewList.length > 0 && !previewFailed;
  const effectivePreview =
    hasPreview && previewList.length > 0
      ? previewList[frame] ?? previewList[0]
      : null;
  const src = useMemo(() => {
    if (!isVideo) return item.src;
    const fallback = item.preview?.[0] ?? item.src;
    return effectivePreview ?? fallback;
  }, [effectivePreview, isVideo, item.preview, item.src]);
  const duration = formatDuration(item.duration);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const hasManagement = Boolean(onRename || onEditTags);

  useEffect(() => {
    if (!isVideo || hasPreview) return;
    const node = videoRef.current;
    if (!node) return;
    const play = () => {
      void node.play().catch(() => {
        /* ignore autoplay restrictions */
      });
    };
    play();
    return () => {
      node.pause();
      node.currentTime = 0;
    };
  }, [hasPreview, isVideo, item.src]);

  useEffect(() => {
    if (!hasPreview) {
      setFrame(0);
      return;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    intervalRef.current = setInterval(() => {
      setFrame((prev) => (prev + 1) % previewList.length);
    }, 1200);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasPreview, previewList.length]);

  useEffect(() => {
    setPreviewFailed(false);
    setFrame(0);
  }, [previewList]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target)) {
        setMenuOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [item.id]);

  const handleRename = () => {
    if (!onRename) return;
    const currentName =
      titleOverride ?? getDisplayName(item.src, item.id) ?? item.id;
    const next = window.prompt("Rename item", currentName);
    if (next === null) return;
    const trimmed = next.trim();
    onRename(item.id, trimmed.length ? trimmed : null);
    setMenuOpen(false);
  };

  const handleEditTags = () => {
    if (!onEditTags) return;
    const base = manualTags ?? [];
    const initialValue = base.join(", ");
    const next = window.prompt(
      "Edit tags (comma separated)",
      initialValue.length ? initialValue : undefined
    );
    if (next === null) return;
    const sanitized = Array.from(
      new Set(
        next
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean)
      )
    );
    onEditTags(item.id, sanitized);
    setMenuOpen(false);
  };

  return (
    <div
      className={`featured-card featured-card--${type}`}
      role="button"
      tabIndex={0}
      onClick={() => onClick(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick(item.id);
        }
      }}
      aria-label={getDisplayName(item.src, item.id)}
    >
      {hasManagement && (
        <div
          className="featured-card__menu-container"
          ref={menuRef}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="featured-card__menu-toggle"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {"\u22EE"}
            <span className="sr-only">Open item menu</span>
          </button>
          {menuOpen && (
            <div className="featured-card__menu" role="menu">
              {onRename && (
                <button
                  type="button"
                  role="menuitem"
                  className="featured-card__menu-item"
                  onClick={handleRename}
                >
                  Rename
                </button>
              )}
              {onEditTags && (
                <button
                  type="button"
                  role="menuitem"
                  className="featured-card__menu-item"
                  onClick={handleEditTags}
                >
                  Edit tags
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {isVideo && !hasPreview ? (
        <video
          ref={videoRef}
          className="featured-card__media"
          src={getProxiedImageUrl(item.src)}
          poster={getProxiedImageUrl(placeholder)}
          muted
          loop
          playsInline
          preload="metadata"
          autoPlay
        />
      ) : isVideo ? (
        <img
          src={getProxiedImageUrl(src)}
          alt=""
          className="featured-card__media"
          loading="lazy"
          onError={() => setPreviewFailed(true)}
        />
      ) : (
        <img
          src={getProxiedImageUrl(src)}
          alt=""
          className="featured-card__media"
          loading="lazy"
        />
      )}
      <div className="featured-card__overlay">
        <div className="featured-card__meta featured-card__meta--overlay">
          <span className="featured-card__meta-item">
            <span className="featured-card__badge-icon">
              {isVideo ? (
                <VideoGlyph className="gallery-icon" />
              ) : (
                <PhotoGlyph className="gallery-icon" />
              )}
            </span>
            {formatViews(views)}
          </span>
          {isVideo && duration && (
            <span className="featured-card__meta-item">{duration}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Featured({
  items,
  onOpen,
  titleMap,
  onRename,
  tagMap,
  onEditTags,
}: {
  items: GalleryItem[];
  onOpen: (idx: number) => void;
  titleMap?: Record<string, string>;
  onRename?: (id: string, title: string | null) => void;
  tagMap?: Record<string, string[]>;
  onEditTags?: (id: string, tags: string[]) => void;
}) {
  const [viewMap, setViewMap] = useState<Record<string, number>>({});
  const [img, vid] = useMemo(
    () => [pickRandom(items, "image"), pickRandom(items, "video")],
    [items]
  );

  useEffect(() => {
    function syncViews() {
      try {
        setViewMap(getViews());
      } catch {
        setViewMap({});
      }
    }
    syncViews();
    const handle = () => syncViews();
    window.addEventListener("storage", handle);
    window.addEventListener("gallery:view-updated", handle);
    return () => {
      window.removeEventListener("storage", handle);
      window.removeEventListener("gallery:view-updated", handle);
    };
  }, [items.length]);

  const handleClick = (id: string) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx >= 0) onOpen(idx);
  };

  return (
    <div className="featured-wrap">
      <div className="featured-grid">
        <FeaturedTile
          key="featured-image"
          item={img}
          type="image"
          views={img ? viewMap[img.id] ?? 0 : 0}
          onClick={handleClick}
          onRename={onRename}
          onEditTags={onEditTags}
          manualTags={img ? tagMap?.[img.id] ?? [] : []}
          titleOverride={img ? titleMap?.[img.id] ?? null : null}
        />
        <FeaturedTile
          key="featured-video"
          item={vid}
          type="video"
          views={vid ? viewMap[vid.id] ?? 0 : 0}
          onClick={handleClick}
          onRename={onRename}
          onEditTags={onEditTags}
          manualTags={vid ? tagMap?.[vid.id] ?? [] : []}
          titleOverride={vid ? titleMap?.[vid.id] ?? null : null}
        />
      </div>
    </div>
  );
}
