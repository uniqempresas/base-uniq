import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eqyvicudbrfwjynlbtie.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeXZpY3VkYnJmd2p5bmxidGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzMwOTcsImV4cCI6MjA5MDMwOTA5N30.TeWVr5SUxXAmbmWresVTaZMUQapA0O16dAK6Z2due8w";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
