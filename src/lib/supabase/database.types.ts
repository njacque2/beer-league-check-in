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
      game_response: {
        Row: {
          attending: boolean | null
          bringing_beer: boolean | null
          created_at: string
          game_team_id: number | null
          id: number
          team_member_id: number | null
          updated_at: string | null
        }
        Insert: {
          attending?: boolean | null
          bringing_beer?: boolean | null
          created_at?: string
          game_team_id?: number | null
          id?: number
          team_member_id?: number | null
          updated_at?: string | null
        }
        Update: {
          attending?: boolean | null
          bringing_beer?: boolean | null
          created_at?: string
          game_team_id?: number | null
          id?: number
          team_member_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_response_game_team_id_fkey"
            columns: ["game_team_id"]
            isOneToOne: false
            referencedRelation: "game_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_response_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_member"
            referencedColumns: ["id"]
          },
        ]
      }
      game_teams: {
        Row: {
          created_at: string
          game_id: number | null
          id: number
          is_home: boolean | null
          team_id: number | null
        }
        Insert: {
          created_at?: string
          game_id?: number | null
          id?: number
          is_home?: boolean | null
          team_id?: number | null
        }
        Update: {
          created_at?: string
          game_id?: number | null
          id?: number
          is_home?: boolean | null
          team_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_teams_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          game_time: string | null
          id: number
          location: string | null
          season_id: number | null
        }
        Insert: {
          created_at?: string
          game_time?: string | null
          id?: number
          location?: string | null
          season_id?: number | null
        }
        Update: {
          created_at?: string
          game_time?: string | null
          id?: number
          location?: string | null
          season_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "games_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "season"
            referencedColumns: ["id"]
          },
        ]
      }
      league: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          created_at: string
          display_name: string | null
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: number
          user_id?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: number
          user_id?: string
        }
        Relationships: []
      }
      season: {
        Row: {
          created_at: string
          end_date: string | null
          id: number
          is_active: boolean | null
          league_id: number
          start_date: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: number
          is_active?: boolean | null
          league_id: number
          start_date?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: number
          is_active?: boolean | null
          league_id?: number
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "season_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "league"
            referencedColumns: ["id"]
          },
        ]
      }
      team: {
        Row: {
          created_at: string
          id: number
          league_id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          league_id: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          league_id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "Team_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "league"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member: {
        Row: {
          id: number
          joined_at: string
          position: string | null
          profile_id: number | null
          role: string | null
          team_id: number | null
        }
        Insert: {
          id?: number
          joined_at?: string
          position?: string | null
          profile_id?: number | null
          role?: string | null
          team_id?: number | null
        }
        Update: {
          id?: number
          joined_at?: string
          position?: string | null
          profile_id?: number | null
          role?: string | null
          team_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "team_member_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

