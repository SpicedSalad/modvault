export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── Shared application-level interfaces ──────────────────────────────

export interface Tag {
  id: string;
  name: string;
  customDescription?: string;
}

export interface TweakFileForm {
  mc_version: string;
  loader_type: string;
  download_url: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
        }
      }
      tweaks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: 'Mod' | 'Datapack' | 'Resource Pack' | 'Shader'
          tags: Json[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: 'Mod' | 'Datapack' | 'Resource Pack' | 'Shader'
          tags?: Json[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: 'Mod' | 'Datapack' | 'Resource Pack' | 'Shader'
          tags?: Json[] | null
          created_at?: string
        }
      }
      images: {
        Row: {
          id: string
          tweak_id: string
          drive_image_url: string
        }
        Insert: {
          id?: string
          tweak_id: string
          drive_image_url: string
        }
        Update: {
          id?: string
          tweak_id?: string
          drive_image_url?: string
        }
      }
      tweak_files: {
        Row: {
          id: string
          tweak_id: string
          mc_version: string
          loader_type: string
          download_url: string
          created_at: string
        }
        Insert: {
          id?: string
          tweak_id: string
          mc_version: string
          loader_type: string
          download_url: string
          created_at?: string
        }
        Update: {
          id?: string
          tweak_id?: string
          mc_version?: string
          loader_type?: string
          download_url?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          tweak_id: string
          user_id: string
          content: string
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tweak_id: string
          user_id: string
          content: string
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tweak_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          created_at?: string
        }
      }
      votes: {
        Row: {
          user_id: string
          tweak_id: string
          vote_value: number
        }
        Insert: {
          user_id: string
          tweak_id: string
          vote_value: number
        }
        Update: {
          user_id?: string
          tweak_id?: string
          vote_value?: number
        }
      }
      ai_insights: {
        Row: {
          tweak_id: string
          summary_text: string
          sentiment: string | null
          updated_at: string
        }
        Insert: {
          tweak_id: string
          summary_text: string
          sentiment?: string | null
          updated_at?: string
        }
        Update: {
          tweak_id?: string
          summary_text?: string
          sentiment?: string | null
          updated_at?: string
        }
      }
    }
  }
}
