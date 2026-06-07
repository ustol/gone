import { supabase } from '@/lib/supabase'
import { generateSlug } from '@/lib/utils'
import type { Announcement, AnnouncementWithProfile, AnnouncementPhoto } from '@/types/database'

export interface CreateAnnouncementInput {
  surname: string
  first_name: string
  other_names?: string
  date_of_birth?: string
  date_of_death: string
  place_of_death: string
  short_message: string
  image_file?: File
  moderation_mode: 'auto' | 'manual'
  tribute_access: 'registered' | 'visitors'
}

async function uploadImage(file: File, creatorId: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${creatorId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('deceased-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('deceased-images').getPublicUrl(path)
  return data.publicUrl
}

export async function createAnnouncement(
  input: CreateAnnouncementInput,
  creatorId: string
): Promise<Announcement> {
  let image_url: string | null = null
  if (input.image_file) {
    image_url = await uploadImage(input.image_file, creatorId)
  }

  const baseSlug = generateSlug(`${input.surname} ${input.first_name}`)
  const slug = `${baseSlug}-${Date.now()}`

  const { data, error } = await supabase
    .from('announcements')
    .insert({
      slug,
      creator_id: creatorId,
      surname: input.surname.trim(),
      first_name: input.first_name.trim(),
      other_names: input.other_names?.trim() || null,
      date_of_birth: input.date_of_birth || null,
      date_of_death: input.date_of_death,
      place_of_death: input.place_of_death.trim(),
      short_message: input.short_message.trim(),
      image_url,
      moderation_mode: input.moderation_mode,
      tribute_access: input.tribute_access,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAnnouncement(slug: string): Promise<AnnouncementWithProfile> {
  const { data, error } = await supabase
    .from('announcements')
    .select(`*, profiles:creator_id (username, display_name, avatar_url)`)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error) throw error
  return data as AnnouncementWithProfile
}

export async function listAnnouncements(page = 1, pageSize = 12): Promise<{
  data: AnnouncementWithProfile[]
  count: number
}> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await supabase
    .from('announcements')
    .select(`*, profiles:creator_id (username, display_name, avatar_url)`, { count: 'exact' })
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { data: (data ?? []) as AnnouncementWithProfile[], count: count ?? 0 }
}

export async function listMyAnnouncements(creatorId: string): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function updateModerationMode(
  id: string,
  mode: 'auto' | 'manual'
): Promise<void> {
  const { error } = await supabase
    .from('announcements')
    .update({ moderation_mode: mode })
    .eq('id', id)
  if (error) throw error
}

export interface UpdateAnnouncementInput {
  surname: string
  first_name: string
  other_names?: string
  date_of_birth?: string
  date_of_death: string
  place_of_death: string
  short_message: string
  image_file?: File
  moderation_mode: 'auto' | 'manual'
  tribute_access: 'registered' | 'visitors'
}

export async function updateAnnouncement(
  id: string,
  input: UpdateAnnouncementInput,
  creatorId: string
): Promise<Announcement> {
  let image_url: string | undefined
  if (input.image_file) {
    image_url = await uploadImage(input.image_file, creatorId)
  }

  const { data, error } = await supabase
    .from('announcements')
    .update({
      surname: input.surname.trim(),
      first_name: input.first_name.trim(),
      other_names: input.other_names?.trim() || null,
      date_of_birth: input.date_of_birth || null,
      date_of_death: input.date_of_death,
      place_of_death: input.place_of_death.trim(),
      short_message: input.short_message.trim(),
      moderation_mode: input.moderation_mode,
      tribute_access: input.tribute_access,
      updated_at: new Date().toISOString(),
      ...(image_url ? { image_url } : {}),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getGalleryPhotos(announcementId: string): Promise<AnnouncementPhoto[]> {
  const { data, error } = await supabase
    .from('announcement_photos')
    .select('*')
    .eq('announcement_id', announcementId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addGalleryPhoto(
  announcementId: string,
  file: File,
  creatorId: string,
  caption?: string
): Promise<AnnouncementPhoto> {
  const ext = file.name.split('.').pop()
  const path = `${creatorId}/gallery/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('deceased-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage.from('deceased-images').getPublicUrl(path)

  const { data, error } = await supabase
    .from('announcement_photos')
    .insert({ announcement_id: announcementId, url: publicUrl, storage_path: path, caption: caption || null, uploaded_by: creatorId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteGalleryPhoto(photoId: string, storagePath: string): Promise<void> {
  await supabase.storage.from('deceased-images').remove([storagePath])
  const { error } = await supabase.from('announcement_photos').delete().eq('id', photoId)
  if (error) throw error
}

export async function searchAnnouncements(query: string): Promise<AnnouncementWithProfile[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select(`*, profiles:creator_id (username, display_name, avatar_url)`)
    .eq('is_published', true)
    .or(
      `surname.ilike.%${query}%,first_name.ilike.%${query}%,other_names.ilike.%${query}%,place_of_death.ilike.%${query}%`
    )
    .order('date_of_death', { ascending: false })
    .limit(20)
  if (error) throw error
  return (data ?? []) as AnnouncementWithProfile[]
}
