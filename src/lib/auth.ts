import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProviderDomain, UserRole } from "@/lib/constants";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  provider_domain: ProviderDomain | null;
  company: string | null;
  title: string | null;
  avatar_url: string | null;
};

/**
 * Returns the authenticated user and their profile, deduped per request.
 * Returns null if not authenticated.
 */
export const getAuth = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, role, provider_domain, company, title, avatar_url",
    )
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile: (profile as Profile | null) ?? null };
});

/** Redirects to /login when unauthenticated. */
export async function requireAuth() {
  const ctx = await getAuth();
  if (!ctx?.user) redirect("/login");
  return ctx;
}

/** True when the role may write within the given provider domain. */
export function canEditDomain(
  profile: Pick<Profile, "role" | "provider_domain">,
  domain: ProviderDomain | null,
): boolean {
  if (profile.role === "skalesy_admin") return true;
  if (profile.role === "provider")
    return domain != null && profile.provider_domain === domain;
  return false;
}
