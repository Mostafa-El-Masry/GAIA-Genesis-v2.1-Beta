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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const locationId = request.nextUrl.searchParams.get("location_id");
    const productId = request.nextUrl.searchParams.get("product_id");

    let query = supabase
      .from("inventory_stock")
      .select("*")
      .eq("user_id", user.id);

    if (locationId) {
      query = query.eq("location_id", locationId);
    }
    if (productId) {
      query = query.eq("product_id", productId);
    }

    query = query.order("updated_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error("GET /api/inventory/stock:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stock" },
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
    const {
      product_id,
      location_id,
      quantity = 0,
      reorder_point = 10,
      reorder_qty = 50,
    } = body;

    if (!product_id || !location_id) {
      return NextResponse.json(
        { error: "Missing required fields: product_id, location_id" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("inventory_stock")
      .insert([
        {
          user_id: user.id,
          product_id,
          location_id,
          quantity,
          reserved: 0,
          available: quantity,
          reorder_point,
          reorder_qty,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ data: data?.[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/inventory/stock:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        {
          error:
            "Stock entry already exists for this product/location combination",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create stock entry" },
      { status: 500 }
    );
  }
}
