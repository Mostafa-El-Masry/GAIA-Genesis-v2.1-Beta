import { NextRequest, NextResponse } from "next/server";
import { supabase, getAuthUser } from "@/lib/supabase-server";

interface InventoryLocation {
  id: string;
  user_id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  location_type: string;
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

    const { data, error } = await supabase
      .from("inventory_locations")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error("GET /api/inventory/locations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch locations" },
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
    const { name, code, address, city, state, zip, location_type } = body;

    if (!name || !code || !location_type) {
      return NextResponse.json(
        { error: "Missing required fields: name, code, location_type" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("inventory_locations")
      .insert([
        {
          user_id: user.id,
          name,
          code,
          address: address || null,
          city: city || null,
          state: state || null,
          zip: zip || null,
          location_type,
          is_active: true,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ data: data?.[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/inventory/locations:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Location code already exists for this user" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create location" },
      { status: 500 }
    );
  }
}
