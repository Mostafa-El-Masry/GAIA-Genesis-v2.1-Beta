"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  useDesign,
  type ButtonStyle,
  type SearchStyle,
} from "@/app/DesignSystem/context/DesignProvider";
import { exportJSON, importJSON, loadData } from "@/app/apollo/lib/store";
import { THEMES, type Theme } from "@/app/DesignSystem/theme";
import {
  resetViews,
  getTagsMap,
  mergeItemTags,
  getAutoTagMeta,
  setAutoTagMeta,
} from "@/components/gallery/prefs";
import type { GalleryItem } from "@/components/gallery/types";
import { deriveAutoTags, AUTO_TAG_VERSION } from "@/components/gallery/tagging";
import {
  useAuthSnapshot,
  type StoredProfile,
} from "@/lib/auth-client";
import { normaliseEmail } from "@/lib/strings";
import {
  usePermissionSnapshot,
  isCreatorAdmin,
  getAvailablePermissionKeys,
  setPermissionFlag,
  getPermissionSet,
  createAdminPermissionSet,
  type PermissionKey,
} from "@/lib/permissions";
import PermissionGate from "@/components/permissions/PermissionGate";

const BUTTONS: ButtonStyle[] = ["solid", "outline", "ghost"];
const SEARCHES: SearchStyle[] = ["rounded", "pill", "underline"];

const THEME_OPTIONS = THEMES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

type GalleryStatus = {
  type: "loading" | "success" | "error" | "progress";
  message: string;
  progress?: number;
  detail?: string;
};

type ManifestResponse = {
  items?: GalleryItem[];
};

type TabId = "appearance" | "gallery" | "permissions";

type UsersFetchState = "idle" | "loading" | "success" | "error";

type CreateUserStatus = {
  type: "idle" | "loading" | "success" | "error";
  message: string;
};

type SupabaseDirectoryUser = {
  id: string;
  email: string | null;
  name: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  lastSignInAt: string | null;
};

type SupabaseDirectoryResponse = {
  users?: SupabaseDirectoryUser[];
  error?: string;
};

const PERMISSION_LABELS: Record<PermissionKey, string> = {
  apollo: "Apollo",
  archives: "Archives",
  classic: "Classic",
  dashboard: "Dashboard",
  eleuthia: "Eleuthia",
  gallery: "Gallery",
  health: "Health",
  labs: "Labs",
  locked: "Locked",
  timeline: "Timeline",
  wealth: "Wealth",
  settings: "Settings",
  settingsAppearance: "Settings · Appearance",
  settingsGallery: "Settings · Gallery",
  settingsPermissions: "Settings · Permissions",
};

const SETTINGS_TAB_CONFIG: Array<{
  id: TabId;
  label: string;
  permission: PermissionKey;
}> = [
  { id: "appearance", label: "Appearance", permission: "settingsAppearance" },
  { id: "gallery", label: "Gallery", permission: "settingsGallery" },
  {
    id: "permissions",
    label: "Permissions",
    permission: "settingsPermissions",
  },
];

function mapSupabaseUsersToProfiles(
  users: SupabaseDirectoryUser[] | undefined
): StoredProfile[] {
  if (!Array.isArray(users) || users.length === 0) return [];
  const fallbackTimestamp = new Date().toISOString();
  return users
    .map((user) => {
      const email = user.email?.trim();
      if (!email) return null;
      const createdAt = user.createdAt ?? fallbackTimestamp;
      return {
        id: user.id,
        email,
        name: user.name || null,
        createdAt,
        updatedAt: user.updatedAt ?? createdAt,
        lastLoginAt: user.lastSignInAt ?? undefined,
        lastLogoutAt: undefined,
        lastMode: undefined,
        sessionToken: undefined,
      };
    })
    .filter((profile): profile is StoredProfile => Boolean(profile));
}

async function fetchGalleryManifest(): Promise<GalleryItem[]> {
  try {
    const res = await fetch("/jsons/gallery-manifest.json", {
      cache: "no-store",
    });
    if (res.ok) {
      const json = (await res.json()) as ManifestResponse;
      if (Array.isArray(json.items)) return json.items;
    }
  } catch {
    /* ignore network failures and fall through to API */
  }

  const fallback = await fetch("/api/gallery/scan", { cache: "no-store" });
  if (!fallback.ok) {
    throw new Error(`Manifest request failed with status ${fallback.status}`);
  }
  const json = (await fallback.json()) as ManifestResponse;
  return Array.isArray(json.items) ? json.items : [];
}

export default function SettingsPage() {
  const { theme, setTheme, button, setButton, search, setSearch } = useDesign();
  const { profile, status } = useAuthSnapshot();
  const currentEmail = profile?.email ?? status?.email ?? null;
  const normalisedCurrentEmail = normaliseEmail(currentEmail);
  const isAdmin = isCreatorAdmin(normalisedCurrentEmail);
  const permissionSnapshot = usePermissionSnapshot();
  const permissionKeys = useMemo(() => getAvailablePermissionKeys(), []);

  const [syncing, setSyncing] = useState(false);
  const [autoTagging, setAutoTagging] = useState(false);
  const [autoTagProgress, setAutoTagProgress] = useState(0);
  const [galleryStatus, setGalleryStatus] = useState<GalleryStatus | null>(null);
  const [profiles, setProfiles] = useState<StoredProfile[]>([]);
  const [userDirectoryStatus, setUserDirectoryStatus] =
    useState<UsersFetchState>("idle");
  const [userDirectoryError, setUserDirectoryError] = useState<string | null>(
    null
  );
  const [userDirectoryReloadKey, setUserDirectoryReloadKey] = useState(0);
  const refreshUserDirectory = useCallback(() => {
    setUserDirectoryReloadKey((key) => key + 1);
  }, []);
  const [activeTab, setActiveTab] = useState<TabId>("appearance");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [createUserStatus, setCreateUserStatus] = useState<CreateUserStatus>({
    type: "idle",
    message: "",
  });

  useEffect(() => {
    if (!isAdmin) {
      setProfiles([]);
      setUserDirectoryStatus("idle");
      setUserDirectoryError(null);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function loadSupabaseUsers() {
      setUserDirectoryStatus("loading");
      setUserDirectoryError(null);

      try {
        const response = await fetch("/api/admin/users", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        let payload: SupabaseDirectoryResponse | null = null;
        const raw = await response.text();
        if (raw) {
          try {
            payload = JSON.parse(raw) as SupabaseDirectoryResponse;
          } catch {
            payload = null;
          }
        }

        if (!response.ok) {
          const detail =
            payload?.error ?? `Supabase request failed (${response.status})`;
          throw new Error(detail);
        }

        if (!cancelled) {
          setProfiles(mapSupabaseUsersToProfiles(payload?.users));
          setUserDirectoryStatus("success");
        }
      } catch (error) {
        if (controller.signal.aborted || cancelled) {
          return;
        }
        setUserDirectoryStatus("error");
        setUserDirectoryError(
          error instanceof Error
            ? error.message
            : "Unable to load Supabase users."
        );
      }
    }

    loadSupabaseUsers();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isAdmin, userDirectoryReloadKey]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleRefresh = () => refreshUserDirectory();
    const events = [
      "gaia:auth:login",
      "gaia:auth:logout",
      "gaia:permissions:update",
    ];
    events.forEach((event) => window.addEventListener(event, handleRefresh));
    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleRefresh)
      );
    };
  }, [refreshUserDirectory]);

  const handleCreateUser = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const email = newUserEmail.trim();
      const password = newUserPassword.trim();
      const name = newUserName.trim();

      if (!email || !password) {
        setCreateUserStatus({
          type: "error",
          message: "Email and password are required.",
        });
        return;
      }

      setCreateUserStatus({ type: "loading", message: "Creating user..." });

      try {
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            name: name || undefined,
          }),
        });

        let payload: { error?: string } | null = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to create user.");
        }

        setCreateUserStatus({
          type: "success",
          message: "User created. They can sign in with the credentials above.",
        });
        setNewUserEmail("");
        setNewUserName("");
        setNewUserPassword("");
        refreshUserDirectory();
      } catch (error) {
        setCreateUserStatus({
          type: "error",
          message:
            error instanceof Error ? error.message : "Unable to create user.",
        });
      }
    },
    [
      newUserEmail,
      newUserName,
      newUserPassword,
      refreshUserDirectory,
    ]
  );

  const availableTabs = useMemo(() => {
    const tabs: Array<{ id: TabId; label: string }> = [
      { id: "appearance", label: "Appearance" },
      { id: "gallery", label: "Gallery" },
    ];
    tabs.push({ id: "permissions", label: "Permissions" });
    return tabs;
  }, []);

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => {
      const aAdmin = isCreatorAdmin(a.email);
      const bAdmin = isCreatorAdmin(b.email);
      if (aAdmin !== bAdmin) return aAdmin ? -1 : 1;
      const aKey = normaliseEmail(a.email) ?? "";
      const bKey = normaliseEmail(b.email) ?? "";
      return aKey.localeCompare(bKey);
    });
  }, [profiles]);

  const handlePermissionChange = useCallback(
    (email: string, key: PermissionKey, value: boolean) => {
      setPermissionFlag(email, key, value);
    },
    []
  );

  const handleSyncGallery = useCallback(async () => {
    setSyncing(true);
    setGalleryStatus({
      type: "loading",
      message: "Syncing gallery... please wait.",
    });
    try {
      const res = await fetch("/api/gallery/scan", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Sync failed with status ${res.status}`);
      }
      window.dispatchEvent(new Event("gallery:refresh"));
      setGalleryStatus({
        type: "success",
        message: "Gallery sync requested. The gallery will reload shortly.",
      });
    } catch (error) {
      console.error(error);
      setGalleryStatus({
        type: "error",
        message: "Could not sync gallery. Please try again.",
      });
    } finally {
      setSyncing(false);
    }
  }, []);

  const handleResetViews = useCallback(() => {
    resetViews();
    setGalleryStatus({
      type: "success",
      message: "Gallery watch stats reset.",
    });
  }, []);

  const handleAutoTagging = useCallback(async () => {
    if (autoTagging) return;
    setAutoTagging(true);
    setAutoTagProgress(0);
    setGalleryStatus({
      type: "progress",
      message: "Auto-tagging media... 0%",
      progress: 0,
    });
    try {
      const items = await fetchGalleryManifest();
      if (!items.length) {
        setGalleryStatus({
          type: "success",
          message: "No gallery items available to tag.",
        });
        return;
      }
      const tagMap = getTagsMap();
      const autoMeta = getAutoTagMeta();
      let updatedItems = 0;
      let totalNewTags = 0;
      let previouslyTagged = 0;

      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const manualTags = tagMap[item.id] ?? [];
        const existingMeta = autoMeta[item.id];
        if (existingMeta?.version === AUTO_TAG_VERSION) {
          previouslyTagged += 1;
          continue;
        }

        const derived = deriveAutoTags(item);
        // deriveAutoTags returns an object { id, tags, matchedKeywords }
        // ensure there are discovered tags before continuing
        if (!derived || !derived.tags || derived.tags.length === 0) continue;

        // compute new tags that aren't already present (manual tags or item.tags)
        const existingTags = new Set<string>([
          ...(manualTags ?? []),
          ...(item.tags ?? []),
        ]);
        const newTags = derived.tags.filter((t) => !existingTags.has(t));

        if (newTags.length > 0) {
          // merge into storage and update local map
          mergeItemTags(item.id, newTags);
          tagMap[item.id] = Array.from(new Set([...existingTags, ...newTags]));
          updatedItems += 1;
          totalNewTags += newTags.length;
        } else if (autoMeta[item.id]) {
          previouslyTagged += 1;
        }

        // update auto-tag metadata entry
        autoMeta[item.id] = {
          version: AUTO_TAG_VERSION,
          tags: derived.tags,
          updatedAt: new Date().toISOString(),
        };

        const progress = (i + 1) / items.length;
        setAutoTagProgress(progress);
        setGalleryStatus({
          type: "progress",
          progress,
          message: `Auto-tagging media... ${Math.round(progress * 100)}%`,
          detail: `Processed ${i + 1} of ${items.length} items`,
        });
      }

      // Persist auto tag metadata per item
      for (const [id, meta] of Object.entries(autoMeta)) {
        // meta is AutoTagMeta
        setAutoTagMeta(id, meta as any);
      }
      window.dispatchEvent(
        new CustomEvent("gallery:tags-updated", { detail: { tagMap } })
      );
      window.dispatchEvent(new Event("storage"));

      setGalleryStatus({
        type: "success",
        message: "Auto-tagging complete.",
        detail: `Updated ${updatedItems} items (${totalNewTags} new tags). ${previouslyTagged} items were already up to date.`,
      });
    } catch (error) {
      console.error(error);
      setGalleryStatus({
        type: "error",
        message: "Auto-tagging failed. Please try again later.",
      });
    } finally {
      setAutoTagging(false);
      setAutoTagProgress(0);
    }
  }, [autoTagging]);

  const handleExportApollo = useCallback(() => {
    const data = loadData();
    exportJSON(data);
  }, []);

  const handleImportApollo = useCallback(() => {
    importJSON((data) => {
      try {
        window.dispatchEvent(new CustomEvent("gaia:apollo:data", { detail: { data } }));
      } catch {
        // no-op if window not available
      }
    });
  }, []);

  return (
    <PermissionGate permission="settings">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
        <h1 className="text-2xl font-semibold">Settings</h1>

        <div className="flex flex-wrap gap-2">
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  isActive ? "gaia-contrast" : "gaia-border gaia-hover-soft"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "appearance" && (
          <>
            <section className="space-y-3 rounded-lg border gaia-border p-4">
              <h2 className="font-medium">Theme</h2>
              <select
                className="w-full rounded border gaia-border px-3 py-2 text-sm"
                value={theme}
                onChange={(event) => setTheme(event.target.value as Theme)}
              >
                {THEME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs gaia-muted">
                Applies everywhere. Stored in your browser.
              </p>
            </section>

            <section className="space-y-3 rounded-lg border gaia-border p-4">
              <h2 className="font-medium">Button</h2>
              <div className="flex flex-wrap items-center gap-2">
                {BUTTONS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setButton(b)}
                    className={`rounded border px-3 py-1 text-sm capitalize ${
                      button === b
                        ? "gaia-contrast"
                        : "gaia-border gaia-hover-soft"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-lg border gaia-border p-4">
              <h2 className="font-medium">Search bar</h2>
              <div className="flex flex-wrap items-center gap-2">
                {SEARCHES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSearch(s)}
                    className={`rounded border px-3 py-1 text-sm capitalize ${
                      search === s
                        ? "gaia-contrast"
                        : "gaia-border gaia-hover-soft"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-lg border gaia-border p-4">
              <h2 className="font-medium">Apollo archives</h2>
              <p className="text-sm gaia-muted">
                Export a backup of your local Apollo notes or import a saved JSON file.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportApollo}
                  className="rounded border px-3 py-1 text-sm gaia-contrast"
                >
                  Export archive
                </button>
                <button
                  type="button"
                  onClick={handleImportApollo}
                  className="rounded border px-3 py-1 text-sm gaia-border gaia-hover-soft"
                >
                  Import archive
                </button>
              </div>
              <p className="text-xs gaia-muted">
                Data stays on this device; imports overwrite your current local archive.
              </p>
            </section>
          </>
        )}

        {activeTab === "gallery" && (
          <section className="space-y-3 rounded-lg border gaia-border p-4">
            <h2 className="font-medium">Gallery maintenance</h2>
            <p className="text-sm gaia-muted">
              Trigger a new scan or clear saved watch/preview time tracked on this device.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSyncGallery}
                className={`rounded border px-3 py-1 text-sm ${
                  syncing
                    ? "cursor-not-allowed opacity-70 gaia-contrast"
                    : "gaia-contrast"
                }`}
                disabled={syncing}
                aria-busy={syncing}
              >
                {syncing ? "Syncing..." : "Sync gallery"}
              </button>
              <button
                type="button"
                onClick={handleResetViews}
                className="rounded border px-3 py-1 text-sm gaia-border gaia-hover-soft"
              >
                Reset watch data
              </button>
              <button
                type="button"
                onClick={handleAutoTagging}
                className={`rounded border px-3 py-1 text-sm gaia-border gaia-hover-soft ${
                  autoTagging ? "cursor-not-allowed opacity-70" : ""
                }`}
                disabled={autoTagging}
                aria-busy={autoTagging}
              >
                {autoTagging
                  ? `Auto-tagging ${Math.round(autoTagProgress * 100)}%`
                  : "Auto-tag media"}
              </button>
            </div>
            {galleryStatus && (
              <div
                className={`mt-2 space-y-2 rounded border px-3 py-2 text-xs ${
                  galleryStatus.type === "error"
                    ? "border-red-500 text-red-400"
                    : galleryStatus.type === "success"
                    ? "border-green-500 text-green-400"
                    : "border-blue-500 text-blue-300"
                }`}
                role="status"
                aria-live="polite"
              >
                {(galleryStatus.type === "loading" ||
                  galleryStatus.type === "progress") && (
                  <progress
                    className="h-2 w-full overflow-hidden rounded bg-transparent"
                    max={1}
                    value={galleryStatus.progress ?? undefined}
                  />
                )}
                <p className="font-medium">{galleryStatus.message}</p>
                {galleryStatus.detail && (
                  <p className="text-[11px] opacity-75">
                    {galleryStatus.detail}
                  </p>
                )}
                {galleryStatus.type === "success" && !galleryStatus.detail && (
                  <p className="text-[11px] opacity-75">
                    You can return to the gallery to view the latest items.
                  </p>
                )}
                {galleryStatus.type === "error" && (
                  <p className="text-[11px] opacity-75">
                    Check your connection or try again later.
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "permissions" && isAdmin && (
          <>
            <section className="space-y-4 rounded-lg border gaia-border p-4">
              <div>
                <h2 className="font-medium">Invite a new user</h2>
                <p className="text-sm gaia-muted">
                  Create an account directly in Supabase. Share the credentials
                  privately or ask them to reset their password after the first
                  sign in.
                </p>
              </div>
              <form
                className="grid gap-3 md:grid-cols-2"
                onSubmit={handleCreateUser}
              >
                <label className="flex flex-col gap-1 text-sm">
                  <span>Email</span>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(event) => setNewUserEmail(event.target.value)}
                    className="gaia-input rounded border px-3 py-2"
                    placeholder="user@example.com"
                    autoComplete="email"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Full name (optional)</span>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(event) => setNewUserName(event.target.value)}
                    className="gaia-input rounded border px-3 py-2"
                    placeholder="Nova Solis"
                    autoComplete="name"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm md:col-span-2">
                  <span>Temporary password</span>
                  <input
                    type="password"
                    required
                    value={newUserPassword}
                    onChange={(event) => setNewUserPassword(event.target.value)}
                    className="gaia-input rounded border px-3 py-2"
                    placeholder="********"
                    autoComplete="new-password"
                  />
                </label>
                <div className="md:col-span-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <button
                    type="submit"
                    className="rounded-lg border border-cyan-400 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 disabled:opacity-70"
                    disabled={createUserStatus.type === "loading"}
                  >
                    {createUserStatus.type === "loading"
                      ? "Creating..."
                      : "Create user"}
                  </button>
                  {createUserStatus.message && (
                    <p
                      className={`text-sm ${
                        createUserStatus.type === "error"
                          ? "text-rose-400"
                          : createUserStatus.type === "success"
                          ? "text-emerald-400"
                          : "gaia-muted"
                      }`}
                    >
                      {createUserStatus.message}
                    </p>
                  )}
                </div>
              </form>
            </section>

            <section className="space-y-4 rounded-lg border gaia-border p-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-medium">User permissions</h2>
                <button
                  type="button"
                  onClick={refreshUserDirectory}
                  className="text-xs font-semibold text-cyan-300 transition hover:text-cyan-100 disabled:opacity-50"
                  disabled={userDirectoryStatus === "loading"}
                >
                  Refresh from Supabase
                </button>
              </div>
            <p className="text-sm gaia-muted">
              Grant or revoke access to protected areas. Changes are saved
              instantly and apply on the next navigation.
            </p>
            {userDirectoryStatus === "loading" && (
              <p className="text-xs gaia-muted">
                Fetching users from Supabase...
              </p>
            )}
            {userDirectoryStatus === "error" && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-rose-400">
                <span>
                  Could not load Supabase users
                  {userDirectoryError ? `: ${userDirectoryError}` : "."}
                </span>
                <button
                  type="button"
                  className="rounded border border-rose-400/60 px-2 py-1 text-[11px] text-rose-100 transition hover:border-rose-300 hover:text-rose-50"
                  onClick={refreshUserDirectory}
                >
                  Retry
                </button>
              </div>
            )}
            {sortedProfiles.length === 0 ? (
              <p className="text-sm gaia-muted">No users have signed in yet.</p>
            ) : (
              <div className="space-y-4">
                {sortedProfiles.map((user) => {
                  const email = user.email;
                  const normalised = normaliseEmail(email);
                  const userIsCreator = isCreatorAdmin(email);
                  const permissionSet = userIsCreator
                    ? createAdminPermissionSet()
                    : normalised
                    ? permissionSnapshot[normalised] ?? getPermissionSet(email)
                    : getPermissionSet(email);

                  return (
                    <div
                      key={user.id}
                      className="rounded-lg border gaia-border p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold">
                            {user.name || email}
                          </p>
                          <p className="text-xs gaia-muted">
                            {email}
                            {userIsCreator && " · Creator admin"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          {permissionKeys.map((key) => {
                            const checked = Boolean(permissionSet?.[key]);
                            return (
                              <label
                                key={key}
                                className={`flex items-center gap-2 text-sm ${
                                  userIsCreator ? "opacity-70" : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="rounded border gaia-border"
                                  checked={checked}
                                  disabled={userIsCreator}
                                  onChange={(event) =>
                                    handlePermissionChange(
                                      email,
                                      key,
                                      event.target.checked
                                    )
                                  }
                                />
                                {PERMISSION_LABELS[key]}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </section>
          </>
        )}

        {activeTab === "permissions" && !isAdmin && (
          <section className="rounded-lg border gaia-border p-4">
            <h2 className="font-medium">User permissions</h2>
            <p className="text-sm gaia-muted">
              Only the Creator admin can manage permissions.
            </p>
          </section>
        )}
      </main>
    </PermissionGate>
  );
}
