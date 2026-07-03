export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          bio_en: string
          bio_tr: string
          id: number
          photo_url: string | null
          projects_worked: number | null
          role_en: string | null
          role_tr: string | null
          site_description: string | null
          site_title: string | null
          skills: Json | null
          social_links: Json
          tagline_en: string | null
          tagline_tr: string | null
          title_en: string
          title_tr: string
          updated_at: string
        }
        Insert: {
          bio_en: string
          bio_tr: string
          id?: number
          photo_url?: string | null
          projects_worked?: number | null
          role_en?: string | null
          role_tr?: string | null
          site_description?: string | null
          site_title?: string | null
          skills?: Json | null
          social_links?: Json
          tagline_en?: string | null
          tagline_tr?: string | null
          title_en: string
          title_tr: string
          updated_at?: string
        }
        Update: {
          bio_en?: string
          bio_tr?: string
          id?: number
          photo_url?: string | null
          projects_worked?: number | null
          role_en?: string | null
          role_tr?: string | null
          site_description?: string | null
          site_title?: string | null
          skills?: Json | null
          social_links?: Json
          tagline_en?: string | null
          tagline_tr?: string | null
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_message: {
        Row: {
          body: string
          created_at: string
          email: string
          id: string
          is_read: boolean
          name: string
          subject: string | null
        }
        Insert: {
          body: string
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          name: string
          subject?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      page_seo: {
        Row: {
          description_en: string | null
          description_tr: string | null
          id: string
          no_index: boolean
          og_image: string | null
          page_key: Database["public"]["Enums"]["page_key"]
          title_en: string | null
          title_tr: string | null
          updated_at: string
        }
        Insert: {
          description_en?: string | null
          description_tr?: string | null
          id?: string
          no_index?: boolean
          og_image?: string | null
          page_key: Database["public"]["Enums"]["page_key"]
          title_en?: string | null
          title_tr?: string | null
          updated_at?: string
        }
        Update: {
          description_en?: string | null
          description_tr?: string | null
          id?: string
          no_index?: boolean
          og_image?: string | null
          page_key?: Database["public"]["Enums"]["page_key"]
          title_en?: string | null
          title_tr?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project: {
        Row: {
          cover_image: string | null
          created_at: string
          demo_folder: string | null
          demo_type: Database["public"]["Enums"]["demo_type"]
          demo_url: string | null
          desc_en: string
          desc_tr: string
          download_url: string | null
          id: string
          is_featured: boolean
          order: number
          repo_url: string | null
          slug: string
          summary_en: string
          summary_tr: string
          tags: string[]
          title_en: string
          title_tr: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          demo_folder?: string | null
          demo_type?: Database["public"]["Enums"]["demo_type"]
          demo_url?: string | null
          desc_en: string
          desc_tr: string
          download_url?: string | null
          id?: string
          is_featured?: boolean
          order?: number
          repo_url?: string | null
          slug: string
          summary_en: string
          summary_tr: string
          tags?: string[]
          title_en: string
          title_tr: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          demo_folder?: string | null
          demo_type?: Database["public"]["Enums"]["demo_type"]
          demo_url?: string | null
          desc_en?: string
          desc_tr?: string
          download_url?: string | null
          id?: string
          is_featured?: boolean
          order?: number
          repo_url?: string | null
          slug?: string
          summary_en?: string
          summary_tr?: string
          tags?: string[]
          title_en?: string
          title_tr?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      project_image: {
        Row: {
          alt_en: string | null
          alt_tr: string | null
          created_at: string
          id: string
          order: number
          project_id: string
          url: string
        }
        Insert: {
          alt_en?: string | null
          alt_tr?: string | null
          created_at?: string
          id?: string
          order?: number
          project_id: string
          url: string
        }
        Update: {
          alt_en?: string | null
          alt_tr?: string | null
          created_at?: string
          id?: string
          order?: number
          project_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_image_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      work_experience: {
        Row: {
          company_name: string
          created_at: string
          desc_en: string
          desc_tr: string
          end_date: string | null
          id: string
          order: number
          role_en: string
          role_tr: string
          start_date: string
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          desc_en: string
          desc_tr: string
          end_date?: string | null
          id?: string
          order?: number
          role_en: string
          role_tr: string
          start_date: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          desc_en?: string
          desc_tr?: string
          end_date?: string | null
          id?: string
          order?: number
          role_en?: string
          role_tr?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      demo_type:
        | "EXTERNAL_LINK"
        | "EMBEDDED_HTML"
        | "DOWNLOAD_ONLY"
        | "VIDEO_ONLY"
        | "GALLERY_ONLY"
      page_key: "HOME" | "ABOUT" | "CAREER" | "PROJECTS" | "CONTACT"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      demo_type: [
        "EXTERNAL_LINK",
        "EMBEDDED_HTML",
        "DOWNLOAD_ONLY",
        "VIDEO_ONLY",
        "GALLERY_ONLY",
      ],
      page_key: ["HOME", "ABOUT", "CAREER", "PROJECTS", "CONTACT"],
    },
  },
} as const

