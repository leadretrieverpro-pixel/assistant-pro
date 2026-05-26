import { createClient } from "@supabase/supabase-js";

// ✅ Your Supabase project URL
const supabaseUrl = "https://kcjltahzpbmfxlgzmjfh.supabase.co";

// ✅ Your Supabase anon/public key (PASTE YOUR REAL KEY HERE)
const supabaseAnonKey = "sb_publishable_oxriwbhCadEgDzt6aNPbGA_WosB1ycm";

// ✅ Create client (this connects your app to Supabase)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);