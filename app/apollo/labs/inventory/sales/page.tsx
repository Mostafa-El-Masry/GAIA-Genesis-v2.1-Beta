"use client";

import { useRouter } from "next/navigation";

export default function SalesPage() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2"
      >
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Reports</h1>
      <p className="text-gray-600 mb-6">View transaction history and trends</p>
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-indigo-700">
        <p>📊 Sales reporting interface coming soon.</p>
        <p className="text-sm mt-2">This page will display:</p>
        <ul className="text-sm mt-2 ml-4 list-disc">
          <li>Transaction history with filters</li>
          <li>Daily/weekly/monthly sales totals</li>
          <li>Payment method breakdown</li>
          <li>Top selling products</li>
          <li>Sales by location and terminal</li>
        </ul>
      </div>
    </div>
  );
}
