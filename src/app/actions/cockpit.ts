"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuth } from "@/lib/auth";
import { getProject, getProfiles } from "@/lib/queries";
import { extractMentionIds } from "@/lib/mention-parse";
import {
  TASK_STATUS_LABELS,
  ACCESS_STATUS_LABELS,
  ROADMAP_STATUS_LABELS,
  type TaskStatus,
  type AccessStatus,
  type DecisionStatus,
  type RoadmapStatus,
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

/** Parses `@mentions` in a saved text and creates a notification per tagged member. Best-effort. */
async function recordMentions(
  entityType: "question" | "decision" | "blocker",
  entityId: string,
  text: string | null | undefined,
) {
  try {
    if (!text?.trim()) return;
    const auth = await getAuth();
    if (!auth?.user.id) return;
    const project = await getProject();
    if (!project) return;
    const profiles = await getProfiles();
    const members = profiles
      .filter(
        (p) =>
          p.role === "skalesy_admin" || p.role === "client" || p.role === "provider",
      )
      .map((p) => ({
        id: p.id,
        name: (p.full_name?.trim() || p.email?.split("@")[0] || "").trim(),
      }))
      .filter((m) => m.name);
    const ids = extractMentionIds(text, members).filter((id) => id !== auth.user.id);
    if (ids.length === 0) return;
    const actorName = auth.profile?.full_name ?? auth.profile?.email ?? null;
    const preview = text.trim().replace(/\s+/g, " ").slice(0, 160);
    const supabase = await createClient();
    await supabase.from("notifications").insert(
      ids.map((rid) => ({
        project_id: project.id,
        recipient_id: rid,
        actor_id: auth.user.id,
        actor_name: actorName,
        entity_type: entityType,
        entity_id: entityId,
        preview,
      })),
    );
  } catch {
    // never block the main action
  }
}

/* ---------------- Notifications ---------------- */

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const auth = await getAuth();
  if (!auth?.user.id) return { ok: false, error: PERM_ERROR };
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", auth.user.id)
    .is("read_at", null);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
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
  await recordMentions("question", id, text);
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
  await recordMentions("blocker", id, resolution);
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

/**
 * Authorizes a member (role/domain in `allowed_members`) AND sends them a
 * Supabase invitation email so they can set their password and sign in.
 * Admin-only. Degrades gracefully (still authorizes) if the invite can't be sent.
 */
export async function inviteMember(input: {
  email: string;
  role: "skalesy_admin" | "client" | "provider";
  provider_domain?: ProviderDomain | "";
  full_name?: string;
}): Promise<{ ok: true; warning?: string } | { ok: false; error: string }> {
  const auth = await getAuth();
  if (auth?.profile?.role !== "skalesy_admin")
    return { ok: false, error: PERM_ERROR };

  const email = input.email?.trim().toLowerCase();
  if (!email || !email.includes("@"))
    return { ok: false, error: "Email invalide." };

  const domain =
    input.role === "provider" && input.provider_domain
      ? (input.provider_domain as ProviderDomain)
      : null;
  const fullName = input.full_name?.trim() || null;

  // 1. Authorize (role/domain) — RLS restricts this to admins.
  const supabase = await createClient();
  const { error: amErr } = await supabase.from("allowed_members").upsert({
    email,
    role: input.role,
    provider_domain: domain,
    full_name: fullName,
  });
  if (amErr) return { ok: false, error: amErr.message };

  // 2. Send the invitation via the admin API (service_role).
  const admin = createAdminClient();
  if (!admin) {
    await logActivity("member", null, "authorized", `Accès autorisé : ${email}`);
    revalidate();
    return {
      ok: true,
      warning:
        "Membre autorisé, mais l'invitation par email n'a pas pu partir (clé service_role absente sur le serveur).",
    };
  }

  const h = await headers();
  const base =
    h.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectTo = `${base}/auth/callback?next=/definir-mot-de-passe`;

  const { error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: fullName ? { full_name: fullName } : undefined,
  });

  if (invErr) {
    await logActivity("member", null, "authorized", `Accès autorisé : ${email}`);
    revalidate();
    const already = /already|registered|exists/i.test(invErr.message);
    return {
      ok: true,
      warning: already
        ? "Cette personne a déjà un compte — son accès a été mis à jour, aucun nouvel email d'invitation n'a été envoyé."
        : `Membre autorisé, mais l'invitation n'a pas pu être envoyée : ${invErr.message}`,
    };
  }

  await logActivity("member", null, "invited", `Invitation envoyée à ${email}`);
  revalidate();
  return { ok: true };
}

/* ---------------- Project & workspaces (configuration) ---------------- */

function clampProgress(n: number | undefined): number {
  const v = Math.round(Number(n));
  if (Number.isNaN(v)) return 0;
  return Math.min(100, Math.max(0, v));
}

async function projectId(): Promise<string | null> {
  const p = await getProject();
  return p?.id ?? null;
}

export async function updateProject(input: {
  name: string;
  client_name?: string;
  description?: string;
  objectives?: string[];
  start_date?: string;
  target_date?: string;
  progress?: number;
}): Promise<ActionResult> {
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Le nom du projet est requis." };
  const pid = await projectId();
  if (!pid) return { ok: false, error: "Projet introuvable." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      name,
      client_name: input.client_name?.trim() || null,
      description: input.description?.trim() || null,
      objectives: (input.objectives ?? []).map((o) => o.trim()).filter(Boolean),
      start_date: input.start_date || null,
      target_date: input.target_date || null,
      progress: clampProgress(input.progress),
    })
    .eq("id", pid)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity("project", pid, "updated", "Projet mis à jour");
  revalidate();
  return { ok: true };
}

export async function updateWorkspace(
  id: string,
  input: {
    summary?: string;
    needs?: string;
    recommendations?: string;
    progress?: number;
  },
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("provider_workspaces")
    .update({
      summary: input.summary?.trim() || null,
      needs: input.needs?.trim() || null,
      recommendations: input.recommendations?.trim() || null,
      progress: clampProgress(input.progress),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity("workspace", id, "updated", "Espace prestataire mis à jour");
  revalidate();
  return { ok: true };
}

/* ---------------- Create ---------------- */

export async function createQuestion(input: {
  body: string;
  domain?: ProviderDomain | "";
  directed_to: OwnerSide;
  priority: Priority;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const body = input.body?.trim();
  if (!body) return { ok: false, error: "La question est requise." };
  const pid = await projectId();
  if (!pid) return { ok: false, error: "Projet introuvable." };
  const supabase = await createClient();
  const auth = await getAuth();
  const { data, error } = await supabase
    .from("questions")
    .insert({
      project_id: pid,
      body,
      domain: input.domain ? (input.domain as ProviderDomain) : null,
      directed_to: input.directed_to,
      priority: input.priority,
      asked_by: auth?.user.id ?? null,
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity("question", data.id, "created", `Question ajoutée : « ${body} »`);
  await recordMentions("question", data.id, body);
  revalidate();
  return { ok: true, id: data.id };
}

export async function createBlocker(input: {
  title: string;
  description?: string;
  domain?: ProviderDomain | "";
  severity: Priority;
}): Promise<ActionResult> {
  const title = input.title?.trim();
  if (!title) return { ok: false, error: "Le titre est requis." };
  const pid = await projectId();
  if (!pid) return { ok: false, error: "Projet introuvable." };
  const supabase = await createClient();
  const auth = await getAuth();
  const { data, error } = await supabase
    .from("blockers")
    .insert({
      project_id: pid,
      title,
      description: input.description?.trim() || null,
      domain: input.domain ? (input.domain as ProviderDomain) : null,
      severity: input.severity,
      raised_by: auth?.user.id ?? null,
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity("blocker", data.id, "created", `Blocage signalé : « ${title} »`);
  await recordMentions("blocker", data.id, input.description);
  revalidate();
  return { ok: true };
}

export async function createDecision(input: {
  title: string;
  context?: string;
  decision?: string;
  domain?: ProviderDomain | "";
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const title = input.title?.trim();
  if (!title) return { ok: false, error: "Le titre est requis." };
  const pid = await projectId();
  if (!pid) return { ok: false, error: "Projet introuvable." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("decisions")
    .insert({
      project_id: pid,
      title,
      context: input.context?.trim() || null,
      decision: input.decision?.trim() || null,
      domain: input.domain ? (input.domain as ProviderDomain) : null,
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity("decision", data.id, "created", `Décision ajoutée : « ${title} »`);
  await recordMentions(
    "decision",
    data.id,
    `${input.context ?? ""}\n${input.decision ?? ""}`,
  );
  revalidate();
  return { ok: true, id: data.id };
}

export async function createAccess(input: {
  name: string;
  description?: string;
  domain?: ProviderDomain | "";
  provided_by: OwnerSide;
  notes?: string;
}): Promise<ActionResult> {
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Le nom de l'accès est requis." };
  const pid = await projectId();
  if (!pid) return { ok: false, error: "Projet introuvable." };
  const supabase = await createClient();
  const auth = await getAuth();
  const { data, error } = await supabase
    .from("accesses")
    .insert({
      project_id: pid,
      name,
      description: input.description?.trim() || null,
      domain: input.domain ? (input.domain as ProviderDomain) : null,
      provided_by: input.provided_by,
      notes: input.notes?.trim() || null,
      created_by: auth?.user.id ?? null,
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity("access", data.id, "created", `Accès ajouté : « ${name} »`);
  revalidate();
  return { ok: true };
}

export async function createDocument(input: {
  name: string;
  category?: string;
  url?: string;
  domain?: ProviderDomain | "";
}): Promise<ActionResult> {
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Le nom du document est requis." };
  const pid = await projectId();
  if (!pid) return { ok: false, error: "Projet introuvable." };
  const supabase = await createClient();
  const auth = await getAuth();
  if (!auth?.user.id) return { ok: false, error: PERM_ERROR };
  const { data, error } = await supabase
    .from("documents")
    .insert({
      project_id: pid,
      name,
      category: input.category?.trim() || null,
      url: input.url?.trim() || null,
      domain: input.domain ? (input.domain as ProviderDomain) : null,
      uploaded_by: auth.user.id,
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity("document", data.id, "created", `Document ajouté : « ${name} »`);
  revalidate();
  return { ok: true };
}

export async function createRoadmapItem(input: {
  title: string;
  description?: string;
  phase?: string;
  domain?: ProviderDomain | "";
  status: RoadmapStatus;
}): Promise<ActionResult> {
  const title = input.title?.trim();
  if (!title) return { ok: false, error: "Le titre est requis." };
  const pid = await projectId();
  if (!pid) return { ok: false, error: "Projet introuvable." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roadmap_items")
    .insert({
      project_id: pid,
      title,
      description: input.description?.trim() || null,
      phase: input.phase?.trim() || null,
      domain: input.domain ? (input.domain as ProviderDomain) : null,
      status: input.status,
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity("roadmap", data.id, "created", `Étape ajoutée : « ${title} »`);
  revalidate();
  return { ok: true };
}

export async function updateRoadmapStatus(
  id: string,
  status: RoadmapStatus,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roadmap_items")
    .update({ status })
    .eq("id", id)
    .select("title")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity(
    "roadmap",
    id,
    status,
    `Étape « ${data.title} » → ${ROADMAP_STATUS_LABELS[status]}`,
  );
  revalidate();
  return { ok: true };
}

/* ---------------- Attachments ---------------- */

const DOCS_BUCKET = "project-docs";

export async function addAttachment(input: {
  entity_type: "question" | "decision";
  entity_id: string;
  name: string;
  storage_path?: string;
  url?: string;
  mime_type?: string;
  size_bytes?: number;
}): Promise<ActionResult> {
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Le nom du document est requis." };
  if (!input.storage_path && !input.url?.trim())
    return { ok: false, error: "Un fichier ou un lien est requis." };
  const pid = await projectId();
  if (!pid) return { ok: false, error: "Projet introuvable." };
  const supabase = await createClient();
  const auth = await getAuth();
  if (!auth?.user.id) return { ok: false, error: PERM_ERROR };
  const { data, error } = await supabase
    .from("attachments")
    .insert({
      project_id: pid,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      name,
      storage_path: input.storage_path || null,
      url: input.url?.trim() || null,
      mime_type: input.mime_type || null,
      size_bytes: input.size_bytes ?? null,
      uploaded_by: auth.user.id,
    })
    .select("id")
    .maybeSingle();
  if (error) {
    // The DB row could not be created — drop the orphan file if we just uploaded one.
    if (input.storage_path) {
      await supabase.storage.from(DOCS_BUCKET).remove([input.storage_path]);
    }
    return { ok: false, error: error.message };
  }
  if (!data) return { ok: false, error: PERM_ERROR };
  await logActivity(
    input.entity_type,
    input.entity_id,
    "attachment",
    `Document joint : « ${name} »`,
  );
  revalidate();
  return { ok: true };
}

export async function deleteAttachment(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attachments")
    .delete()
    .eq("id", id)
    .select("name, storage_path");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: PERM_ERROR };
  const path = data[0].storage_path;
  if (path) await supabase.storage.from(DOCS_BUCKET).remove([path]);
  await logActivity("attachment", id, "deleted", "Document retiré");
  revalidate();
  return { ok: true };
}

/** Best-effort removal of an entity's attachments (rows + stored files). */
async function cleanupAttachments(entityType: string, entityId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("attachments")
      .select("id, storage_path")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId);
    if (!data?.length) return;
    const paths = data
      .map((a) => a.storage_path)
      .filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from(DOCS_BUCKET).remove(paths);
    await supabase
      .from("attachments")
      .delete()
      .in(
        "id",
        data.map((a) => a.id),
      );
  } catch {
    // never block the parent deletion
  }
}

/* ---------------- Delete ---------------- */

export async function deleteTask(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tasks").delete().eq("id", id).select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: PERM_ERROR };
  await logActivity("task", id, "deleted", "Tâche supprimée");
  revalidate();
  return { ok: true };
}

export async function deleteQuestion(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("questions").delete().eq("id", id).select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: PERM_ERROR };
  await cleanupAttachments("question", id);
  await logActivity("question", id, "deleted", "Question supprimée");
  revalidate();
  return { ok: true };
}

export async function deleteBlocker(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("blockers").delete().eq("id", id).select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: PERM_ERROR };
  await logActivity("blocker", id, "deleted", "Blocage supprimé");
  revalidate();
  return { ok: true };
}

export async function deleteDecision(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("decisions").delete().eq("id", id).select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: PERM_ERROR };
  await cleanupAttachments("decision", id);
  await logActivity("decision", id, "deleted", "Décision supprimée");
  revalidate();
  return { ok: true };
}

export async function deleteAccess(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("accesses").delete().eq("id", id).select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: PERM_ERROR };
  await logActivity("access", id, "deleted", "Accès supprimé");
  revalidate();
  return { ok: true };
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("documents").delete().eq("id", id).select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: PERM_ERROR };
  await logActivity("document", id, "deleted", "Document supprimé");
  revalidate();
  return { ok: true };
}

export async function deleteRoadmapItem(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("roadmap_items").delete().eq("id", id).select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: PERM_ERROR };
  await logActivity("roadmap", id, "deleted", "Étape supprimée");
  revalidate();
  return { ok: true };
}
