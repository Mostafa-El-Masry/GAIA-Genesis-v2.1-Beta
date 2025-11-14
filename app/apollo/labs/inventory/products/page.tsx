"use client";

/**
 * app/labs/inventory/products/page.tsx
 *
 * Products management
 * Create, edit, manage product catalog with pricing
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authenticatedFetch,
  getAuthenticatedUser,
} from "@/lib/supabase-client";
import { useAuth } from "@/app/context/AuthContext";

interface Product {
  id: string;
  user_id: string;
  sku: string;
  name: string;
  description: string | null;
  unit_cost: number;
  unit_price: number;
  category: string | null;
  is_active: number;
  created_at: number;
  updated_at: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    unit_cost: "",
    unit_price: "",
    category: "",
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    fetchProducts();
  }, [user, authLoading, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch("/api/inventory/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/inventory/products/${editingId}`
        : "/api/inventory/products";

      const res = await authenticatedFetch(url, {
        method,
        body: JSON.stringify({
          ...formData,
          unit_cost: parseFloat(formData.unit_cost) || 0,
          unit_price: parseFloat(formData.unit_price) || 0,
        }),
      });

      if (!res.ok)
        throw new Error(
          editingId ? "Failed to update product" : "Failed to create product"
        );

      await fetchProducts();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      unit_cost: product.unit_cost.toString(),
      unit_price: product.unit_price.toString(),
      category: product.category || "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await authenticatedFetch(`/api/inventory/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete product");
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      description: "",
      unit_cost: "",
      unit_price: "",
      category: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getMargin = (cost: number, price: number) => {
    if (cost === 0) return 0;
    return Math.round(((price - cost) / cost) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2"
          >
            &larr; Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage product catalog ({products.length} products)
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Product
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8 border-l-4 border-green-500">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="SKU12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Widget Pro"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Cost ($) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.unit_cost}
                  onChange={(e) =>
                    setFormData({ ...formData, unit_cost: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price ($) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) =>
                    setFormData({ ...formData, unit_price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Electronics"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                {editingId ? "Update Product" : "Create Product"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600">No products created yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                  Margin
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-mono text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="font-medium text-gray-900">
                      {product.name}
                    </div>
                    {product.description && (
                      <div className="text-xs text-gray-500">
                        {product.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {product.category || "-"}
                  </td>
                  <td className="px-6 py-3 text-sm text-right font-mono">
                    ${product.unit_cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-sm text-right font-mono">
                    ${product.unit_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-sm text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        getMargin(product.unit_cost, product.unit_price) > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {getMargin(product.unit_cost, product.unit_price)}%
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-right space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
