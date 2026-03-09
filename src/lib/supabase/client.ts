import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://bhimfurjecwcvpgzpjlm.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoaW1mdXJqZWN3Y3ZwZ3pwamxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NjcyODYsImV4cCI6MjA4ODQ0MzI4Nn0.fEnXAJM3AcmQlmg6PfSAxfqf7ePTVJZ171ZIxXweaIA'

const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export default supabase;
