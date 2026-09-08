import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://krrkfgvdwhpelxtrdtla.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtycmtmZ3Zkd2hwZWx4dHJkdGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTk3MDUsImV4cCI6MjA3OTU5NTcwNX0.XXi_OHf7pZm7TaejNTMAB9CmUnhm9jH-0aYqkzMDJFw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
