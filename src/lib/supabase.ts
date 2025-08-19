import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_images: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          original_image_url: string;
          edited_image_url: string | null;
          edit_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          original_image_url: string;
          edited_image_url?: string | null;
          edit_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          original_image_url?: string;
          edited_image_url?: string | null;
          edit_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};