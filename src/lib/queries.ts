import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ProviderDomain } from "@/lib/constants";
import type { AttachmentRow } from "@/lib/database.types";

export const DOCS_BUCKET = "project-docs";
export type AttachmentItem = AttachmentRow & { href: string | null };

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

/**
 * Attachments for every entity of a given type, grouped by entity_id.
 * Files stored in the private bucket get a short-lived signed URL (`href`);
 * external-link attachments use their `url` directly.
 */
export async function getAttachments(
  entityType: "question" | "decision",
): Promise<Map<string, AttachmentItem[]>> {
  const pid = await projectId();
  const map = new Map<string, AttachmentItem[]>();
  if (!pid) return map;
  const supabase = await createClient();
  const { data } = await supabase
    .from("attachments")
    .select("*")
    .eq("project_id", pid)
    .eq("entity_type", entityType)
    .order("created_at", { ascending: true });
  const rows = data ?? [];
  if (rows.length === 0) return map;

  // Batch-sign the stored files.
  const paths = rows
    .map((r) => r.storage_path)
    .filter((p): p is string => !!p);
  const signed = new Map<string, string>();
  if (paths.length > 0) {
    const { data: urls } = await supabase.storage
      .from(DOCS_BUCKET)
      .createSignedUrls(paths, 60 * 60);
    for (const u of urls ?? []) {
      if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl);
    }
  }

  for (const r of rows) {
    const href = r.storage_path ? signed.get(r.storage_path) ?? null : r.url;
    const item: AttachmentItem = { ...r, href };
    const list = map.get(r.entity_id);
    if (list) list.push(item);
    else map.set(r.entity_id, [item]);
  }
  return map;
}

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
