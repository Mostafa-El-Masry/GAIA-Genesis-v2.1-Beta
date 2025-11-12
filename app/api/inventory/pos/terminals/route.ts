import { NextRequest, NextResponse } from "next/server";
import { supabase, getAuthUser } from "@/lib/supabase-server";

interface POSTerminal {
  id: string;
  user_id: string;
  terminal_num: number;
  location_id: string;
  terminal_name: string | null;
  is_active: boolean;
  last_online: string | null;
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

    let query = supabase
      .from("pos_terminals")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (locationId) {
      query = query.eq("location_id", locationId);
    }

    query = query.order("terminal_num", { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error("GET /api/inventory/pos/terminals:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch terminals" },
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
    const { terminal_num, location_id, terminal_name } = body;

    if (!terminal_num || !location_id) {
      return NextResponse.json(
        { error: "Missing required fields: terminal_num, location_id" },
        { status: 400 }
      );
    }

    if (terminal_num < 1 || terminal_num > 8) {
      return NextResponse.json(
        { error: "Terminal number must be between 1 and 8" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("pos_terminals")
      .insert([
        {
          user_id: user.id,
          terminal_num,
          location_id,
          terminal_name: terminal_name || null,
          is_active: true,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ data: data?.[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/inventory/pos/terminals:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Terminal number already exists for this user" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create terminal" },
      { status: 500 }
    );
  }
}
