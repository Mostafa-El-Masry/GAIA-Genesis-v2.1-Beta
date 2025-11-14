"use client";

import { useRouter } from "next/navigation";

export default function AccountingPage() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2"
      >
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Cost Accounting</h1>
      <p className="text-gray-600 mb-6">Profit & loss tracking and analysis</p>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <p>💰 Cost accounting dashboard coming soon.</p>
        <p className="text-sm mt-2">This page will show:</p>
        <ul className="text-sm mt-2 ml-4 list-disc">
          <li>Daily/monthly profit & loss reports</li>
          <li>Profit margins by location</li>
          <li>Cost of goods sold (COGS) analysis</li>
          <li>Revenue vs. cost comparison</li>
          <li>Detailed cost breakdown by product</li>
          <li>Performance metrics and KPIs</li>
        </ul>
      </div>
    </div>
  );
}
