import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const MAX_BATCHES = 50;
const USERS_PER_PAGE = 100;

type UserSummary = {
  id: string;
  email: string | null;
  name: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  lastSignInAt: string | null;
};

export async function GET() {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return NextResponse.json(
      {
        error:
          "Supabase service-role credentials are not configured. Set SUPABASE_SERVICE_ROLE_KEY in your environment.",
      },
      { status: 503 }
    );
  }

  try {
    const allUsers: UserSummary[] = [];
    let page = 1;
    let batches = 0;

    while (batches < MAX_BATCHES) {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage: USERS_PER_PAGE,
      });

      if (error) {
        throw error;
      }

      const batch = data?.users ?? [];
      allUsers.push(
        ...batch.map((user) => ({
          id: user.id,
          email: user.email,
          name:
            (user.user_metadata?.full_name as string | undefined) ??
            (user.user_metadata?.name as string | undefined) ??
            null,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lastSignInAt: user.last_sign_in_at,
        }))
      );

      batches += 1;
      if (batch.length < USERS_PER_PAGE) {
        break;
      }

      page += 1;
    }

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error("Failed to list Supabase users:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected Supabase error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
