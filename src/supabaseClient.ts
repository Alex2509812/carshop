import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ibvdznebtanxcvjzumkm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlidmR6bmVidGFueGN2anp1bWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNDAyMzksImV4cCI6MjA4NzkxNjIzOX0.lHEBbsV8qzJiH2YqCHoOfiBPlTQmjYSmSju3bLSV7p8';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});