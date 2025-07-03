import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          explanation: string | null
          completed: boolean
          created_at: string
          updated_at: string
          due_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          explanation?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          explanation?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
      }
    }
  }
}
