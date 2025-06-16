export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      activity_log: {
        Row: {
          id: number;
          activity_name: string;
          user: string;
          it: string;
          status: string;
          duration: string | null;
          created_at: string;
        };
        Insert: {
          activity_name: string;
          user: string;
          it: string;
          status: string;
          duration?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          activity_name: string;
          user: string;
          it: string;
          status: string;
          duration: string | null;
          created_at: string;
        }>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
