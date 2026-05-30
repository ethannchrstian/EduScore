import { supabase } from "../../../config/supabase";
import type { AuthError } from "@supabase/supabase-js";

export interface AuthResult {
  error: AuthError | null;
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

export interface SignUpResult extends AuthResult {
  emailInUse: boolean;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  const emailInUse = !error && (data.user?.identities?.length ?? 1) === 0;
  return { error, emailInUse };
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();
  return { error };
}
