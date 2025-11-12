/**
 * app/health/meds/page.tsx
 *
 * Health Medications Management Page
 * List of medications with add/edit/delete functionality
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ELEUTHIA } from "@/services/eleuthia/crypto";

interface Medication {
  id: string;
  user_id: string;
  name: string; // encrypted
  dose: string; // encrypted
  unit: string; // encrypted or plaintext
  schedule: string; // encrypted (JSON)
  created_at: number;
}

interface DecryptedMedication extends Medication {
  decryptedName: string;
  decryptedDose: string;
  decryptedSchedule: string;
}

export default function MedsPage() {
  const [meds, setMeds] = useState<DecryptedMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dose: "",
    unit: "",
    schedule: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await ELEUTHIA.init({
          devKey: process.env.NEXT_PUBLIC_ELEUTHIA_DEV_KEY,
        });
        await fetchMeds();
      } catch (err) {
        setError("Failed to initialize encryption or fetch medications");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchMeds = async () => {
    try {
      const res = await fetch("/api/health/meds", {
        headers: { "x-user-id": "dev-user" },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const { data } = await res.json();

      const decrypted = await Promise.all(
        data.map(async (m: Medication) => ({
          ...m,
          decryptedName: await ELEUTHIA.decrypt(m.name),
          decryptedDose: await ELEUTHIA.decrypt(m.dose),
          decryptedSchedule: m.schedule
            ? await ELEUTHIA.decrypt(m.schedule)
            : "",
        }))
      );
      setMeds(decrypted);
    } catch (err) {
      setError("Failed to fetch medications");
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dose.trim()) {
      setError("Name and dose are required");
      return;
    }

    setSubmitting(true);
    try {
      const encryptedName = await ELEUTHIA.encrypt(formData.name);
      const encryptedDose = await ELEUTHIA.encrypt(formData.dose);
      const encryptedSchedule = formData.schedule
        ? await ELEUTHIA.encrypt(formData.schedule)
        : undefined;

      const res = await fetch("/api/health/meds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "dev-user",
        },
        body: JSON.stringify({
          name: encryptedName,
          dose: encryptedDose,
          unit: formData.unit || undefined,
          schedule: encryptedSchedule,
        }),
      });

      if (!res.ok) throw new Error("Failed to create medication");

      const newData = await res.json();
      setMeds((prev) => [
        {
          ...newData.data,
          decryptedName: formData.name,
          decryptedDose: formData.dose,
          decryptedSchedule: formData.schedule,
        } as DecryptedMedication,
        ...prev,
      ]);

      setFormData({ name: "", dose: "", unit: "", schedule: "" });
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError("Failed to create medication");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medication?")) return;

    try {
      const res = await fetch(`/api/health/meds/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": "dev-user" },
      });

      if (!res.ok) throw new Error("Failed to delete");
      setMeds((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError("Failed to delete medication");
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
            <h1 className="text-4xl font-bold">Medications</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg border gaia-border px-4 py-2 text-sm font-semibold gaia-hover-soft transition"
          >
            {showForm ? "Cancel" : "Add Medication"}
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
            <h2 className="text-lg font-semibold mb-4">New Medication</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border gaia-border px-3 py-2 text-sm gaia-input"
                  placeholder="e.g., Metformin"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Dose *
                  </label>
                  <input
                    type="text"
                    value={formData.dose}
                    onChange={(e) =>
                      setFormData({ ...formData, dose: e.target.value })
                    }
                    className="w-full rounded-lg border gaia-border px-3 py-2 text-sm gaia-input"
                    placeholder="e.g., 500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full rounded-lg border gaia-border px-3 py-2 text-sm gaia-input"
                    placeholder="e.g., mg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Schedule
                </label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule: e.target.value })
                  }
                  className="w-full rounded-lg border gaia-border px-3 py-2 text-sm gaia-input"
                  placeholder="e.g., Twice daily with meals"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg border gaia-border px-3 py-2 text-sm font-semibold gaia-hover-soft transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Add Medication"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {meds.length === 0 ? (
            <p className="text-gaia-muted text-center py-8">
              No medications recorded yet.
            </p>
          ) : (
            meds.map((med) => (
              <div
                key={med.id}
                className="gaia-glass gaia-border border rounded-lg p-6 flex justify-between items-start"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{med.decryptedName}</h3>
                  <p className="text-sm gaia-muted mt-1">
                    Dose: {med.decryptedDose} {med.unit ? `${med.unit}` : ""}
                  </p>
                  {med.decryptedSchedule && (
                    <p className="text-sm gaia-muted">
                      Schedule: {med.decryptedSchedule}
                    </p>
                  )}
                  <p className="text-xs gaia-muted mt-3">
                    Created: {new Date(med.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(med.id)}
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
