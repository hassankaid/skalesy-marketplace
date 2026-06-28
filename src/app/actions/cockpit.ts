"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { getProject } from "@/lib/queries";
import {
  TASK_STATUS_LABELS,
  ACCESS_STATUS_LABELS,
  type TaskStatus,
  type AccessStatus,
  type DecisionStatus,
  type OwnerSide,
  type Priority,
  type ProviderDomain,
} from "@/lib/constants";

type ActionResult = { ok: true } | { ok: false; error: string };

const PERM_ERROR =
  "Action non autorisée : ton rôle ne permet pas cette modification.";

async function logActivity(
  entityType: string,
  entityId: string | null,
  action: string,
  summary: string,
) {
  try {
    const supabase = await createClient();
    const auth = await getAuth();
    const project = await getProject();
    if (!project) return;
    await supabase.from("activity_log").insert({
      project_id: project.id,
      actor_profile_id: auth?.user.id ?? null,
      actor_name: auth?.profile?.full_name ?? auth?.profile?.email ?? null,
      entity_type: entityType,
      entity_id: entityId,
      action,
      summary,
    });
  } catch {
    // best-effort — never block the main action
  }
}

function revalidate() {
  revalidatePath("/", "layout");
}

/* ---------------- Tasks ---------------- */

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id)
    .select("title")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity(
    "task",
    id,
    "status",
    `Tâche « ${data.title} » → ${TASK_STATUS_LABELS[status]}`,
  );
  revalidate();
  return { ok: true };
}

export async function createTask(input: {
  title: string;
  description?: string;
  domain?: ProviderDomain | "";
  owner_side: OwnerSide;
  priority: Priority;
  due_date?: string;
}): Promise<ActionResult> {
  const title = input.title?.trim();
  if (!title) return { ok: false, error: "Le titre est requis." };
  const project = await getProject();
  if (!project) return { ok: false, error: "Projet introuvable." };

  const supabase = await createClient();
  const auth = await getAuth();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: project.id,
      title,
      description: input.description?.trim() || null,
      domain: input.domain ? (input.domain as ProviderDomain) : null,
      owner_side: input.owner_side,
      priority: input.priority,
      due_date: input.due_date || null,
      created_by: auth?.user.id ?? null,
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity("task", data.id, "created", `Nouvelle tâche : « ${title} »`);
  revalidate();
  return { ok: true };
}

/* ---------------- Questions ---------------- */

export async function answerQuestion(
  id: string,
  answer: string,
): Promise<ActionResult> {
  const text = answer?.trim();
  if (!text) return { ok: false, error: "La réponse ne peut pas être vide." };
  const supabase = await createClient();
  const auth = await getAuth();
  const { data, error } = await supabase
    .from("questions")
    .update({
      answer: text,
      status: "answered",
      answered_by: auth?.user.id ?? null,
      answered_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("body")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity("question", id, "answered", `Question répondue : « ${data.body} »`);
  revalidate();
  return { ok: true };
}

/* ---------------- Decisions ---------------- */

export async function setDecisionStatus(
  id: string,
  status: DecisionStatus,
): Promise<ActionResult> {
  const supabase = await createClient();
  const auth = await getAuth();
  const patch: { status: DecisionStatus; decided_by: string | null; decided_at: string | null } = {
    status,
    decided_by: status === "validated" ? (auth?.user.id ?? null) : null,
    decided_at: status === "validated" ? new Date().toISOString() : null,
  };
  const { data, error } = await supabase
    .from("decisions")
    .update(patch)
    .eq("id", id)
    .select("title")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  const label = status === "validated" ? "validée" : status === "rejected" ? "écartée" : "remise en proposition";
  await logActivity("decision", id, status, `Décision ${label} : « ${data.title} »`);
  revalidate();
  return { ok: true };
}

/* ---------------- Accesses ---------------- */

export async function updateAccessStatus(
  id: string,
  status: AccessStatus,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accesses")
    .update({ status })
    .eq("id", id)
    .select("name")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity(
    "access",
    id,
    status,
    `Accès « ${data.name} » → ${ACCESS_STATUS_LABELS[status]}`,
  );
  revalidate();
  return { ok: true };
}

/* ---------------- Blockers ---------------- */

export async function resolveBlocker(
  id: string,
  resolution: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blockers")
    .update({
      status: "resolved",
      resolution: resolution?.trim() || null,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("title")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity("blocker", id, "resolved", `Blocage résolu : « ${data.title} »`);
  revalidate();
  return { ok: true };
}

export async function reopenBlocker(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blockers")
    .update({ status: "open", resolution: null, resolved_at: null })
    .eq("id", id)
    .select("title")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity("blocker", id, "reopened", `Blocage rouvert : « ${data.title} »`);
  revalidate();
  return { ok: true };
}

/* ---------------- Admin: allowed members ---------------- */

export async function addAllowedMember(input: {
  email: string;
  role: "skalesy_admin" | "client" | "provider";
  provider_domain?: ProviderDomain | "";
  full_name?: string;
}): Promise<ActionResult> {
  const email = input.email?.trim().toLowerCase();
  if (!email || !email.includes("@"))
    return { ok: false, error: "Email invalide." };
  const supabase = await createClient();
  const { error } = await supabase.from("allowed_members").upsert({
    email,
    role: input.role,
    provider_domain:
      input.role === "provider" && input.provider_domain
        ? (input.provider_domain as ProviderDomain)
        : null,
    full_name: input.full_name?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };
  await logActivity("member", null, "added", `Accès autorisé : ${email}`);
  revalidate();
  return { ok: true };
}

export async function removeAllowedMember(email: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("allowed_members")
    .delete()
    .eq("email", email);
  if (error) return { ok: false, error: error.message };
  await logActivity("member", null, "removed", `Accès retiré : ${email}`);
  revalidate();
  return { ok: true };
}
