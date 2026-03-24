export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type subscription_status = 'active' | 'canceled' | 'past_due' | 'expired' | 'trialing'
export type plan_type = 'monthly' | 'yearly'
export type draw_status = 'pending' | 'processing' | 'completed' | 'canceled'
export type verification_status = 'pending' | 'approved' | 'rejected'
export type payout_status = 'pending' | 'processing' | 'paid' | 'failed'
export type payment_status = 'active' | 'canceled' | 'past_due' | 'incomplete'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          handicap_index: number | null
          selected_charity_id: string | null
          donation_percent: number
          email_notifications: boolean
          push_notifications: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
          metadata?: Json
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          handicap_index?: number | null
          selected_charity_id?: string | null
          donation_percent?: number
          email_notifications?: boolean
          push_notifications?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          handicap_index?: number | null
          selected_charity_id?: string | null
          donation_percent?: number
          email_notifications?: boolean
          push_notifications?: boolean
          updated_at?: string
          deleted_at?: string | null
          metadata?: Json
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: plan_type
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          status: subscription_status
          payment_status: payment_status
          price_cents: number
          currency: string
          current_period_start: string | null
          current_period_end: string | null
          canceled_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: plan_type
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: subscription_status
          payment_status?: payment_status
          price_cents: number
          currency?: string
          current_period_start?: string | null
          current_period_end?: string | null
          canceled_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: plan_type
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: subscription_status
          payment_status?: payment_status
          price_cents?: number
          currency?: string
          current_period_start?: string | null
          current_period_end?: string | null
          canceled_at?: string | null
          metadata?: Json
          updated_at?: string
        }
      }
      scores: {
        Row: {
          id: string
          user_id: string
          score: number
          course_name: string | null
          tee_name: string | null
          holes_played: number
          front_nine: number | null
          back_nine: number | null
          eagles_or_better: number
          birdies: number
          pars: number
          bogeys: number
          double_bogeys_or_worse: number
          score_date: string
          is_verified: boolean
          proof_image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          course_name?: string | null
          tee_name?: string | null
          holes_played?: number
          front_nine?: number | null
          back_nine?: number | null
          eagles_or_better?: number
          birdies?: number
          pars?: number
          bogeys?: number
          double_bogeys_or_worse?: number
          score_date: string
          is_verified?: boolean
          proof_image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          course_name?: string | null
          tee_name?: string | null
          holes_played?: number
          front_nine?: number | null
          back_nine?: number | null
          eagles_or_better?: number
          birdies?: number
          pars?: number
          bogeys?: number
          double_bogeys_or_worse?: number
          score_date?: string
          is_verified?: boolean
          proof_image_url?: string | null
        }
      }
      charities: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          website_url: string | null
          contact_email: string | null
          minimum_donation_percent: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          contact_email?: string | null
          minimum_donation_percent?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          contact_email?: string | null
          minimum_donation_percent?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      draws: {
        Row: {
          id: string
          draw_number: number
          title: string
          description: string | null
          draw_date: string
          status: draw_status
          prize_pool_cents: number
          currency: string
          jackpot_percent: number
          four_match_percent: number
          three_match_percent: number
          previous_jackpot_rollover: boolean
          rolled_over_amount_cents: number
          executed_at: string | null
          executed_by: string | null
          winning_numbers: Json | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          draw_number?: number
          title: string
          description?: string | null
          draw_date: string
          status?: draw_status
          prize_pool_cents?: number
          currency?: string
          jackpot_percent?: number
          four_match_percent?: number
          three_match_percent?: number
          previous_jackpot_rollover?: boolean
          rolled_over_amount_cents?: number
          executed_at?: string | null
          executed_by?: string | null
          winning_numbers?: Json | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          draw_number?: number
          title?: string
          description?: string | null
          draw_date?: string
          status?: draw_status
          prize_pool_cents?: number
          currency?: string
          jackpot_percent?: number
          four_match_percent?: number
          three_match_percent?: number
          previous_jackpot_rollover?: boolean
          rolled_over_amount_cents?: number
          executed_at?: string | null
          executed_by?: string | null
          winning_numbers?: Json | null
          metadata?: Json
          updated_at?: string
        }
      }
      draw_participations: {
        Row: {
          id: string
          draw_id: string
          user_id: string
          numbers: Json
          match_count: number | null
          prize_amount_cents: number
          is_winner: boolean
          created_at: string
        }
        Insert: {
          id?: string
          draw_id: string
          user_id: string
          numbers: Json
          match_count?: number | null
          prize_amount_cents?: number
          is_winner?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          draw_id?: string
          user_id?: string
          numbers?: Json
          match_count?: number | null
          prize_amount_cents?: number
          is_winner?: boolean
        }
      }
      winnings: {
        Row: {
          id: string
          user_id: string
          draw_id: string
          participation_id: string | null
          match_count: number
          prize_tier: string | null
          gross_amount_cents: number
          charity_deduction_cents: number
          net_amount_cents: number
          payout_status: payout_status
          paid_at: string | null
          verification_status: verification_status
          verification_submitted_at: string | null
          verified_at: string | null
          verified_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          draw_id: string
          participation_id?: string | null
          match_count: number
          prize_tier?: string | null
          gross_amount_cents: number
          charity_deduction_cents?: number
          net_amount_cents: number
          payout_status?: payout_status
          paid_at?: string | null
          verification_status?: verification_status
          verification_submitted_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          draw_id?: string
          participation_id?: string | null
          match_count?: number
          prize_tier?: string | null
          gross_amount_cents?: number
          charity_deduction_cents?: number
          net_amount_cents?: number
          payout_status?: payout_status
          paid_at?: string | null
          verification_status?: verification_status
          verification_submitted_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          updated_at?: string
        }
      }
    }
  }
}
