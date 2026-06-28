/**
 * Hand-authored to match the SQL schema in supabase/migrations.
 * Mirrors the shape of `supabase gen types typescript` so it can be
 * regenerated later (once the access token has the required privileges):
 *   supabase gen types typescript --linked --schema public > src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type UserRole = "skalesy_admin" | "client" | "provider" | "pending";
type ProviderDomain = "dev" | "design" | "branding" | "paid_acquisition" | "seo";
type OwnerSide = "skalesy" | "client" | "provider";
type TaskStatus = "todo" | "waiting" | "blocked" | "in_progress" | "done";
type Priority = "low" | "medium" | "high" | "urgent";
type QuestionStatus = "open" | "answered" | "closed";
type DecisionStatus = "proposed" | "validated" | "rejected";
type BlockerStatus = "open" | "resolved";
type AccessStatus = "needed" | "requested" | "provided" | "confirmed";
type RoadmapStatus = "planned" | "in_progress" | "done";

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          client_name: string | null;
          description: string | null;
          objectives: Json;
          status: string;
          progress: number;
          start_date: string | null;
          target_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          client_name?: string | null;
          description?: string | null;
          objectives?: Json;
          status?: string;
          progress?: number;
          start_date?: string | null;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          client_name?: string | null;
          description?: string | null;
          objectives?: Json;
          status?: string;
          progress?: number;
          start_date?: string | null;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          role: UserRole;
          provider_domain: ProviderDomain | null;
          company: string | null;
          title: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          role?: UserRole;
          provider_domain?: ProviderDomain | null;
          company?: string | null;
          title?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          role?: UserRole;
          provider_domain?: ProviderDomain | null;
          company?: string | null;
          title?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      allowed_members: {
        Row: {
          email: string;
          role: UserRole;
          provider_domain: ProviderDomain | null;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          email: string;
          role: UserRole;
          provider_domain?: ProviderDomain | null;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string;
          role?: UserRole;
          provider_domain?: ProviderDomain | null;
          full_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      provider_workspaces: {
        Row: {
          id: string;
          project_id: string;
          domain: ProviderDomain;
          lead_profile_id: string | null;
          summary: string | null;
          needs: string | null;
          recommendations: string | null;
          progress: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          domain: ProviderDomain;
          lead_profile_id?: string | null;
          summary?: string | null;
          needs?: string | null;
          recommendations?: string | null;
          progress?: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          domain?: ProviderDomain;
          lead_profile_id?: string | null;
          summary?: string | null;
          needs?: string | null;
          recommendations?: string | null;
          progress?: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: Priority;
          domain: ProviderDomain | null;
          owner_side: OwnerSide;
          assignee_profile_id: string | null;
          due_date: string | null;
          sort_order: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: Priority;
          domain?: ProviderDomain | null;
          owner_side?: OwnerSide;
          assignee_profile_id?: string | null;
          due_date?: string | null;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: Priority;
          domain?: ProviderDomain | null;
          owner_side?: OwnerSide;
          assignee_profile_id?: string | null;
          due_date?: string | null;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          project_id: string;
          body: string;
          answer: string | null;
          domain: ProviderDomain | null;
          directed_to: OwnerSide;
          status: QuestionStatus;
          priority: Priority;
          asked_by: string | null;
          answered_by: string | null;
          answered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          body: string;
          answer?: string | null;
          domain?: ProviderDomain | null;
          directed_to?: OwnerSide;
          status?: QuestionStatus;
          priority?: Priority;
          asked_by?: string | null;
          answered_by?: string | null;
          answered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          body?: string;
          answer?: string | null;
          domain?: ProviderDomain | null;
          directed_to?: OwnerSide;
          status?: QuestionStatus;
          priority?: Priority;
          asked_by?: string | null;
          answered_by?: string | null;
          answered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      blockers: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          domain: ProviderDomain | null;
          severity: Priority;
          status: BlockerStatus;
          raised_by: string | null;
          resolution: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          domain?: ProviderDomain | null;
          severity?: Priority;
          status?: BlockerStatus;
          raised_by?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          domain?: ProviderDomain | null;
          severity?: Priority;
          status?: BlockerStatus;
          raised_by?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      decisions: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          context: string | null;
          decision: string | null;
          domain: ProviderDomain | null;
          status: DecisionStatus;
          decided_by: string | null;
          decided_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          context?: string | null;
          decision?: string | null;
          domain?: ProviderDomain | null;
          status?: DecisionStatus;
          decided_by?: string | null;
          decided_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          context?: string | null;
          decision?: string | null;
          domain?: ProviderDomain | null;
          status?: DecisionStatus;
          decided_by?: string | null;
          decided_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      accesses: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string | null;
          domain: ProviderDomain | null;
          provided_by: OwnerSide;
          status: AccessStatus;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          description?: string | null;
          domain?: ProviderDomain | null;
          provided_by?: OwnerSide;
          status?: AccessStatus;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          description?: string | null;
          domain?: ProviderDomain | null;
          provided_by?: OwnerSide;
          status?: AccessStatus;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          category: string | null;
          url: string | null;
          storage_path: string | null;
          domain: ProviderDomain | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          category?: string | null;
          url?: string | null;
          storage_path?: string | null;
          domain?: ProviderDomain | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          category?: string | null;
          url?: string | null;
          storage_path?: string | null;
          domain?: ProviderDomain | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      roadmap_items: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          phase: string | null;
          domain: ProviderDomain | null;
          status: RoadmapStatus;
          start_date: string | null;
          end_date: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          phase?: string | null;
          domain?: ProviderDomain | null;
          status?: RoadmapStatus;
          start_date?: string | null;
          end_date?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          phase?: string | null;
          domain?: ProviderDomain | null;
          status?: RoadmapStatus;
          start_date?: string | null;
          end_date?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          project_id: string;
          actor_profile_id: string | null;
          actor_name: string | null;
          entity_type: string;
          entity_id: string | null;
          action: string;
          summary: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          actor_profile_id?: string | null;
          actor_name?: string | null;
          entity_type: string;
          entity_id?: string | null;
          action: string;
          summary: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          actor_profile_id?: string | null;
          actor_name?: string | null;
          entity_type?: string;
          entity_id?: string | null;
          action?: string;
          summary?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      user_role: UserRole;
      provider_domain: ProviderDomain;
      owner_side: OwnerSide;
      task_status: TaskStatus;
      priority: Priority;
      question_status: QuestionStatus;
      decision_status: DecisionStatus;
      blocker_status: BlockerStatus;
      access_status: AccessStatus;
      roadmap_status: RoadmapStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

/* Convenience row aliases used across the app. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type ProjectRow = Tables<"projects">;
export type ProfileRow = Tables<"profiles">;
export type WorkspaceRow = Tables<"provider_workspaces">;
export type TaskRow = Tables<"tasks">;
export type QuestionRow = Tables<"questions">;
export type BlockerRow = Tables<"blockers">;
export type DecisionRow = Tables<"decisions">;
export type AccessRow = Tables<"accesses">;
export type DocumentRow = Tables<"documents">;
export type RoadmapRow = Tables<"roadmap_items">;
export type ActivityRow = Tables<"activity_log">;
export type AllowedMemberRow = Tables<"allowed_members">;
