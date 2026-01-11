import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://daopmchzdcumlhirskoq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhb3BtY2h6ZGN1bWxoaXJza29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTMxMDIsImV4cCI6MjA4MzQyOTEwMn0.X1XG-5l8zSRt3pieHVbycdENILdxF9-f2teZL_nmASI";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase as s };
