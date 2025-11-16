import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbenohdaphgwzznwsckm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZW5vaGRhcGhnd3p6bndzY2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjEzOTIsImV4cCI6MjA3ODgzNzM5Mn0.BhDzfutuV5xB_iNqGNji6ZoGwbr_pgkDddprPEidSXE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
