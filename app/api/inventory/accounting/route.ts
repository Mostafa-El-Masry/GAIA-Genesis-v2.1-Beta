import { NextRequest, NextResponse } from "next/server";
import { supabase, getAuthUser } from "@/lib/supabase-server";

interface CostAccounting {
  id: string;
  user_id: string;
  date_period: string;
  location_id: string | null;
  total_sales: number;
  total_cost: number;
  total_profit: number;
  profit_margin: number;
  transaction_count: number;
  items_sold: number;
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
    const period = request.nextUrl.searchParams.get("period");

    let query = supabase
      .from("cost_accounting")
      .select("*")
      .eq("user_id", user.id);

    if (locationId) {
      query = query.eq("location_id", locationId);
    } else {
      query = query.is("location_id", null);
    }

    if (period) {
      query = query.eq("date_period", period);
    }

    query = query.order("date_period", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error("GET /api/inventory/accounting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch accounting records" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory/accounting/calculate
 * Calculates and upserts accounting records based on sales data
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { date_period, location_id } = body;

    if (!date_period) {
      return NextResponse.json(
        { error: "Missing required field: date_period" },
        { status: 400 }
      );
    }

    // Convert date_period to ISO date range
    let startDate: string;
    let endDate: string;

    if (date_period.length === 10) {
      startDate = `${date_period}T00:00:00Z`;
      const nextDay = new Date(date_period);
      nextDay.setDate(nextDay.getDate() + 1);
      endDate = nextDay.toISOString().split("T")[0] + "T00:00:00Z";
    } else if (date_period.length === 7) {
      startDate = `${date_period}-01T00:00:00Z`;
      const [year, month] = date_period.split("-").map(Number);
      const nextMonth = new Date(year, month, 1);
      endDate = nextMonth.toISOString().split("T")[0] + "T00:00:00Z";
    } else {
      return NextResponse.json(
        { error: "Invalid date_period format. Use YYYY-MM-DD or YYYY-MM" },
        { status: 400 }
      );
    }

    // Query sales data
    const { data: allItems, error: itemsError } = await supabase
      .from("pos_sale_items")
      .select(
        `line_total, line_profit, quantity, pos_sales(id, voided, created_at, location_id)`
      );

    if (itemsError) throw itemsError;

    // Filter for active sales and date range
    const filteredItems = (allItems || [])
      .filter((item: any) => {
        const sale = item.pos_sales;
        if (!sale || sale.voided) return false;
        const saleDate = new Date(sale.created_at);
        return saleDate >= new Date(startDate) && saleDate < new Date(endDate);
      })
      .filter((item: any) => {
        if (!location_id) return true;
        return item.pos_sales?.location_id === location_id;
      });

    // Calculate totals
    let total_sales = 0;
    let total_profit = 0;
    let items_sold = 0;
    const transactionIds = new Set<string>();

    for (const item of filteredItems) {
      const sale = item.pos_sales;
      total_sales += parseFloat(item.line_total) || 0;
      total_profit += parseFloat(item.line_profit) || 0;
      items_sold += parseInt(item.quantity) || 0;
      if (sale?.id) transactionIds.add(sale.id);
    }

    const total_cost = total_sales - total_profit;
    const transaction_count = transactionIds.size;
    const profit_margin =
      total_sales > 0 ? (total_profit / total_sales) * 100 : 0;

    // Check if record exists
    let existingQuery = supabase
      .from("cost_accounting")
      .select("*")
      .eq("user_id", user.id)
      .eq("date_period", date_period);

    if (location_id) {
      existingQuery = existingQuery.eq("location_id", location_id);
    } else {
      existingQuery = existingQuery.is("location_id", null);
    }

    const { data: existingData, error: existingError } = await existingQuery;

    if (existingError) throw existingError;

    const existing = existingData?.[0];

    if (existing) {
      const { data, error } = await supabase
        .from("cost_accounting")
        .update({
          total_sales,
          total_cost,
          total_profit,
          profit_margin,
          transaction_count,
          items_sold,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ data }, { status: 200 });
    } else {
      const { data, error } = await supabase
        .from("cost_accounting")
        .insert([
          {
            user_id: user.id,
            date_period,
            location_id: location_id || null,
            total_sales,
            total_cost,
            total_profit,
            profit_margin,
            transaction_count,
            items_sold,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ data }, { status: 201 });
    }
  } catch (error: any) {
    console.error("POST /api/inventory/accounting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate accounting" },
      { status: 500 }
    );
  }
}
