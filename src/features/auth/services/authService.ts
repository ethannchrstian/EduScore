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

// Sends a password-reset email. The link returns the user to /reset-password
// with a recovery session already established.
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error };
}

// Sets a new password for the currently-authenticated (recovery) session.
export async function updatePassword(password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({ password });
  return { error };
}

// Updates the signed-in user's display name (stored in user metadata).
// Triggers a USER_UPDATED auth event, so AuthContext refreshes automatically.
export async function updateDisplayName(
  fullName: string,
): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });
  return { error };
}
