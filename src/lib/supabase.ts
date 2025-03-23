
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// For Lovable's Supabase integration
const SUPABASE_URL = 'https://zedgpkdjfpdlsyfkmnnt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZGdwa2RqZnBkbHN5Zmttbm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTcxMDAyMzcsImV4cCI6MjAxMjY3NjIzN30.Iq96ASfbDuIoVvPgCqRTrGiiBg1u0iJmUMpXB_IR3S0';

// Remove the error check since we're using hardcoded values
// if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
//   throw new Error('Missing Supabase credentials');
// }

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
