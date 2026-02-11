import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Captain auth features will be unavailable.");
}

export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export function generatePassword(length = 12): string {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  const bytes = randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

export async function createCaptainAccount(email: string, password: string): Promise<{ userId: string; error?: string }> {
  if (!supabaseAdmin) {
    return { userId: "", error: "Supabase Auth is not configured" };
  }

  const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    if (createError.message?.includes("already been registered") || createError.status === 422) {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = listData?.users?.find(u => u.email === email);
      if (existing) {
        return { userId: existing.id };
      }
    }
    return { userId: "", error: createError.message };
  }

  return { userId: createData.user.id };
}

export async function verifyCaptainCredentials(email: string, password: string): Promise<{ userId: string; error?: string }> {
  if (!supabaseAdmin) {
    return { userId: "", error: "Supabase Auth is not configured" };
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { userId: "", error: error.message };
  }

  return { userId: data.user.id };
}
