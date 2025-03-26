export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      decks: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      flashcards: {
        Row: {
          id: string
          front: string
          verse: string
          sentence: string
          deck_id: string
          user_id: string
          created_at: string
          last_reviewed: string | null
          next_review: string
          review_count: number
          confidence: number
        }
        Insert: {
          id?: string
          front: string
          verse: string
          sentence: string
          deck_id: string
          user_id: string
          created_at?: string
          last_reviewed?: string | null
          next_review?: string
          review_count?: number
          confidence?: number
        }
        Update: {
          id?: string
          front?: string
          verse?: string
          sentence?: string
          deck_id?: string
          user_id?: string
          created_at?: string
          last_reviewed?: string | null
          next_review?: string
          review_count?: number
          confidence?: number
        }
      }
    }
  }
}