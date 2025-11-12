/**
 * app/health/metrics/page.tsx
 *
 * Health Metrics Management Page
 * Log and view health measurements (weight, blood glucose, etc.)
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ELEUTHIA } from "@/services/eleuthia/crypto";

interface Metric {
  id: string;
  user_id: string;
  date: number;
  weight: number;
  bg_fasting: number;
  bg_post: number;
  notes: string; // encrypted
  created_at: number;
}

interface DecryptedMetric extends Metric {
  decryptedNotes: string;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<DecryptedMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
    bg_fasting: "",
    bg_post: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await ELEUTHIA.init({
          devKey: process.env.NEXT_PUBLIC_ELEUTHIA_DEV_KEY,
        });
        await fetchMetrics();
      } catch (err) {
        setError("Failed to initialize encryption or fetch metrics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/health/metrics", {
        headers: { "x-user-id": "dev-user" },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const { data } = await res.json();

      const decrypted = await Promise.all(
        data.map(async (m: Metric) => ({
          ...m,
          decryptedNotes: m.notes ? await ELEUTHIA.decrypt(m.notes) : "",
        }))
      );
      setMetrics(decrypted);
    } catch (err) {
      setError("Failed to fetch metrics");
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) {
      setError("Date is required");
      return;
    }

    setSubmitting(true);
    try {
      const dateMs = new Date(formData.date).getTime();
      const encryptedNotes = formData.notes
        ? await ELEUTHIA.encrypt(formData.notes)
        : undefined;

      const res = await fetch("/api/health/metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "dev-user",
        },
        body: JSON.stringify({
          date: dateMs,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          bg_fasting: formData.bg_fasting
            ? parseFloat(formData.bg_fasting)
            : undefined,
          bg_post: formData.bg_post ? parseFloat(formData.bg_post) : undefined,
          notes: encryptedNotes,
        }),
      });

      if (!res.ok) throw new Error("Failed to create metric");

      const newData = await res.json();
      setMetrics((prev) => [
        {
          ...newData.data,
          decryptedNotes: formData.notes,
        } as DecryptedMetric,
        ...prev,
      ]);

      setFormData({
        date: new Date().toISOString().split("T")[0],
        weight: "",
        bg_fasting: "",
        bg_post: "",
        notes: "",
      });
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError("Failed to create metric");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this metric?")) return;

    try {
      const res = await fetch(`/api/health/metrics/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": "dev-user" },
      });

      if (!res.ok) throw new Error("Failed to delete");
      setMetrics((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError("Failed to delete metric");
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
            <h1 className="text-4xl font-bold">Health Metrics</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg border gaia-border px-4 py-2 text-sm font-semibold gaia-hover-soft transition"
          >
            {showForm ? "Cancel" : "Log Metric"}
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
            <h2 className="text-lg font-semibold mb-4">Log New Metric</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full rounded-lg border gaia-border px-3 py-2 text-sm gaia-input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    className="w-full rounded-lg border gaia-border px-3 py-2 text-sm gaia-input"
                    placeholder="e.g., 75.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Fasting Blood Glucose (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={formData.bg_fasting}
                    onChange={(e) =>
                      setFormData({ ...formData, bg_fasting: e.target.value })
                    }
                    className="w-full rounded-lg border gaia-border px-3 py-2 text-sm gaia-input"
                    placeholder="e.g., 110"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Post-Meal Blood Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  value={formData.bg_post}
                  onChange={(e) =>
                    setFormData({ ...formData, bg_post: e.target.value })
                  }
                  className="w-full rounded-lg border gaia-border px-3 py-2 text-sm gaia-input"
                  placeholder="e.g., 180"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full rounded-lg border gaia-border px-3 py-2 text-sm gaia-input"
                  placeholder="e.g., Felt good today, normal activity..."
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg border gaia-border px-3 py-2 text-sm font-semibold gaia-hover-soft transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Log Metric"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {metrics.length === 0 ? (
            <p className="text-gaia-muted text-center py-8">
              No metrics recorded yet.
            </p>
          ) : (
            metrics.map((metric) => (
              <div
                key={metric.id}
                className="gaia-glass gaia-border border rounded-lg p-6 flex justify-between items-start"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {new Date(metric.date).toLocaleDateString()}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    {metric.weight && (
                      <div>
                        <p className="gaia-muted text-xs">Weight</p>
                        <p className="font-medium">{metric.weight} kg</p>
                      </div>
                    )}
                    {metric.bg_fasting && (
                      <div>
                        <p className="gaia-muted text-xs">Fasting BG</p>
                        <p className="font-medium">{metric.bg_fasting} mg/dL</p>
                      </div>
                    )}
                    {metric.bg_post && (
                      <div>
                        <p className="gaia-muted text-xs">Post-Meal BG</p>
                        <p className="font-medium">{metric.bg_post} mg/dL</p>
                      </div>
                    )}
                  </div>
                  {metric.decryptedNotes && (
                    <p className="text-sm gaia-muted mt-4">
                      Notes: {metric.decryptedNotes}
                    </p>
                  )}
                  <p className="text-xs gaia-muted mt-3">
                    Logged: {new Date(metric.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(metric.id)}
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
