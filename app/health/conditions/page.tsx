/**
 * app/health/conditions/page.tsx
 *
 * Health Conditions Management Page
 * List of conditions with add/edit/delete functionality
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ELEUTHIA } from "@/services/eleuthia/crypto";

interface Condition {
  id: string;
  user_id: string;
  name: string; // encrypted
  notes: string; // encrypted
  created_at: number;
}

interface DecryptedCondition extends Condition {
  decryptedName: string;
  decryptedNotes: string;
}

export default function ConditionsPage() {
  const [conditions, setConditions] = useState<DecryptedCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Initialize crypto and fetch conditions
  useEffect(() => {
    const init = async () => {
      try {
        await ELEUTHIA.init({
          devKey: process.env.NEXT_PUBLIC_ELEUTHIA_DEV_KEY,
        });
        await fetchConditions();
      } catch (err) {
        setError("Failed to initialize encryption or fetch conditions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchConditions = async () => {
    try {
      const res = await fetch("/api/health/conditions", {
        headers: { "x-user-id": "dev-user" },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const { data } = await res.json();

      // Decrypt each condition
      const decrypted = await Promise.all(
        data.map(async (c: Condition) => ({
          ...c,
          decryptedName: await ELEUTHIA.decrypt(c.name),
          decryptedNotes: c.notes ? await ELEUTHIA.decrypt(c.notes) : "",
        }))
      );
      setConditions(decrypted);
    } catch (err) {
      setError("Failed to fetch conditions");
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Condition name is required");
      return;
    }

    setSubmitting(true);
    try {
      // Encrypt fields
      const encryptedName = await ELEUTHIA.encrypt(name);
      const encryptedNotes = notes ? await ELEUTHIA.encrypt(notes) : "";

      const res = await fetch("/api/health/conditions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "dev-user",
        },
        body: JSON.stringify({
          name: encryptedName,
          notes: encryptedNotes || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to create condition");

      const newData = await res.json();

      // Optimistic UI update
      setConditions((prev) => [
        {
          ...newData.data,
          decryptedName: name,
          decryptedNotes: notes,
        } as DecryptedCondition,
        ...prev,
      ]);

      setName("");
      setNotes("");
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError("Failed to create condition");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this condition?")) return;

    try {
      const res = await fetch(`/api/health/conditions/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": "dev-user" },
      });

      if (!res.ok) throw new Error("Failed to delete");

      setConditions((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError("Failed to delete condition");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-gaia-muted">Initializing...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/health"
              className="text-sm text-blue-500 hover:underline mb-2 inline-block"
            >
              ← Back to Health
            </Link>
            <h1 className="text-4xl font-bold">Conditions</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg border gaia-border px-4 py-2 text-sm font-semibold gaia-hover-soft transition"
          >
            {showForm ? "Cancel" : "Add Condition"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 gaia-glass gaia-border border rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">New Condition</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Condition Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border gaia-border px-3 py-2 text-sm gaia-input"
                  placeholder="e.g., Type 2 Diabetes"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border gaia-border px-3 py-2 text-sm gaia-input"
                  placeholder="e.g., Diagnosed 2020..."
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg border gaia-border px-3 py-2 text-sm font-semibold gaia-hover-soft transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Add Condition"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {conditions.length === 0 ? (
            <p className="text-gaia-muted text-center py-8">
              No conditions recorded yet.
            </p>
          ) : (
            conditions.map((condition) => (
              <div
                key={condition.id}
                className="gaia-glass gaia-border border rounded-lg p-6 flex justify-between items-start"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {condition.decryptedName}
                  </h3>
                  {condition.decryptedNotes && (
                    <p className="text-sm gaia-muted mt-2">
                      {condition.decryptedNotes}
                    </p>
                  )}
                  <p className="text-xs gaia-muted mt-3">
                    Created:{" "}
                    {new Date(condition.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(condition.id)}
                  className="ml-4 text-xs text-red-500 hover:text-red-700 transition font-medium"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
