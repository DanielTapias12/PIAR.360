import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zofyivejsxpxumtneduz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZnlpdmVqc3hweHVtdG5lZHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyOTI5MDAsImV4cCI6MjA3ODg2ODkwMH0.TLPW5G31T9v7ssKwwpf4aqG-v4OJEratx2sVrFWlUnE';

// In a real-world app, these would be in environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
