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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const terminalId = request.nextUrl.searchParams.get("terminal_id");
    const locationId = request.nextUrl.searchParams.get("location_id");
    const startDate = request.nextUrl.searchParams.get("start_date");
    const endDate = request.nextUrl.searchParams.get("end_date");

    let query = supabase.from("pos_sales").select("*").eq("user_id", user.id);

    if (terminalId) {
      query = query.eq("terminal_id", terminalId);
    }
    if (locationId) {
      query = query.eq("location_id", locationId);
    }
    if (startDate) {
      query = query.gte(
        "created_at",
        new Date(parseInt(startDate)).toISOString()
      );
    }
    if (endDate) {
      query = query.lte(
        "created_at",
        new Date(parseInt(endDate)).toISOString()
      );
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error("GET /api/inventory/pos/sales:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sales" },
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
      terminal_id,
      location_id,
      transaction_num,
      total_items,
      subtotal,
      tax_amount = 0,
      total_amount,
      payment_method,
      customer_info,
      notes,
      items = [],
    } = body;

    if (!terminal_id || !location_id || !transaction_num || !total_amount) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: terminal_id, location_id, transaction_num, total_amount",
        },
        { status: 400 }
      );
    }

    const saleId = crypto.randomUUID();

    // Insert sale header
    const { data: saleData, error: saleError } = await supabase
      .from("pos_sales")
      .insert([
        {
          id: saleId,
          user_id: user.id,
          terminal_id,
          location_id,
          transaction_num,
          total_items: total_items || 0,
          subtotal,
          tax_amount,
          total_amount,
          payment_method: payment_method || null,
          customer_info: customer_info || null,
          notes: notes || null,
          voided: false,
        },
      ])
      .select();

    if (saleError) throw saleError;

    // Insert line items
    for (const item of items) {
      const { product_id, sku, product_name, quantity, unit_price, unit_cost } =
        item;

      if (
        !product_id ||
        !sku ||
        !product_name ||
        !quantity ||
        unit_price === undefined ||
        unit_cost === undefined
      ) {
        continue; // Skip invalid items
      }

      const lineTotal = quantity * unit_price;
      const lineProfit = (unit_price - unit_cost) * quantity;
      const itemId = crypto.randomUUID();

      await supabase.from("pos_sale_items").insert([
        {
          id: itemId,
          user_id: user.id,
          sale_id: saleId,
          product_id,
          sku,
          product_name,
          quantity,
          unit_price,
          unit_cost,
          line_total: lineTotal,
          line_profit: lineProfit,
        },
      ]);

      // Update terminal last_online
      await supabase
        .from("pos_terminals")
        .update({ last_online: new Date().toISOString() })
        .eq("id", terminal_id);
    }

    return NextResponse.json({ data: saleData?.[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/inventory/pos/sales:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Transaction number already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create sale" },
      { status: 500 }
    );
  }
}
