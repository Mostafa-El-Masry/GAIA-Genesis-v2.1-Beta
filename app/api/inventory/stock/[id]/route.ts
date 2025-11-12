import { NextRequest, NextResponse } from "next/server";
import { supabase, getAuthUser } from "@/lib/supabase-server";

interface InventoryStock {
  id: string;
  user_id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  reserved: number;
  available: number;
  reorder_point: number;
  reorder_qty: number;
  last_counted_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const { data, error } = await supabase
      .from("inventory_stock")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Stock entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/inventory/stock/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock entry" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Fetch existing record
    const { data: existing, error: fetchError } = await supabase
      .from("inventory_stock")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Stock entry not found" },
        { status: 404 }
      );
    }

    const { quantity, reserved, reorder_point, reorder_qty } = body;

    const updates: Record<string, any> = {};

    if (quantity !== undefined) {
      updates.quantity = quantity;
    }
    if (reserved !== undefined) {
      updates.reserved = reserved;
    }
    if (reorder_point !== undefined) {
      updates.reorder_point = reorder_point;
    }
    if (reorder_qty !== undefined) {
      updates.reorder_qty = reorder_qty;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Recalculate available when quantity or reserved changes
    if (quantity !== undefined || reserved !== undefined) {
      const newQty = quantity !== undefined ? quantity : existing.quantity;
      const newReserved = reserved !== undefined ? reserved : existing.reserved;
      updates.available = newQty - newReserved;
      updates.last_counted_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("inventory_stock")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("PUT /api/inventory/stock/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update stock entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from("inventory_stock")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Stock entry not found" },
        { status: 404 }
      );
    }

    // Hard delete for stock entries
    const { error } = await supabase
      .from("inventory_stock")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/inventory/stock/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete stock entry" },
      { status: 500 }
    );
  }
}
