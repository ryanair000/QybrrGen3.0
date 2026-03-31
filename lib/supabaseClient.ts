import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && process.env.NODE_ENV !== 'production') {
  console.warn(
    'Supabase environment variables are missing. Auth features will stay disabled until NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
