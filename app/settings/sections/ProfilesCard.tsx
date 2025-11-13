"use client";

import { useEffect, useState } from "react";
import { useAuthSnapshot } from "@/lib/auth-client";
import { getItem, setItem } from "@/lib/user-storage";

type SavedProfile = {
  email: string;
  name: string;
  savedAt: string;
};

const PROFILES_KEY = "gaia.saved-profiles";

export default function ProfilesCard() {
  const { profile, status } = useAuthSnapshot();
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");

  const currentEmail = profile?.email ?? status?.email ?? null;
  const currentName = profile?.name?.trim() ?? null;

  // Load saved profiles on mount
  useEffect(() => {
    const raw = getItem(PROFILES_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SavedProfile[];
        setProfiles(parsed);
      } catch {
        setProfiles([]);
      }
    }
  }, []);

  const saveCurrentProfile = () => {
    if (!currentEmail || !newName.trim()) return;

    const newProfile: SavedProfile = {
      email: currentEmail,
      name: newName.trim(),
      savedAt: new Date().toISOString(),
    };

    const updated = [
      newProfile,
      ...profiles.filter((p) => p.email !== currentEmail),
    ];
    setProfiles(updated);
    setItem(PROFILES_KEY, JSON.stringify(updated));
    setNewName("");
    setShowForm(false);
  };

  const removeProfile = (email: string) => {
    const updated = profiles.filter((p) => p.email !== email);
    setProfiles(updated);
    setItem(PROFILES_KEY, JSON.stringify(updated));
  };

  return (
    <section className="space-y-3 rounded-lg border gaia-border p-4">
      <h2 className="font-medium">Saved User Profiles</h2>
      <p className="text-sm gaia-muted">
        Save your profile information for quick access across sessions.
      </p>

      {currentEmail && (
        <div className="mt-4 rounded-md bg-blue-500/10 border border-blue-400/30 p-3">
          <div className="text-sm font-medium">Current Profile</div>
          <div className="text-xs gaia-muted mt-1">
            <div>Email: {currentEmail}</div>
            <div>Name: {currentName || "(not set)"}</div>
          </div>
        </div>
      )}

      {showForm ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveCurrentProfile();
          }}
          className="mt-3 space-y-2 rounded-md border gaia-border p-3"
        >
          <label className="text-xs font-medium">Display Name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter display name"
            className="w-full rounded border gaia-border px-2 py-1.5 text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!newName.trim()}
              className="rounded border px-3 py-1 text-sm gaia-contrast disabled:opacity-50"
            >
              Save Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewName("");
              }}
              className="rounded border gaia-border px-3 py-1 text-sm gaia-hover-soft"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded border px-3 py-1 text-sm gaia-contrast"
        >
          Save Current Profile
        </button>
      )}

      {profiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide gaia-muted">
            Saved Profiles ({profiles.length})
          </h3>
          <div className="space-y-2">
            {profiles.map((p) => (
              <div
                key={p.email}
                className="flex items-center justify-between rounded-md border gaia-border p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs gaia-muted truncate">{p.email}</div>
                  <div className="text-[11px] gaia-muted">
                    Saved {new Date(p.savedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeProfile(p.email)}
                  className="ml-3 rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                  title="Remove profile"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
