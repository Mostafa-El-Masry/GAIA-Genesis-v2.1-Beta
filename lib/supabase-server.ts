/**
 * lib/supabase-server.ts
 *
 * Supabase server-side client for API routes
 * Handles database queries and authentication
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Get the authenticated user from session
 */
export async function getAuthUser(req: any) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw new Error("No authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

/**
 * Helper to query data with user isolation
 */
export async function queryWithUserIsolation(
  table: string,
  userId: string,
  filters?: Record<string, any>
) {
  let query = supabase.from(table).select("*").eq("user_id", userId);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Helper to insert data
 */
export async function insertData(table: string, data: any) {
  const { data: result, error } = await supabase
    .from(table)
    .insert([data])
    .select();

  if (error) throw error;
  return result?.[0];
}

/**
 * Helper to update data
 */
export async function updateData(table: string, id: string, updates: any) {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data?.[0];
}

/**
 * Helper to delete data (soft delete)
 */
export async function softDelete(table: string, id: string) {
  const { data, error } = await supabase
    .from(table)
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data?.[0];
}

/**
 * Helper to hard delete data
 */
export async function hardDelete(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) throw error;
  return { success: true };
}
