"use client";

import { useRouter } from "next/navigation";

export default function StockPage() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2"
      >
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Stock Management
      </h1>
      <p className="text-gray-600 mb-6">Track inventory levels by location</p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-blue-700">
        <p>📦 Stock management interface coming soon.</p>
        <p className="text-sm mt-2">This page will show:</p>
        <ul className="text-sm mt-2 ml-4 list-disc">
          <li>Stock levels for all products at each location</li>
          <li>Low stock alerts</li>
          <li>Reorder suggestions</li>
          <li>Stock adjustment tracking</li>
        </ul>
      </div>
    </div>
  );
}
