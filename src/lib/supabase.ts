import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  plan: 'free' | 'pro'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  files_organized_count: number
  created_at: string
  updated_at: string
}

export type FileRow = {
  id: string
  user_id: string
  original_name: string
  original_path: string | null
  suggested_folder: string | null
  suggested_name: string | null
  file_type: string | null
  file_size: number | null
  mime_type: string | null
  status: 'pending' | 'organized' | 'skipped'
  source: 'upload' | 'google_drive'
  google_drive_file_id: string | null
  ai_analysis: Record<string, unknown> | null
  created_at: string
  updated_at: string
}
