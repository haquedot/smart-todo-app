import { createClient } from '@supabase/supabase-js'
import { getEnvVars } from './env'

// Get validated environment variables
const { supabaseUrl, supabaseAnonKey } = getEnvVars()

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
