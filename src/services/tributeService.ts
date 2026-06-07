import { supabase } from '@/lib/supabase'
import type { TributeWithProfile } from '@/types/database'

export async function getTributes(
  announcementId: string,
  status: 'approved' | 'pending' | 'rejected' = 'approved'
): Promise<TributeWithProfile[]> {
  const { data, error } = await supabase
    .from('tributes')
    .select(`*, profiles:author_id (id, username, display_name, avatar_url)`)
    .eq('announcement_id', announcementId)
    .eq('status', status)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as TributeWithProfile[]
}

export async function getAllTributesForOwner(announcementId: string): Promise<TributeWithProfile[]> {
  const { data, error } = await supabase
    .from('tributes')
    .select(`*, profiles:author_id (id, username, display_name, avatar_url)`)
    .eq('announcement_id', announcementId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as TributeWithProfile[]
}

export async function submitTribute(input: {
  announcement_id: string
  author_id: string | null
  guest_name?: string
  type: 'tribute' | 'condolence'
  message: string
  auto_approve: boolean
}): Promise<void> {
  // Visitor posts and announcements that allow visitors always go to pending
  const status = input.auto_approve && input.author_id ? 'approved' : 'pending'

  const { error } = await supabase.from('tributes').insert({
    announcement_id: input.announcement_id,
    author_id: input.author_id,
    guest_name: input.guest_name ?? null,
    type: input.type,
    message: input.message,
    status,
  })
  if (error) throw error

  const { data: ann } = await supabase
    .from('announcements')
    .select('creator_id, first_name, surname')
    .eq('id', input.announcement_id)
    .single()

  if (ann && ann.creator_id !== input.author_id) {
    await supabase.from('notifications').insert({
      user_id: ann.creator_id,
      type: input.type === 'tribute' ? 'new_tribute' : 'new_condolence',
      title: `New ${input.type}`,
      body: `${input.guest_name ?? 'Someone'} left a ${input.type} for ${ann.first_name} ${ann.surname}.`,
      related_announcement_id: input.announcement_id,
    })
  }
}

export async function updateTributeStatus(
  id: string,
  status: 'approved' | 'rejected',
  authorId: string | null,
  announcementId: string
): Promise<void> {
  const { error } = await supabase.from('tributes').update({ status }).eq('id', id)
  if (error) throw error

  // Guest posts have no account to notify
  if (!authorId) return

  const notifType = status === 'approved' ? 'tribute_approved' : 'tribute_rejected'
  await supabase.from('notifications').insert({
    user_id: authorId,
    type: notifType,
    title: status === 'approved' ? 'Your tribute was approved' : 'Your tribute was not approved',
    body: status === 'approved'
      ? 'Your tribute is now visible on the announcement.'
      : 'Your tribute was reviewed and was not approved.',
    related_announcement_id: announcementId,
  })
}

export async function deleteTribute(id: string): Promise<void> {
  const { error } = await supabase.from('tributes').delete().eq('id', id)
  if (error) throw error
}
