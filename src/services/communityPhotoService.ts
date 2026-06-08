import { supabase } from '@/lib/supabase'
import type { CommunityPhoto } from '@/types/database'

export async function getCommunityPhotos(announcementId: string): Promise<CommunityPhoto[]> {
  const { data, error } = await supabase
    .from('community_photos')
    .select('*, profiles(display_name, username)')
    .eq('announcement_id', announcementId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as CommunityPhoto[]
}

export async function getAllCommunityPhotos(announcementId: string): Promise<CommunityPhoto[]> {
  const { data, error } = await supabase
    .from('community_photos')
    .select('*, profiles(display_name, username)')
    .eq('announcement_id', announcementId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as CommunityPhoto[]
}

export interface SubmitMemoryInput {
  announcementId: string
  uploaderId: string | null
  guestName?: string
  file: File
  caption?: string
}

export async function submitCommunityPhoto(input: SubmitMemoryInput): Promise<CommunityPhoto> {
  const ext = input.file.name.split('.').pop() ?? 'jpg'
  const folder = input.uploaderId ?? 'guest'
  const path = `community/${input.announcementId}/${folder}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('deceased-images')
    .upload(path, input.file, { upsert: false })
  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('deceased-images')
    .getPublicUrl(path)

  const { data, error } = await supabase
    .from('community_photos')
    .insert({
      announcement_id: input.announcementId,
      uploader_id:     input.uploaderId ?? null,
      guest_name:      input.guestName  ?? null,
      url:             publicUrl,
      storage_path:    path,
      caption:         input.caption    ?? null,
      status:          'pending',
    })
    .select('*, profiles(display_name, username)')
    .single()
  if (error) throw error
  return data as CommunityPhoto
}

export async function updateCommunityPhotoStatus(
  id: string,
  status: 'approved' | 'rejected',
): Promise<void> {
  const { error } = await supabase
    .from('community_photos')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCommunityPhoto(id: string, storagePath: string): Promise<void> {
  await supabase.storage.from('deceased-images').remove([storagePath])
  const { error } = await supabase.from('community_photos').delete().eq('id', id)
  if (error) throw error
}
