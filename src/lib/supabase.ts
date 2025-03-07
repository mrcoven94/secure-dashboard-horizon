
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://txzafiuajwjsjqbpplqo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4emFmaXVhandqc2pxYnBwbHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MTI0OTQsImV4cCI6MjA1NTk4ODQ5NH0.G22NRiTLQrL8zzBNwhLQwSWM9vwasF1-QFyLPAQ7Epk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
