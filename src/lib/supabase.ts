import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://prtqzvcvcdppnuuzfrmh.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHF6dmN2Y2RwcG51dXpmcm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwODU4MzUsImV4cCI6MjA4NzY2MTgzNX0.k5SiZq0gUehcOAAHxbnP35zo6X5BHDza7hPmeOLsb1o'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function checkDeckAvailability(name: string): Promise<'available' | 'taken'> {
  const clean = name.toLowerCase().trim().replace(/[^a-z0-9-]/g, '')
  if (!clean) return 'taken'
  const { data, error } = await supabase
    .from('dotdeck_registrations')
    .select('id')
    .eq('deck_name', clean)
    .maybeSingle()
  if (error) console.error('availability check error:', error)
  return data ? 'taken' : 'available'
}

export async function claimDeckName(deckName: string, email: string, tier: 'deck' | 'studio' = 'deck'): Promise<{ success: boolean; error?: string }> {
  const clean = deckName.toLowerCase().trim().replace(/[^a-z0-9-]/g, '')
  if (!clean || !email) return { success: false, error: 'Invalid input' }
  const { error } = await supabase
    .from('dotdeck_registrations')
    .insert({
      deck_name: clean,
      email: email.trim().toLowerCase(),
      tier,
      status: 'pending',
    })
  if (error) {
    if (error.code === '23505') return { success: false, error: 'Name already taken' }
    return { success: false, error: error.message }
  }
  return { success: true }
}
