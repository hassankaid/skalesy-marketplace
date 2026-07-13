import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import type { ProviderDomain } from "@/lib/constants";
import type {
  AttachmentRow,
  QuestionRow,
  TaskRow,
  DecisionRow,
  AccessRow,
} from "@/lib/database.types";

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

/** My @mention notifications (most recent first). */
export const getMyNotifications = cache(async () => {
  const auth = await getAuth();
  if (!auth?.user) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
});

/**
 * Items that require MY action, computed live from current statuses:
 * open questions addressed to me, tasks assigned to me, decisions I can
 * validate, and accesses I must provide.
 */
export const getInboxActionables = cache(async () => {
  const auth = await getAuth();
  if (!auth?.user) {
    return {
      questions: [] as QuestionRow[],
      tasks: [] as TaskRow[],
      decisions: [] as DecisionRow[],
      accesses: [] as AccessRow[],
    };
  }
  const role = auth.profile?.role;
  const domain = auth.profile?.provider_domain ?? null;
  const uid = auth.user.id;

  const [tasks, questions, decisions, accesses] = await Promise.all([
    getTasks(),
    getQuestions(),
    getDecisions(),
    getAccesses(),
  ]);

  const myQuestions = questions.filter(
    (q) =>
      q.status === "open" &&
      ((role === "client" && q.directed_to === "client") ||
        (role === "provider" && q.domain != null && q.domain === domain) ||
        (role === "skalesy_admin" && q.directed_to === "skalesy")),
  );
  const myTasks = tasks.filter(
    (t) => t.assignee_profile_id === uid && t.status !== "done",
  );
  const myDecisions =
    role === "skalesy_admin" || role === "client"
      ? decisions.filter((d) => d.status === "proposed")
      : [];
  const myAccesses = accesses.filter(
    (a) =>
      (a.status === "needed" || a.status === "requested") &&
      ((role === "client" && a.provided_by === "client") ||
        (role === "provider" &&
          a.provided_by === "provider" &&
          (a.domain == null || a.domain === domain)) ||
        (role === "skalesy_admin" && a.provided_by === "skalesy")),
  );

  return {
    questions: myQuestions,
    tasks: myTasks,
    decisions: myDecisions,
    accesses: myAccesses,
  };
});

/** Count for the sidebar badge: unread mentions + pending actionables. */
export const getInboxCount = cache(async () => {
  const [notifs, act] = await Promise.all([
    getMyNotifications(),
    getInboxActionables(),
  ]);
  const unread = notifs.filter((n) => !n.read_at).length;
  const actionable =
    act.questions.length +
    act.tasks.length +
    act.decisions.length +
    act.accesses.length;
  return { unread, actionable, total: unread + actionable };
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
