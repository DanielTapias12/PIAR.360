import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zjfyljjabwfalxlccart.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZnlsamphYndmYWx4bGNjYXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNTI0NjMsImV4cCI6MjA3ODgyODQ2M30.WRs1sURNhErmAeKHn05-qL_zD0vtGZXh0NEdCdamLiY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
