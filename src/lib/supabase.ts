
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Try to get from environment variables first
let SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
let SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If environment variables are not set, check if we have values from Supabase integration
// This is a fallback mechanism for development
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Log that we're using default values
  console.warn('Supabase environment variables not found, using default configuration');
  
  // You need to replace these with your actual Supabase project URL and anon key
  // from your Supabase project settings
  SUPABASE_URL = 'https://your-project-id.supabase.co';
  SUPABASE_ANON_KEY = 'your-anon-key';
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
