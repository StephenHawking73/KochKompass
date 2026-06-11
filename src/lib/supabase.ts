import {createClient} from '@supabase/supabase-js';

const supabaseUrl = "https://wsyrqjutprlnrohvmlzm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzeXJxanV0cHJsbnJvaHZtbHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNDYxMjcsImV4cCI6MjA5NTcyMjEyN30.LbZCGKOPGhoThmiCj3QqrndGl0XRm9z3zOhIWuRSNaQ";

export const supabase = createClient(supabaseUrl, supabaseKey);