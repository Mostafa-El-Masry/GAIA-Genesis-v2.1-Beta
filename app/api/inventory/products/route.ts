import { NextRequest, NextResponse } from "next/server";
import { supabase, getAuthUser } from "@/lib/supabase-server";

interface InventoryProduct {
  id: string;
  user_id: string;
  sku: string;
  name: string;
  description: string | null;
  unit_cost: number;
  unit_price: number;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const category = request.nextUrl.searchParams.get("category");

    let query = supabase
      .from("inventory_products")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (category) {
      query = query.eq("category", category);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error("GET /api/inventory/products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sku, name, description, unit_cost, unit_price, category } = body;

    if (!sku || !name || unit_cost === undefined || unit_price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: sku, name, unit_cost, unit_price" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("inventory_products")
      .insert([
        {
          user_id: user.id,
          sku,
          name,
          description: description || null,
          unit_cost,
          unit_price,
          category: category || null,
          is_active: true,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ data: data?.[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/inventory/products:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "SKU already exists for this user" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
