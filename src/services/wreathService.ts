import { supabase } from '@/lib/supabase'
import type { WreathPlacement } from '@/types/database'

export async function getWreathPlacements(announcementId: string): Promise<WreathPlacement[]> {
  const { data, error } = await supabase
    .from('wreath_placements')
    .select('*, profiles:user_id (display_name, username)')
    .eq('announcement_id', announcementId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as WreathPlacement[]
}

export async function placeWreath(input: {
  announcement_id: string
  user_id: string | null
  guest_name?: string
  wreath_type: string
}): Promise<WreathPlacement> {
  const { data, error } = await supabase
    .from('wreath_placements')
    .insert({
      announcement_id: input.announcement_id,
      user_id: input.user_id,
      guest_name: input.guest_name ?? null,
      wreath_type: input.wreath_type,
    })
    .select('*, profiles:user_id (display_name, username)')
    .single()
  if (error) throw error
  return data as WreathPlacement
}

export async function removeWreath(id: string): Promise<void> {
  const { error } = await supabase.from('wreath_placements').delete().eq('id', id)
  if (error) throw error
}
