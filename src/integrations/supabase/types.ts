export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contract_approvals: {
        Row: {
          action: Database["public"]["Enums"]["approval_action"]
          approver_id: string
          comment: string | null
          contract_id: string
          created_at: string
          id: string
          stage: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["approval_action"]
          approver_id: string
          comment?: string | null
          contract_id: string
          created_at?: string
          id?: string
          stage?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["approval_action"]
          approver_id?: string
          comment?: string | null
          contract_id?: string
          created_at?: string
          id?: string
          stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_approvals_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_reviews: {
        Row: {
          clauses: Json | null
          contract_id: string
          created_at: string
          id: string
          matched_rule_ids: string[] | null
          overall_score: number | null
          risk_summary: Json | null
          version: number
        }
        Insert: {
          clauses?: Json | null
          contract_id: string
          created_at?: string
          id?: string
          matched_rule_ids?: string[] | null
          overall_score?: number | null
          risk_summary?: Json | null
          version: number
        }
        Update: {
          clauses?: Json | null
          contract_id?: string
          created_at?: string
          id?: string
          matched_rule_ids?: string[] | null
          overall_score?: number | null
          risk_summary?: Json | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_reviews_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_seals: {
        Row: {
          contract_id: string
          created_at: string
          file_name: string
          file_path: string
          id: string
          note: string | null
          uploaded_by: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          note?: string | null
          uploaded_by: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          note?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_seals_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_versions: {
        Row: {
          contract_id: string
          created_at: string
          file_name: string
          file_path: string
          id: string
          note: string | null
          uploaded_by: string
          version: number
        }
        Insert: {
          contract_id: string
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          note?: string | null
          uploaded_by: string
          version: number
        }
        Update: {
          contract_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          note?: string | null
          uploaded_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_versions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          company_name: string | null
          created_at: string
          current_version: number
          custom_rules: string | null
          department_id: string | null
          file_name: string
          id: string
          negotiation_position: string | null
          stance: string | null
          status: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          current_version?: number
          custom_rules?: string | null
          department_id?: string | null
          file_name: string
          id?: string
          negotiation_position?: string | null
          stance?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          current_version?: number
          custom_rules?: string | null
          department_id?: string | null
          file_name?: string
          id?: string
          negotiation_position?: string | null
          stance?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"]
          created_at: string
          department_id: string | null
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"]
          created_at?: string
          department_id?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"]
          created_at?: string
          department_id?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      review_rules: {
        Row: {
          attachment_name: string | null
          attachment_path: string | null
          category: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string
          id: string
          is_active: boolean
          name: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_path?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description: string
          id?: string
          is_active?: boolean
          name: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_path?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_rules_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_department: { Args: { _uid: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      access_level: "read" | "download" | "modify"
      app_role: "admin" | "legal" | "finance" | "employee"
      approval_action: "approve" | "reject" | "comment"
      contract_status:
        | "draft"
        | "reviewing"
        | "revision_required"
        | "approved"
        | "sealed"
        | "archived"
        | "self_review"
        | "finance_review"
        | "legal_review"
        | "head_approval"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_level: ["read", "download", "modify"],
      app_role: ["admin", "legal", "finance", "employee"],
      approval_action: ["approve", "reject", "comment"],
      contract_status: [
        "draft",
        "reviewing",
        "revision_required",
        "approved",
        "sealed",
        "archived",
        "self_review",
        "finance_review",
        "legal_review",
        "head_approval",
      ],
    },
  },
} as const
