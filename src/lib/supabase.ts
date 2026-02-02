import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

/** True when real Supabase URL and anon key are set (not the placeholder). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes('placeholder') &&
      supabaseAnonKey !== 'placeholder-anon-key',
  );
}

let supabaseInstance: SupabaseClient;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    supabaseInstance = createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
  }
} catch {
  supabaseInstance = createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
}

export const supabase = supabaseInstance;
