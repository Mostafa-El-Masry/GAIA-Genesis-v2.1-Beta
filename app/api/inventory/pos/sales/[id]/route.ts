import { NextRequest, NextResponse } from "next/server";
import { supabase, getAuthUser } from "@/lib/supabase-server";

interface POSSale {
  id: string;
  user_id: string;
  terminal_id: string;
  location_id: string;
  transaction_num: string;
  total_items: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string | null;
  customer_info: any;
  notes: string | null;
  voided: boolean;
  created_at: string;
}

interface POSSaleItem {
  id: string;
  user_id: string;
  sale_id: string;
  product_id: string;
  sku: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  line_total: number;
  line_profit: number;
  created_at: string;
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

    const { data: sale, error: saleError } = await supabase
      .from("pos_sales")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (saleError || !sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Get line items
    const { data: items, error: itemsError } = await supabase
      .from("pos_sale_items")
      .select("*")
      .eq("sale_id", id)
      .order("created_at", { ascending: true });

    if (itemsError) throw itemsError;

    return NextResponse.json({ data: { ...sale, items: items || [] } });
  } catch (error) {
    console.error("GET /api/inventory/pos/sales/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch sale" },
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

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from("pos_sales")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    const { notes, voided } = body;

    const updates: Record<string, any> = {};

    if (notes !== undefined) {
      updates.notes = notes;
    }
    if (voided !== undefined) {
      updates.voided = voided;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("pos_sales")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("PUT /api/inventory/pos/sales/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update sale" },
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
      .from("pos_sales")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Void the transaction instead of hard delete
    const { error } = await supabase
      .from("pos_sales")
      .update({ voided: true })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/inventory/pos/sales/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete sale" },
      { status: 500 }
    );
  }
}
