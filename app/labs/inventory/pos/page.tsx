"use client";

import { useRouter } from "next/navigation";

export default function POSPage() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2"
      >
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">POS Terminals</h1>
      <p className="text-gray-600 mb-6">Manage 8 checkout stations</p>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-purple-700">
        <p>🛒 POS terminal management interface coming soon.</p>
        <p className="text-sm mt-2">This page will allow:</p>
        <ul className="text-sm mt-2 ml-4 list-disc">
          <li>Create/configure 8 POS terminals (1-8)</li>
          <li>Assign terminals to locations</li>
          <li>View terminal status and last activity</li>
          <li>Start checkout sessions</li>
          <li>Generate receipts</li>
        </ul>
      </div>
    </div>
  );
}
