import {
  Code2,
  Palette,
  Sparkles,
  Megaphone,
  Search,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Roles                                                               */
/* ------------------------------------------------------------------ */

export type UserRole = "skalesy_admin" | "client" | "provider" | "pending";

export const ROLE_LABELS: Record<UserRole, string> = {
  skalesy_admin: "Skalesy",
  client: "Client",
  provider: "Prestataire",
  pending: "En attente d'accès",
};

/* ------------------------------------------------------------------ */
/* Provider domains                                                    */
/* ------------------------------------------------------------------ */

export type ProviderDomain =
  | "dev"
  | "design"
  | "branding"
  | "paid_acquisition"
  | "seo";

export const PROVIDER_DOMAINS: Record<
  ProviderDomain,
  { label: string; short: string; description: string; icon: LucideIcon }
> = {
  dev: {
    label: "Développement web/app",
    short: "Développement",
    description: "Architecture, intégration, back-office et applications.",
    icon: Code2,
  },
  design: {
    label: "Design graphique",
    short: "Design",
    description: "UI/UX, maquettes, design system et déclinaisons visuelles.",
    icon: Palette,
  },
  branding: {
    label: "Branding",
    short: "Branding",
    description: "Identité de marque, ton, positionnement et charte.",
    icon: Sparkles,
  },
  paid_acquisition: {
    label: "Acquisition payante",
    short: "Acquisition",
    description: "Campagnes payantes, tracking et performance média.",
    icon: Megaphone,
  },
  seo: {
    label: "SEO",
    short: "SEO",
    description: "Référencement naturel, contenu et acquisition organique.",
    icon: Search,
  },
};

export const PROVIDER_DOMAIN_ORDER: ProviderDomain[] = [
  "dev",
  "design",
  "branding",
  "paid_acquisition",
  "seo",
];

/* ------------------------------------------------------------------ */
/* Owner side (qui doit agir)                                          */
/* ------------------------------------------------------------------ */

export type OwnerSide = "skalesy" | "client" | "provider";

export const OWNER_SIDE_LABELS: Record<OwnerSide, string> = {
  skalesy: "Skalesy",
  client: "Client",
  provider: "Prestataire",
};

/* ------------------------------------------------------------------ */
/* Task / global statuses                                              */
/* ------------------------------------------------------------------ */

export type TaskStatus = "todo" | "waiting" | "blocked" | "in_progress" | "done";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "À faire",
  waiting: "En attente",
  blocked: "Bloqué",
  in_progress: "En cours",
  done: "Validé",
};

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "todo",
  "in_progress",
  "waiting",
  "blocked",
  "done",
];

/**
 * Literal Tailwind classes (kept whole so the JIT compiler can see them).
 * Soft tinted pill — sober but instantly readable.
 */
export const STATUS_BADGE_CLASS: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  waiting: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  blocked: "bg-red-100 text-red-700 ring-1 ring-red-200",
  in_progress: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  done: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
};

export const STATUS_DOT_CLASS: Record<TaskStatus, string> = {
  todo: "bg-slate-400",
  waiting: "bg-amber-500",
  blocked: "bg-red-500",
  in_progress: "bg-blue-500",
  done: "bg-emerald-500",
};

/* ------------------------------------------------------------------ */
/* Priority                                                            */
/* ------------------------------------------------------------------ */

export type Priority = "low" | "medium" | "high" | "urgent";

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Basse",
  medium: "Normale",
  high: "Haute",
  urgent: "Urgente",
};

export const PRIORITY_BADGE_CLASS: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  medium: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  high: "bg-orange-100 text-orange-700 ring-1 ring-orange-200",
  urgent: "bg-red-100 text-red-700 ring-1 ring-red-200",
};

/* ------------------------------------------------------------------ */
/* Other statuses                                                      */
/* ------------------------------------------------------------------ */

export type QuestionStatus = "open" | "answered" | "closed";
export const QUESTION_STATUS_LABELS: Record<QuestionStatus, string> = {
  open: "Ouverte",
  answered: "Répondue",
  closed: "Clôturée",
};

export type DecisionStatus = "proposed" | "validated" | "rejected";
export const DECISION_STATUS_LABELS: Record<DecisionStatus, string> = {
  proposed: "Proposée",
  validated: "Validée",
  rejected: "Écartée",
};

export type BlockerStatus = "open" | "resolved";
export const BLOCKER_STATUS_LABELS: Record<BlockerStatus, string> = {
  open: "Ouvert",
  resolved: "Résolu",
};

export type AccessStatus = "needed" | "requested" | "provided" | "confirmed";
export const ACCESS_STATUS_LABELS: Record<AccessStatus, string> = {
  needed: "Nécessaire",
  requested: "Demandé",
  provided: "Fourni",
  confirmed: "Confirmé",
};
export const ACCESS_STATUS_BADGE_CLASS: Record<AccessStatus, string> = {
  needed: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  requested: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  provided: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  confirmed: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
};

export type RoadmapStatus = "planned" | "in_progress" | "done";
export const ROADMAP_STATUS_LABELS: Record<RoadmapStatus, string> = {
  planned: "Planifié",
  in_progress: "En cours",
  done: "Terminé",
};
