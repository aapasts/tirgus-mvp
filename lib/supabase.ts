import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side client (for API routes, server components)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Browser client (for client components with auth)
export const createClient_browser = () => createBrowserClient(supabaseUrl, supabaseKey)
