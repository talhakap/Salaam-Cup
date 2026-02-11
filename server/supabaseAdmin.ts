import { createClient } from "@supabase/supabase-js";

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
  let password = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

export async function createCaptainAccount(email: string, password: string): Promise<{ userId: string; error?: string }> {
  if (!supabaseAdmin) {
    return { userId: "", error: "Supabase Auth is not configured" };
  }

  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(u => u.email === email);
  if (existingUser) {
    return { userId: existingUser.id };
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return { userId: "", error: error.message };
  }

  return { userId: data.user.id };
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
