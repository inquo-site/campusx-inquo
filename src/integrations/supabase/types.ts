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
      agent_events: {
        Row: {
          created_at: string
          dispatched_at: string | null
          event_type: string
          id: string
          payload: Json
          source_id: string | null
          source_table: string | null
          status: string
        }
        Insert: {
          created_at?: string
          dispatched_at?: string | null
          event_type: string
          id?: string
          payload?: Json
          source_id?: string | null
          source_table?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          dispatched_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          source_id?: string | null
          source_table?: string | null
          status?: string
        }
        Relationships: []
      }
      agent_runs: {
        Row: {
          agent_name: string
          created_at: string
          duration_ms: number | null
          error: string | null
          event_id: string | null
          event_type: string
          id: string
          input: Json
          output: string | null
          status: string
        }
        Insert: {
          agent_name: string
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          event_id?: string | null
          event_type: string
          id?: string
          input?: Json
          output?: string | null
          status?: string
        }
        Update: {
          agent_name?: string
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          event_id?: string | null
          event_type?: string
          id?: string
          input?: Json
          output?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "agent_events"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string | null
          author_name: string | null
          content: string
          content_format: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_featured: boolean
          published_at: string | null
          read_minutes: number
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          content?: string
          content_format?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          read_minutes?: number
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          content?: string
          content_format?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          read_minutes?: number
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      connections: {
        Row: {
          addressee_id: string
          created_at: string | null
          id: string
          requester_id: string
          status: string
        }
        Insert: {
          addressee_id: string
          created_at?: string | null
          id?: string
          requester_id: string
          status?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string | null
          id?: string
          requester_id?: string
          status?: string
        }
        Relationships: []
      }
      dev_profiles: {
        Row: {
          bio: string | null
          codeforces_data: Json | null
          codeforces_handle: string | null
          created_at: string
          display_name: string | null
          github_data: Json | null
          github_username: string | null
          handle: string
          headline: string | null
          is_featured: boolean
          leetcode_url: string | null
          linkedin_url: string | null
          location: string | null
          portfolio_url: string | null
          synced_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          codeforces_data?: Json | null
          codeforces_handle?: string | null
          created_at?: string
          display_name?: string | null
          github_data?: Json | null
          github_username?: string | null
          handle: string
          headline?: string | null
          is_featured?: boolean
          leetcode_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          synced_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          codeforces_data?: Json | null
          codeforces_handle?: string | null
          created_at?: string
          display_name?: string | null
          github_data?: Json | null
          github_username?: string | null
          handle?: string
          headline?: string | null
          is_featured?: boolean
          leetcode_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          synced_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      internship_applications: {
        Row: {
          applicant_id: string
          cover_note: string | null
          created_at: string | null
          id: string
          internship_id: string
          resume_snapshot: Json | null
          status: string
        }
        Insert: {
          applicant_id: string
          cover_note?: string | null
          created_at?: string | null
          id?: string
          internship_id: string
          resume_snapshot?: Json | null
          status?: string
        }
        Update: {
          applicant_id?: string
          cover_note?: string | null
          created_at?: string | null
          id?: string
          internship_id?: string
          resume_snapshot?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_applications_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
        ]
      }
      internships: {
        Row: {
          apply_url: string | null
          company: string
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          is_featured: boolean
          location: string | null
          posted_by: string | null
          requirements: string[] | null
          stipend: string | null
          tech_stack: string[] | null
          title: string
        }
        Insert: {
          apply_url?: string | null
          company: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_featured?: boolean
          location?: string | null
          posted_by?: string | null
          requirements?: string[] | null
          stipend?: string | null
          tech_stack?: string[] | null
          title: string
        }
        Update: {
          apply_url?: string | null
          company?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_featured?: boolean
          location?: string | null
          posted_by?: string | null
          requirements?: string[] | null
          stipend?: string | null
          tech_stack?: string[] | null
          title?: string
        }
        Relationships: []
      }
      join_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          requester_id: string
          role: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          requester_id: string
          role?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          requester_id?: string
          role?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          college: string | null
          created_at: string | null
          full_name: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          looking_for: string[] | null
          open_to_collab: boolean | null
          skills: string[] | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          college?: string | null
          created_at?: string | null
          full_name?: string | null
          github_url?: string | null
          id: string
          linkedin_url?: string | null
          location?: string | null
          looking_for?: string[] | null
          open_to_collab?: boolean | null
          skills?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          college?: string | null
          created_at?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          looking_for?: string[] | null
          open_to_collab?: boolean | null
          skills?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string
          github_url: string | null
          id: string
          live_url: string | null
          owner_id: string
          roles_needed: string[] | null
          tag: string | null
          tech_stack: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          github_url?: string | null
          id?: string
          live_url?: string | null
          owner_id: string
          roles_needed?: string[] | null
          tag?: string | null
          tech_stack?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          github_url?: string | null
          id?: string
          live_url?: string | null
          owner_id?: string
          roles_needed?: string[] | null
          tag?: string | null
          tech_stack?: string[] | null
          title?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
          uses: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          uses?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          uses?: number
        }
        Relationships: []
      }
      resumes: {
        Row: {
          achievements: Json | null
          education: Json | null
          email: string | null
          experiences: Json | null
          headline: string | null
          links: Json | null
          location: string | null
          phone: string | null
          projects: Json | null
          skills: string[] | null
          summary: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements?: Json | null
          education?: Json | null
          email?: string | null
          experiences?: Json | null
          headline?: string | null
          links?: Json | null
          location?: string | null
          phone?: string | null
          projects?: Json | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements?: Json | null
          education?: Json | null
          email?: string | null
          experiences?: Json | null
          headline?: string | null
          links?: Json | null
          location?: string | null
          phone?: string | null
          projects?: Json | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      room_members: {
        Row: {
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          kind: string
          name: string
          slug: string
          topic: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          kind: string
          name: string
          slug: string
          topic?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          kind?: string
          name?: string
          slug?: string
          topic?: string | null
        }
        Relationships: []
      }
      startup_ideas: {
        Row: {
          created_at: string | null
          founder_id: string
          id: string
          pitch: string
          roles_needed: string[] | null
          stage: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          founder_id: string
          id?: string
          pitch: string
          roles_needed?: string[] | null
          stage?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          founder_id?: string
          id?: string
          pitch?: string
          roles_needed?: string[] | null
          stage?: string | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_room_creator: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
      is_room_member: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
