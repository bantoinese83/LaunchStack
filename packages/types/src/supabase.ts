export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string;
          created_at: string;
          id: string;
          metadata: Json | null;
          target_id: string;
          target_type: string;
          workspace_id: string | null;
        };
        Insert: {
          action: string;
          actor_id: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          target_id: string;
          target_type: string;
          workspace_id?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          target_id?: string;
          target_type?: string;
          workspace_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audit_logs_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      consent_records: {
        Row: {
          analytics: boolean;
          marketing: boolean;
          necessary: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          analytics?: boolean;
          marketing?: boolean;
          necessary?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          analytics?: boolean;
          marketing?: boolean;
          necessary?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'consent_records_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      data_export_requests: {
        Row: {
          created_at: string;
          id: string;
          payload: Json | null;
          status: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          payload?: Json | null;
          status?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          payload?: Json | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'data_export_requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      feature_flags: {
        Row: {
          created_at: string;
          description: string;
          enabled_globally: boolean;
          id: string;
          key: string;
          target_workspaces: string[] | null;
        };
        Insert: {
          created_at?: string;
          description: string;
          enabled_globally?: boolean;
          id?: string;
          key: string;
          target_workspaces?: string[] | null;
        };
        Update: {
          created_at?: string;
          description?: string;
          enabled_globally?: boolean;
          id?: string;
          key?: string;
          target_workspaces?: string[] | null;
        };
        Relationships: [];
      };
      feedback_posts: {
        Row: {
          author_id: string;
          category: string;
          created_at: string;
          description: string;
          flagged: boolean;
          id: string;
          status: string;
          title: string;
          updated_at: string;
          upvotes_count: number;
          workspace_id: string;
        };
        Insert: {
          author_id: string;
          category?: string;
          created_at?: string;
          description: string;
          flagged?: boolean;
          id?: string;
          status?: string;
          title: string;
          updated_at?: string;
          upvotes_count?: number;
          workspace_id: string;
        };
        Update: {
          author_id?: string;
          category?: string;
          created_at?: string;
          description?: string;
          flagged?: boolean;
          id?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          upvotes_count?: number;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedback_posts_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      feedback_votes: {
        Row: {
          created_at: string;
          id: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_votes_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'feedback_posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedback_votes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      mfa_recovery_codes: {
        Row: {
          code_hash: string;
          created_at: string;
          id: string;
          used_at: string | null;
          user_id: string;
        };
        Insert: {
          code_hash: string;
          created_at?: string;
          id?: string;
          used_at?: string | null;
          user_id: string;
        };
        Update: {
          code_hash?: string;
          created_at?: string;
          id?: string;
          used_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mfa_recovery_codes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      mystic_appointment_photos: {
        Row: {
          appointment_id: string;
          created_at: string;
          id: string;
          public_url: string;
          storage_path: string;
        };
        Insert: {
          appointment_id: string;
          created_at?: string;
          id?: string;
          public_url: string;
          storage_path: string;
        };
        Update: {
          appointment_id?: string;
          created_at?: string;
          id?: string;
          public_url?: string;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mystic_appointment_photos_appointment_id_fkey';
            columns: ['appointment_id'];
            isOneToOne: false;
            referencedRelation: 'mystic_appointments';
            referencedColumns: ['id'];
          },
        ];
      };
      mystic_appointments: {
        Row: {
          address: Json;
          client_notes: string | null;
          client_user_id: string;
          created_at: string;
          deposit_captured: boolean;
          deposit_cents: number;
          distance_miles: number | null;
          door_timer_ends_at: string | null;
          duration_minutes: number;
          entitlement: string;
          eta_minutes: number | null;
          stylist_latitude: number | null;
          stylist_longitude: number | null;
          stylist_location_updated_at: string | null;
          id: string;
          payment_captured: boolean;
          quote_cents: number;
          referred_by_name: string | null;
          service_id: string;
          starts_at: string;
          status: Database['public']['Enums']['mystic_appointment_status'];
          stripe_payment_intent_id: string | null;
          surcharge_json: Json;
          tags: string[];
          tip_cents: number;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          address: Json;
          client_notes?: string | null;
          client_user_id: string;
          created_at?: string;
          deposit_captured?: boolean;
          deposit_cents?: number;
          distance_miles?: number | null;
          door_timer_ends_at?: string | null;
          duration_minutes: number;
          entitlement?: string;
          eta_minutes?: number | null;
          stylist_latitude?: number | null;
          stylist_longitude?: number | null;
          stylist_location_updated_at?: string | null;
          id?: string;
          payment_captured?: boolean;
          quote_cents: number;
          referred_by_name?: string | null;
          service_id: string;
          starts_at: string;
          status?: Database['public']['Enums']['mystic_appointment_status'];
          stripe_payment_intent_id?: string | null;
          surcharge_json?: Json;
          tags?: string[];
          tip_cents?: number;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          address?: Json;
          client_notes?: string | null;
          client_user_id?: string;
          created_at?: string;
          deposit_captured?: boolean;
          deposit_cents?: number;
          distance_miles?: number | null;
          door_timer_ends_at?: string | null;
          duration_minutes?: number;
          entitlement?: string;
          eta_minutes?: number | null;
          stylist_latitude?: number | null;
          stylist_longitude?: number | null;
          stylist_location_updated_at?: string | null;
          id?: string;
          payment_captured?: boolean;
          quote_cents?: number;
          referred_by_name?: string | null;
          service_id?: string;
          starts_at?: string;
          status?: Database['public']['Enums']['mystic_appointment_status'];
          stripe_payment_intent_id?: string | null;
          surcharge_json?: Json;
          tags?: string[];
          tip_cents?: number;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mystic_appointments_client_user_id_fkey';
            columns: ['client_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mystic_appointments_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      mystic_blasts: {
        Row: {
          body: string;
          channel: string;
          created_at: string;
          created_by: string;
          id: string;
          recipient_count: number;
          segment: string;
          sent_at: string | null;
          status: string;
          subject: string | null;
          workspace_id: string;
        };
        Insert: {
          body: string;
          channel: string;
          created_at?: string;
          created_by: string;
          id?: string;
          recipient_count?: number;
          segment: string;
          sent_at?: string | null;
          status?: string;
          subject?: string | null;
          workspace_id: string;
        };
        Update: {
          body?: string;
          channel?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          recipient_count?: number;
          segment?: string;
          sent_at?: string | null;
          status?: string;
          subject?: string | null;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mystic_blasts_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mystic_blasts_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      mystic_blocked_dates: {
        Row: {
          block_date: string;
          created_at: string;
          id: string;
          reason: string | null;
          workspace_id: string;
        };
        Insert: {
          block_date: string;
          created_at?: string;
          id?: string;
          reason?: string | null;
          workspace_id: string;
        };
        Update: {
          block_date?: string;
          created_at?: string;
          id?: string;
          reason?: string | null;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mystic_blocked_dates_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      mystic_client_credits: {
        Row: {
          blowouts_remaining: number;
          created_at: string;
          expires_at: string | null;
          id: string;
          source_id: string;
          source_kind: string;
          stripe_subscription_id: string | null;
          updated_at: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          blowouts_remaining?: number;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          source_id: string;
          source_kind: string;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          blowouts_remaining?: number;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          source_id?: string;
          source_kind?: string;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mystic_client_credits_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mystic_client_credits_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      mystic_client_profiles: {
        Row: {
          birthday: string | null;
          created_at: string;
          marketing_email: boolean;
          marketing_sms: boolean;
          phone: string | null;
          referral_code: string | null;
          referral_count: number;
          updated_at: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          birthday?: string | null;
          created_at?: string;
          marketing_email?: boolean;
          marketing_sms?: boolean;
          phone?: string | null;
          referral_code?: string | null;
          referral_count?: number;
          updated_at?: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          birthday?: string | null;
          created_at?: string;
          marketing_email?: boolean;
          marketing_sms?: boolean;
          phone?: string | null;
          referral_code?: string | null;
          referral_count?: number;
          updated_at?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mystic_client_profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mystic_client_profiles_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      mystic_messages: {
        Row: {
          appointment_id: string | null;
          attachment_urls: string[];
          body: string;
          client_user_id: string;
          created_at: string;
          id: string;
          read_at: string | null;
          sender_id: string;
          sender_role: string;
          workspace_id: string;
        };
        Insert: {
          appointment_id?: string | null;
          attachment_urls?: string[];
          body: string;
          client_user_id: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          sender_id: string;
          sender_role: string;
          workspace_id: string;
        };
        Update: {
          appointment_id?: string | null;
          attachment_urls?: string[];
          body?: string;
          client_user_id?: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          sender_id?: string;
          sender_role?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mystic_messages_appointment_id_fkey';
            columns: ['appointment_id'];
            isOneToOne: false;
            referencedRelation: 'mystic_appointments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mystic_messages_client_user_id_fkey';
            columns: ['client_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mystic_messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mystic_messages_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      mystic_preorders: {
        Row: {
          amount_cents: number;
          created_at: string;
          id: string;
          product_id: string;
          quantity: number;
          status: string;
          stripe_checkout_session_id: string | null;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          id?: string;
          product_id: string;
          quantity?: number;
          status?: string;
          stripe_checkout_session_id?: string | null;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          id?: string;
          product_id?: string;
          quantity?: number;
          status?: string;
          stripe_checkout_session_id?: string | null;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mystic_preorders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mystic_preorders_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      mystic_referrals: {
        Row: {
          appointment_id: string | null;
          created_at: string;
          credited: boolean;
          id: string;
          referred_name: string;
          referred_user_id: string | null;
          referrer_user_id: string;
          workspace_id: string;
        };
        Insert: {
          appointment_id?: string | null;
          created_at?: string;
          credited?: boolean;
          id?: string;
          referred_name: string;
          referred_user_id?: string | null;
          referrer_user_id: string;
          workspace_id: string;
        };
        Update: {
          appointment_id?: string | null;
          created_at?: string;
          credited?: boolean;
          id?: string;
          referred_name?: string;
          referred_user_id?: string | null;
          referrer_user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mystic_referrals_appointment_id_fkey';
            columns: ['appointment_id'];
            isOneToOne: false;
            referencedRelation: 'mystic_appointments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mystic_referrals_referred_user_id_fkey';
            columns: ['referred_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mystic_referrals_referrer_user_id_fkey';
            columns: ['referrer_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mystic_referrals_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      mystic_studio_settings: {
        Row: {
          deposit_cents: number;
          door_timer_minutes: number;
          evening_surcharge_cents: number;
          included_miles: number;
          per_mile_surcharge_cents: number;
          referral_reward_after: number;
          updated_at: string;
          winter_buffer_enabled: boolean;
          workspace_id: string;
        };
        Insert: {
          deposit_cents?: number;
          door_timer_minutes?: number;
          evening_surcharge_cents?: number;
          included_miles?: number;
          per_mile_surcharge_cents?: number;
          referral_reward_after?: number;
          updated_at?: string;
          winter_buffer_enabled?: boolean;
          workspace_id: string;
        };
        Update: {
          deposit_cents?: number;
          door_timer_minutes?: number;
          evening_surcharge_cents?: number;
          included_miles?: number;
          per_mile_surcharge_cents?: number;
          referral_reward_after?: number;
          updated_at?: string;
          winter_buffer_enabled?: boolean;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mystic_studio_settings_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: true;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          system_role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          system_role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          system_role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_tokens: {
        Row: {
          created_at: string;
          id: string;
          platform: string;
          token: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          platform?: string;
          token: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          platform?: string;
          token?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'push_tokens_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          created_at: string;
          current_period_end: string;
          id: string;
          status: string;
          stripe_price_id: string;
          stripe_subscription_id: string;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end: string;
          id?: string;
          status: string;
          stripe_price_id: string;
          stripe_subscription_id: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string;
          id?: string;
          status?: string;
          stripe_price_id?: string;
          stripe_subscription_id?: string;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: true;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      workspace_invites: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          role: string;
          token: string;
          workspace_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by: string;
          role?: string;
          token: string;
          workspace_id: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          role?: string;
          token?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workspace_invites_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'workspace_invites_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      workspace_members: {
        Row: {
          created_at: string;
          id: string;
          role: string;
          updated_at: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: string;
          updated_at?: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: string;
          updated_at?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workspace_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'workspace_members_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      workspaces: {
        Row: {
          created_at: string;
          id: string;
          logo_url: string | null;
          name: string;
          plan_override: string | null;
          slug: string;
          stripe_customer_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name: string;
          plan_override?: string | null;
          slug: string;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name?: string;
          plan_override?: string | null;
          slug?: string;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_workspace_invite: { Args: { p_token: string }; Returns: string };
      create_workspace_with_owner: {
        Args: { p_name: string; p_slug: string; p_user_id?: string };
        Returns: {
          created_at: string;
          id: string;
          logo_url: string | null;
          name: string;
          plan_override: string | null;
          slug: string;
          stripe_customer_id: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'workspaces';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      is_super_admin: { Args: never; Returns: boolean };
      is_workspace_member: {
        Args: { target_workspace_id: string };
        Returns: boolean;
      };
      log_audit_event: {
        Args: {
          p_action: string;
          p_metadata?: Json;
          p_target_id: string;
          p_target_type: string;
          p_workspace_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      mystic_appointment_status:
        | 'pending'
        | 'confirmed'
        | 'stylist_en_route'
        | 'stylist_arrived'
        | 'door_timer_active'
        | 'in_progress'
        | 'completed'
        | 'canceled'
        | 'no_show';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          lifecycle_configuration: Json | null;
          lifecycle_configuration_generation: string | null;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string | null;
          versioning_status: string;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          lifecycle_configuration?: Json | null;
          lifecycle_configuration_generation?: string | null;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string | null;
          versioning_status?: string;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          lifecycle_configuration?: Json | null;
          lifecycle_configuration_generation?: string | null;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string | null;
          versioning_status?: string;
        };
        Relationships: [];
      };
      buckets_analytics: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          format: string;
          id: string;
          name: string;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          format?: string;
          id?: string;
          name: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          format?: string;
          id?: string;
          name?: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Relationships: [];
      };
      buckets_vectors: {
        Row: {
          created_at: string;
          id: string;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Relationships: [];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          archived_at: string | null;
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          is_delete_marker: boolean;
          is_versioned: boolean;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          user_metadata: Json | null;
          version: string | null;
        };
        Insert: {
          archived_at?: string | null;
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          is_delete_marker?: boolean;
          is_versioned?: boolean;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Update: {
          archived_at?: string | null;
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          is_delete_marker?: boolean;
          is_versioned?: boolean;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          in_progress_size: number;
          key: string;
          metadata: Json | null;
          owner_id: string | null;
          upload_signature: string;
          user_metadata: Json | null;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id: string;
          in_progress_size?: number;
          key: string;
          metadata?: Json | null;
          owner_id?: string | null;
          upload_signature: string;
          user_metadata?: Json | null;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          in_progress_size?: number;
          key?: string;
          metadata?: Json | null;
          owner_id?: string | null;
          upload_signature?: string;
          user_metadata?: Json | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string;
          created_at: string;
          etag: string;
          id: string;
          key: string;
          owner_id: string | null;
          part_number: number;
          size: number;
          upload_id: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          etag: string;
          id?: string;
          key: string;
          owner_id?: string | null;
          part_number: number;
          size?: number;
          upload_id: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          etag?: string;
          id?: string;
          key?: string;
          owner_id?: string | null;
          part_number?: number;
          size?: number;
          upload_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey';
            columns: ['upload_id'];
            isOneToOne: false;
            referencedRelation: 's3_multipart_uploads';
            referencedColumns: ['id'];
          },
        ];
      };
      vector_indexes: {
        Row: {
          bucket_id: string;
          created_at: string;
          data_type: string;
          dimension: number;
          distance_metric: string;
          id: string;
          metadata_configuration: Json | null;
          name: string;
          updated_at: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          data_type: string;
          dimension: number;
          distance_metric: string;
          id?: string;
          metadata_configuration?: Json | null;
          name: string;
          updated_at?: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          data_type?: string;
          dimension?: number;
          distance_metric?: string;
          id?: string;
          metadata_configuration?: Json | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vector_indexes_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets_vectors';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] };
        Returns: boolean;
      };
      allow_only_operation: {
        Args: { expected_operation: string };
        Returns: boolean;
      };
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string };
        Returns: undefined;
      };
      extension: { Args: { name: string }; Returns: string };
      filename: { Args: { name: string }; Returns: string };
      foldername: { Args: { name: string }; Returns: string[] };
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string };
        Returns: string;
      };
      get_size_by_bucket: {
        Args: { delete_markers?: string; noncurrent_versions?: string };
        Returns: {
          bucket_id: string;
          size: number;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          delimiter_param: string;
          max_keys?: number;
          next_key_token?: string;
          next_upload_token?: string;
          prefix_param: string;
          raw_prefix_param?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          key: string;
        }[];
      };
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string;
          delete_markers?: string;
          delimiter_param: string;
          max_keys?: number;
          next_token?: string;
          next_token_archived_at?: string;
          next_token_version?: string;
          noncurrent_versions?: string;
          prefix_param: string;
          sort_order?: string;
          start_after?: string;
        };
        Returns: {
          archived_at: string;
          created_at: string;
          id: string;
          is_delete_marker: boolean;
          is_versioned: boolean;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
          version: string;
        }[];
      };
      operation: { Args: never; Returns: string };
      search: {
        Args: {
          bucketname: string;
          delete_markers?: string;
          levels?: number;
          limits?: number;
          noncurrent_versions?: string;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          archived_at: string;
          created_at: string;
          id: string;
          is_delete_marker: boolean;
          is_versioned: boolean;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
          version: string;
        }[];
      };
      search_by_timestamp: {
        Args: {
          delete_markers?: string;
          noncurrent_versions?: string;
          p_bucket_id: string;
          p_level: number;
          p_limit: number;
          p_prefix: string;
          p_sort_column: string;
          p_sort_column_after: string;
          p_sort_order: string;
          p_start_after: string;
          p_start_after_version?: string;
        };
        Returns: {
          archived_at: string;
          created_at: string;
          id: string;
          is_delete_marker: boolean;
          is_versioned: boolean;
          key: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
          version: string;
        }[];
      };
      search_v2: {
        Args: {
          bucket_name: string;
          delete_markers?: string;
          levels?: number;
          limits?: number;
          noncurrent_versions?: string;
          prefix: string;
          sort_column?: string;
          sort_column_after?: string;
          sort_order?: string;
          start_after?: string;
          start_after_archived_at?: string;
          start_after_is_continuation?: boolean;
          start_after_version?: string;
        };
        Returns: {
          archived_at: string;
          created_at: string;
          id: string;
          is_delete_marker: boolean;
          is_versioned: boolean;
          key: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
          version: string;
        }[];
      };
    };
    Enums: {
      buckettype: 'STANDARD' | 'ANALYTICS' | 'VECTOR';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      mystic_appointment_status: [
        'pending',
        'confirmed',
        'stylist_en_route',
        'stylist_arrived',
        'door_timer_active',
        'in_progress',
        'completed',
        'canceled',
        'no_show',
      ],
    },
  },
  storage: {
    Enums: {
      buckettype: ['STANDARD', 'ANALYTICS', 'VECTOR'],
    },
  },
} as const;
