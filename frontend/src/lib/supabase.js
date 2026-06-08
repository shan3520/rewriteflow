import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Warn in dev if credentials are missing
if (import.meta.env.DEV && (!supabaseUrl || supabaseUrl === 'your_supabase_url' || !supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key')) {
  console.warn('⚠️ Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env')
}

export const supabase = createClient(
  supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export const isConfigured = supabaseUrl.startsWith('http') && supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key'
