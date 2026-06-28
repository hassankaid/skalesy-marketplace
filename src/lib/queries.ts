import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ProviderDomain } from "@/lib/constants";

/** The single project that this cockpit tracks (cached per request). */
export const getProject = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
});

async function projectId(): Promise<string | null> {
  const p = await getProject();
  return p?.id ?? null;
}

export const getWorkspaces = cache(async () => {
  const pid = await projectId();
  if (!pid) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("provider_workspaces")
    .select("*")
    .eq("project_id", pid)
    .order("sort_order", { ascending: true });
  return data ?? [];
});

export async function getWorkspace(domain: ProviderDomain) {
  const pid = await projectId();
  if (!pid) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("provider_workspaces")
    .select("*")
    .eq("project_id", pid)
    .eq("domain", domain)
    .maybeSingle();
  return data;
}

export const getTasks = cache(async () => {
  const pid = await projectId();
  if (!pid) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", pid)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return data ?? [];
});

export const getQuestions = cache(async () => {
  const pid = await projectId();
  if (!pid) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .select("*")
    .eq("project_id", pid)
    .order("created_at", { ascending: false });
  return data ?? [];
});

export const getBlockers = cache(async () => {
  const pid = await projectId();
  if (!pid) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("blockers")
    .select("*")
    .eq("project_id", pid)
    .order("created_at", { ascending: false });
  return data ?? [];
});

export const getDecisions = cache(async () => {
  const pid = await projectId();
  if (!pid) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("decisions")
    .select("*")
    .eq("project_id", pid)
    .order("created_at", { ascending: false });
  return data ?? [];
});

export const getAccesses = cache(async () => {
  const pid = await projectId();
  if (!pid) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("accesses")
    .select("*")
    .eq("project_id", pid)
    .order("created_at", { ascending: true });
  return data ?? [];
});

export const getDocuments = cache(async () => {
  const pid = await projectId();
  if (!pid) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", pid)
    .order("created_at", { ascending: false });
  return data ?? [];
});

export const getRoadmap = cache(async () => {
  const pid = await projectId();
  if (!pid) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("roadmap_items")
    .select("*")
    .eq("project_id", pid)
    .order("sort_order", { ascending: true });
  return data ?? [];
});

export async function getActivity(limit = 12) {
  const pid = await projectId();
  if (!pid) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_log")
    .select("*")
    .eq("project_id", pid)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export const getProfiles = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  return data ?? [];
});

export async function getAllowedMembers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("allowed_members")
    .select("*")
    .order("created_at", { ascending: true });
  return data ?? [];
}
