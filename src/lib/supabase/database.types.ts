/**
 * MOOSTIK Supabase Database Types
 * Auto-generated from MCP - Février 2026
 *
 * This file is auto-generated. Do not edit manually.
 */

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
    PostgrestVersion: "14.1"
  }
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
            referencedRelation: "episode_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acts_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          search_vector: unknown
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
          search_vector?: unknown
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
          search_vector?: unknown
          species?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_costs: {
        Row: {
          created_at: string | null
          credits_cost: number
          description: string | null
          id: string
          is_active: boolean
          model_name: string | null
          name: string
          operation_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits_cost: number
          description?: string | null
          id: string
          is_active?: boolean
          model_name?: string | null
          name: string
          operation_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits_cost?: number
          description?: string | null
          id?: string
          is_active?: boolean
          model_name?: string | null
          name?: string
          operation_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "shot_details"
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
      invitation_redemptions: {
        Row: {
          created_at: string | null
          id: string
          invitation_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invitation_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invitation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_redemptions_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          bonus_credits: number
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number
          email: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number
          plan_id: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          bonus_credits?: number
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number
          email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          plan_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          bonus_credits?: number
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number
          email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          plan_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
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
          search_vector: unknown
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
          search_vector?: unknown
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
          search_vector?: unknown
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          badge_color: string | null
          badge_text: string | null
          created_at: string | null
          credits_monthly: number
          description: string | null
          display_order: number
          has_4k_export: boolean
          has_api_access: boolean
          has_blood_director: boolean
          has_custom_models: boolean
          has_hd_export: boolean
          has_priority_queue: boolean
          has_video_generation: boolean
          id: string
          is_active: boolean
          is_popular: boolean
          max_episodes: number | null
          max_parallel_generations: number
          max_shots_per_episode: number | null
          max_video_duration_seconds: number | null
          name: string
          price_monthly: number
          price_yearly: number
          tier: Database["public"]["Enums"]["user_plan"]
          updated_at: string | null
        }
        Insert: {
          badge_color?: string | null
          badge_text?: string | null
          created_at?: string | null
          credits_monthly?: number
          description?: string | null
          display_order?: number
          has_4k_export?: boolean
          has_api_access?: boolean
          has_blood_director?: boolean
          has_custom_models?: boolean
          has_hd_export?: boolean
          has_priority_queue?: boolean
          has_video_generation?: boolean
          id: string
          is_active?: boolean
          is_popular?: boolean
          max_episodes?: number | null
          max_parallel_generations?: number
          max_shots_per_episode?: number | null
          max_video_duration_seconds?: number | null
          name: string
          price_monthly?: number
          price_yearly?: number
          tier: Database["public"]["Enums"]["user_plan"]
          updated_at?: string | null
        }
        Update: {
          badge_color?: string | null
          badge_text?: string | null
          created_at?: string | null
          credits_monthly?: number
          description?: string | null
          display_order?: number
          has_4k_export?: boolean
          has_api_access?: boolean
          has_blood_director?: boolean
          has_custom_models?: boolean
          has_hd_export?: boolean
          has_priority_queue?: boolean
          has_video_generation?: boolean
          id?: string
          is_active?: boolean
          is_popular?: boolean
          max_episodes?: number | null
          max_parallel_generations?: number
          max_shots_per_episode?: number | null
          max_video_duration_seconds?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          tier?: Database["public"]["Enums"]["user_plan"]
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          credits_balance: number
          credits_used_total: number
          display_name: string | null
          email: string
          episodes_created: number
          id: string
          images_generated: number
          is_active: boolean
          is_verified: boolean
          last_active_at: string | null
          plan_expires_at: string | null
          plan_id: string | null
          plan_started_at: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id: string | null
          updated_at: string | null
          videos_generated: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          credits_balance?: number
          credits_used_total?: number
          display_name?: string | null
          email: string
          episodes_created?: number
          id: string
          images_generated?: number
          is_active?: boolean
          is_verified?: boolean
          last_active_at?: string | null
          plan_expires_at?: string | null
          plan_id?: string | null
          plan_started_at?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          updated_at?: string | null
          videos_generated?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          credits_balance?: number
          credits_used_total?: number
          display_name?: string | null
          email?: string
          episodes_created?: number
          id?: string
          images_generated?: number
          is_active?: boolean
          is_verified?: boolean
          last_active_at?: string | null
          plan_expires_at?: string | null
          plan_id?: string | null
          plan_started_at?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          updated_at?: string | null
          videos_generated?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "shot_details"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "shot_details"
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
            referencedRelation: "shot_details"
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
            referencedRelation: "episode_summary"
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
      subscriptions: {
        Row: {
          cancel_at: string | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            referencedRelation: "shot_details"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "episode_summary"
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
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount: number
          p_created_by?: string
          p_description?: string
          p_type: Database["public"]["Enums"]["transaction_type"]
          p_user_id: string
        }
        Returns: boolean
      }
      deduct_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_reference_type?: string
          p_type: Database["public"]["Enums"]["transaction_type"]
          p_user_id: string
        }
        Returns: boolean
      }
      get_character_full: { Args: { p_id: string }; Returns: Json }
      get_episode_full: { Args: { p_id: string }; Returns: Json }
      is_moostik_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
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
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
      transaction_status: "pending" | "completed" | "failed" | "refunded"
      transaction_type:
        | "purchase"
        | "usage"
        | "bonus"
        | "refund"
        | "gift"
        | "subscription"
        | "admin_grant"
      user_plan: "free" | "starter" | "pro" | "studio" | "enterprise"
      user_role: "user" | "member" | "creator" | "admin" | "super_admin"
      variation_status: "pending" | "generating" | "completed" | "failed"
      video_status: "pending" | "generating" | "completed" | "failed"
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
      audio_intensity: ["low", "medium", "high", "building", "climax"],
      audio_track_type: ["music", "ambience", "sfx", "foley"],
      camera_angle: [
        "macro",
        "extreme_close_up",
        "close_up",
        "medium",
        "wide",
        "extreme_wide",
        "low_angle",
        "high_angle",
        "dutch_angle",
        "pov",
      ],
      character_role: ["protagonist", "antagonist", "supporting", "background"],
      dialogue_emotion: [
        "neutral",
        "angry",
        "sad",
        "terrified",
        "determined",
        "loving",
        "mocking",
        "desperate",
        "triumphant",
        "melancholic",
      ],
      dialogue_type: [
        "spoken",
        "voiceover",
        "internal",
        "whisper",
        "scream",
        "song",
      ],
      location_type: ["moostik_city", "human_space", "hybrid", "natural"],
      relationship_type: [
        "family_parent",
        "family_child",
        "family_sibling",
        "romantic",
        "best_friend",
        "ally",
        "rival",
        "enemy",
        "mentor",
        "student",
        "colleague",
        "sidekick",
      ],
      scene_type: [
        "genocide",
        "survival",
        "training",
        "planning",
        "bar_scene",
        "battle",
        "emotional",
        "establishing",
        "flashback",
        "montage",
        "revelation",
      ],
      shot_status: ["pending", "in_progress", "completed"],
      transaction_status: ["pending", "completed", "failed", "refunded"],
      transaction_type: [
        "purchase",
        "usage",
        "bonus",
        "refund",
        "gift",
        "subscription",
        "admin_grant",
      ],
      user_plan: ["free", "starter", "pro", "studio", "enterprise"],
      user_role: ["user", "member", "creator", "admin", "super_admin"],
      variation_status: ["pending", "generating", "completed", "failed"],
      video_status: ["pending", "generating", "completed", "failed"],
    },
  },
} as const

