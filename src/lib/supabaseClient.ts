// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oqabvdjcmbcdpqkomcjb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYWJ2ZGpjbWJjZHBxa29tY2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwODQ4NDAsImV4cCI6MjA2NTY2MDg0MH0.08Q6cZ7SYDPotGTaKadm1aBO3ogsE6bHZoYxlwHHDyc';

export const supabase = createClient(supabaseUrl, supabaseKey);
