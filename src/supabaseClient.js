import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wmnmoislfwzvtnozamzs.supabase.co";
const SUPABASE_KEY = "sb_publishable_fr3nqvFxgy-dRm6JV-1SUw_lFxYAeUA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
