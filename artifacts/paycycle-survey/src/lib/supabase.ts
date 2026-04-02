import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SurveyResult = {
  id: number;
  created_at: string;
  major: string;
  pay_frequency: string;
  balance_check_frequency: string;
  priorities: string[];
  end_cycle_anxiety: number;
  financial_challenge: string;
};

export type SurveyInsert = Omit<SurveyResult, "id" | "created_at">;
