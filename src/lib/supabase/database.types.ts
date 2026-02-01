/**
 * MOOSTIK Supabase Database Types
 * Generated from MCP - January 2026
 * 
 * This file is auto-generated. Do not edit manually.
 * Run: npx supabase gen types typescript --project-id yatwvcojuomvjvrxlugs
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      acts: {
        Row: {
          created_at: string | null
          description: string | null
          episode_id: string
          id: string
          number: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          episode_id: string
          id: string
          number: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          episode_id?: string
          id?: string
          number?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acts_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          age: string | null
          backstory: string | null
          created_at: string | null
          created_by: string | null
          distinctive_features: string[] | null
          fears: string[] | null
          id: string
          motivations: string[] | null
          name: string
          personality_traits: string[] | null
          physical_description: string | null
          quotes: string[] | null
          reference_images: string[] | null
          reference_prompt: string | null
          relationships: Json | null
          role: Database["public"]["Enums"]["character_role"]
          species: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          age?: string | null
          backstory?: string | null
          created_at?: string | null
          created_by?: string | null
          distinctive_features?: string[] | null
          fears?: string[] | null
          id: string
          motivations?: string[] | null
          name: string
          personality_traits?: string[] | null
          physical_description?: string | null
          quotes?: string[] | null
          reference_images?: string[] | null
          reference_prompt?: string | null
          relationships?: Json | null
          role?: Database["public"]["Enums"]["character_role"]
          species?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: string | null
          backstory?: string | null
          created_at?: string | null
          created_by?: string | null
          distinctive_features?: string[] | null
          fears?: string[] | null
          id?: string
          motivations?: string[] | null
          name?: string
          personality_traits?: string[] | null
          physical_description?: string | null
          quotes?: string[] | null
          reference_images?: string[] | null
          reference_prompt?: string | null
          relationships?: Json | null
          role?: Database["public"]["Enums"]["character_role"]
          species?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dialogue_lines: {
        Row: {
          audio_path: string | null
          character_id: string | null
          created_at: string | null
          direction_notes: string | null
          duration: number | null
          emotion: Database["public"]["Enums"]["dialogue_emotion"]
          id: string
          sequence_order: number
          shot_id: string
          speaker_name: string
          start_time: number | null
          text: string
          text_creole: string | null
          type: Database["public"]["Enums"]["dialogue_type"]
          updated_at: string | null
        }
        Insert: {
          audio_path?: string | null
          character_id?: string | null
          created_at?: string | null
          direction_notes?: string | null
          duration?: number | null
          emotion?: Database["public"]["Enums"]["dialogue_emotion"]
          id: string
          sequence_order?: number
          shot_id: string
          speaker_name: string
          start_time?: number | null
          text: string
          text_creole?: string | null
          type?: Database["public"]["Enums"]["dialogue_type"]
          updated_at?: string | null
        }
        Update: {
          audio_path?: string | null
          character_id?: string | null
          created_at?: string | null
          direction_notes?: string | null
          duration?: number | null
          emotion?: Database["public"]["Enums"]["dialogue_emotion"]
          id?: string
          sequence_order?: number
          shot_id?: string
          speaker_name?: string
          start_time?: number | null
          text?: string
          text_creole?: string | null
          type?: Database["public"]["Enums"]["dialogue_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dialogue_lines_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialogue_lines_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          number: number
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id: string
          number: number
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          number?: number
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          architectural_features: string[] | null
          atmosphere: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          lighting: string | null
          materials: string[] | null
          name: string
          reference_images: string[] | null
          reference_prompt: string | null
          scale: string | null
          type: Database["public"]["Enums"]["location_type"]
          updated_at: string | null
        }
        Insert: {
          architectural_features?: string[] | null
          atmosphere?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id: string
          lighting?: string | null
          materials?: string[] | null
          name: string
          reference_images?: string[] | null
          reference_prompt?: string | null
          scale?: string | null
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string | null
        }
        Update: {
          architectural_features?: string[] | null
          atmosphere?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          lighting?: string | null
          materials?: string[] | null
          name?: string
          reference_images?: string[] | null
          reference_prompt?: string | null
          scale?: string | null
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      shot_audio: {
        Row: {
          audio_path: string | null
          created_at: string | null
          description: string | null
          id: string
          intensity: Database["public"]["Enums"]["audio_intensity"] | null
          mix_notes: string | null
          reference: string | null
          shot_id: string
          track_type: Database["public"]["Enums"]["audio_track_type"]
          updated_at: string | null
        }
        Insert: {
          audio_path?: string | null
          created_at?: string | null
          description?: string | null
          id: string
          intensity?: Database["public"]["Enums"]["audio_intensity"] | null
          mix_notes?: string | null
          reference?: string | null
          shot_id: string
          track_type: Database["public"]["Enums"]["audio_track_type"]
          updated_at?: string | null
        }
        Update: {
          audio_path?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          intensity?: Database["public"]["Enums"]["audio_intensity"] | null
          mix_notes?: string | null
          reference?: string | null
          shot_id?: string
          track_type?: Database["public"]["Enums"]["audio_track_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shot_audio_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
        ]
      }
      shot_characters: {
        Row: {
          character_id: string
          importance: string | null
          shot_id: string
        }
        Insert: {
          character_id: string
          importance?: string | null
          shot_id: string
        }
        Update: {
          character_id?: string
          importance?: string | null
          shot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shot_characters_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shot_characters_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
        ]
      }
      shot_locations: {
        Row: {
          location_id: string
          shot_id: string
        }
        Insert: {
          location_id: string
          shot_id: string
        }
        Update: {
          location_id?: string
          shot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shot_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shot_locations_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
        ]
      }
      shots: {
        Row: {
          act_id: string | null
          created_at: string | null
          description: string | null
          dialogue_audio_path: string | null
          director_notes: string | null
          duration_seconds: number | null
          episode_id: string
          id: string
          mixed_audio_path: string | null
          name: string
          narrative_description: string | null
          number: number
          prompt: Json | null
          scene_type: Database["public"]["Enums"]["scene_type"]
          status: Database["public"]["Enums"]["shot_status"]
          updated_at: string | null
        }
        Insert: {
          act_id?: string | null
          created_at?: string | null
          description?: string | null
          dialogue_audio_path?: string | null
          director_notes?: string | null
          duration_seconds?: number | null
          episode_id: string
          id: string
          mixed_audio_path?: string | null
          name: string
          narrative_description?: string | null
          number: number
          prompt?: Json | null
          scene_type?: Database["public"]["Enums"]["scene_type"]
          status?: Database["public"]["Enums"]["shot_status"]
          updated_at?: string | null
        }
        Update: {
          act_id?: string | null
          created_at?: string | null
          description?: string | null
          dialogue_audio_path?: string | null
          director_notes?: string | null
          duration_seconds?: number | null
          episode_id?: string
          id?: string
          mixed_audio_path?: string | null
          name?: string
          narrative_description?: string | null
          number?: number
          prompt?: Json | null
          scene_type?: Database["public"]["Enums"]["scene_type"]
          status?: Database["public"]["Enums"]["shot_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shots_act_id_fkey"
            columns: ["act_id"]
            isOneToOne: false
            referencedRelation: "acts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shots_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      variations: {
        Row: {
          camera_angle: Database["public"]["Enums"]["camera_angle"]
          created_at: string | null
          generated_at: string | null
          id: string
          image_url: string | null
          lip_sync_status: string | null
          lip_sync_video_path: string | null
          local_path: string | null
          quality_notes: string | null
          quality_score: number | null
          seed: number | null
          shot_id: string
          status: Database["public"]["Enums"]["variation_status"]
          updated_at: string | null
          video_duration: number | null
          video_generated_at: string | null
          video_local_path: string | null
          video_provider: string | null
          video_status: Database["public"]["Enums"]["video_status"] | null
          video_url: string | null
        }
        Insert: {
          camera_angle: Database["public"]["Enums"]["camera_angle"]
          created_at?: string | null
          generated_at?: string | null
          id: string
          image_url?: string | null
          lip_sync_status?: string | null
          lip_sync_video_path?: string | null
          local_path?: string | null
          quality_notes?: string | null
          quality_score?: number | null
          seed?: number | null
          shot_id: string
          status?: Database["public"]["Enums"]["variation_status"]
          updated_at?: string | null
          video_duration?: number | null
          video_generated_at?: string | null
          video_local_path?: string | null
          video_provider?: string | null
          video_status?: Database["public"]["Enums"]["video_status"] | null
          video_url?: string | null
        }
        Update: {
          camera_angle?: Database["public"]["Enums"]["camera_angle"]
          created_at?: string | null
          generated_at?: string | null
          id?: string
          image_url?: string | null
          lip_sync_status?: string | null
          lip_sync_video_path?: string | null
          local_path?: string | null
          quality_notes?: string | null
          quality_score?: number | null
          seed?: number | null
          shot_id?: string
          status?: Database["public"]["Enums"]["variation_status"]
          updated_at?: string | null
          video_duration?: number | null
          video_generated_at?: string | null
          video_local_path?: string | null
          video_provider?: string | null
          video_status?: Database["public"]["Enums"]["video_status"] | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "variations_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      episode_summary: {
        Row: {
          completed_shots: number | null
          completed_variations: number | null
          completed_videos: number | null
          created_at: string | null
          description: string | null
          id: string | null
          number: number | null
          status: string | null
          title: string | null
          total_shots: number | null
          total_variations: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      shot_details: {
        Row: {
          act_id: string | null
          act_title: string | null
          characters: Json | null
          created_at: string | null
          description: string | null
          dialogue_audio_path: string | null
          director_notes: string | null
          duration_seconds: number | null
          episode_id: string | null
          episode_number: number | null
          episode_title: string | null
          id: string | null
          locations: Json | null
          mixed_audio_path: string | null
          name: string | null
          narrative_description: string | null
          number: number | null
          prompt: Json | null
          scene_type: Database["public"]["Enums"]["scene_type"] | null
          status: Database["public"]["Enums"]["shot_status"] | null
          updated_at: string | null
          variations: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_character_full: {
        Args: { p_id: string }
        Returns: Json
      }
      get_episode_full: {
        Args: { p_id: string }
        Returns: Json
      }
      is_moostik_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      search_moostik: {
        Args: { limit_count?: number; query_text: string }
        Returns: {
          description: string
          entity_type: string
          id: string
          name: string
          rank: number
        }[]
      }
    }
    Enums: {
      audio_intensity: "low" | "medium" | "high" | "building" | "climax"
      audio_track_type: "music" | "ambience" | "sfx" | "foley"
      camera_angle:
        | "macro"
        | "extreme_close_up"
        | "close_up"
        | "medium"
        | "wide"
        | "extreme_wide"
        | "low_angle"
        | "high_angle"
        | "dutch_angle"
        | "pov"
      character_role: "protagonist" | "antagonist" | "supporting" | "background"
      dialogue_emotion:
        | "neutral"
        | "angry"
        | "sad"
        | "terrified"
        | "determined"
        | "loving"
        | "mocking"
        | "desperate"
        | "triumphant"
        | "melancholic"
      dialogue_type:
        | "spoken"
        | "voiceover"
        | "internal"
        | "whisper"
        | "scream"
        | "song"
      location_type: "moostik_city" | "human_space" | "hybrid" | "natural"
      relationship_type:
        | "family_parent"
        | "family_child"
        | "family_sibling"
        | "romantic"
        | "best_friend"
        | "ally"
        | "rival"
        | "enemy"
        | "mentor"
        | "student"
        | "colleague"
        | "sidekick"
      scene_type:
        | "genocide"
        | "survival"
        | "training"
        | "planning"
        | "bar_scene"
        | "battle"
        | "emotional"
        | "establishing"
        | "flashback"
        | "montage"
        | "revelation"
      shot_status: "pending" | "in_progress" | "completed"
      variation_status: "pending" | "generating" | "completed" | "failed"
      video_status: "pending" | "generating" | "completed" | "failed"
    }
  }
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"]
